import { getToken, onMessage } from 'firebase/messaging';
import { API_BASE_URL } from '@/lib/api';
import { NotificationProvider, NotificationCallbacks } from './provider';
import { BrowserNotificationProvider } from './browser-provider';
import { getFirebaseMessaging, firebaseConfig } from './firebase-config';

export class FirebaseNotificationProvider implements NotificationProvider {
  public readonly type = 'firebase';
  private fallbackProvider: BrowserNotificationProvider | null = null;
  private unsubscribeFromMessages: (() => void) | null = null;
  private callbacks: NotificationCallbacks | null = null;

  public async start(callbacks: NotificationCallbacks): Promise<void> {
    this.callbacks = callbacks;
    try {
      const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      if (!isSupported) {
        throw new Error('Push notifications not supported in this browser');
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      await this.registerServiceWorker();
      const messaging = getFirebaseMessaging();
      
      if (!messaging) {
        throw new Error('Firebase messaging not initialized');
      }

      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (!token) {
        throw new Error('No registration token available');
      }

      await this.registerTokenWithBackend(token);
      this.listenForMessages(messaging);
      
      this.fetchInitialUnreadCount();

    } catch (error) {
      console.warn('[CardMax] Firebase push failed, falling back to polling:', error);
      this.fallbackToBrowser(callbacks);
    }
  }

  public stop(): void {
    if (this.unsubscribeFromMessages) {
      this.unsubscribeFromMessages();
      this.unsubscribeFromMessages = null;
    }
    if (this.fallbackProvider) {
      this.fallbackProvider.stop();
    }
    this.callbacks = null;
  }

  private async requestPermission(): Promise<NotificationPermission> {
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    if (Notification.permission === 'denied') {
      return 'denied';
    }
    return await Notification.requestPermission();
  }

  private async registerServiceWorker(): Promise<void> {
    const swUrl = new URL('/firebase-messaging-sw.js', window.location.href);
    swUrl.searchParams.set('apiKey', firebaseConfig.apiKey || '');
    swUrl.searchParams.set('authDomain', firebaseConfig.authDomain || '');
    swUrl.searchParams.set('projectId', firebaseConfig.projectId || '');
    swUrl.searchParams.set('storageBucket', firebaseConfig.storageBucket || '');
    swUrl.searchParams.set('messagingSenderId', firebaseConfig.messagingSenderId || '');
    swUrl.searchParams.set('appId', firebaseConfig.appId || '');

    await navigator.serviceWorker.register(swUrl.toString());
  }

  private async registerTokenWithBackend(token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/device-tokens/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        token,
        platform: 'web',
        provider: 'fcm',
        environment: process.env.NODE_ENV || 'development'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to register token with backend');
    }
  }

  private listenForMessages(messaging: any): void {
    this.unsubscribeFromMessages = onMessage(messaging, (payload) => {
      if (this.callbacks) {
        if (this.callbacks.onNewNotification) {
          this.callbacks.onNewNotification(payload);
        }
        this.fetchInitialUnreadCount(); 
      }
    });
  }

  private async fetchInitialUnreadCount() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        this.callbacks?.onUnreadCountChange(data.count ?? 0);
      }
    } catch {
      // Ignored
    }
  }

  private fallbackToBrowser(callbacks: NotificationCallbacks): void {
    this.fallbackProvider = new BrowserNotificationProvider();
    this.fallbackProvider.start(callbacks);
  }
}
