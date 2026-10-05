import { API_BASE_URL } from '@/lib/api';
import { NotificationProvider, NotificationCallbacks } from './provider';

export class BrowserNotificationProvider implements NotificationProvider {
  public readonly type = 'browser';
  private intervalId: NodeJS.Timeout | null = null;
  private callbacks: NotificationCallbacks | null = null;
  private prevCount = 0;

  public start(callbacks: NotificationCallbacks): void {
    this.callbacks = callbacks;
    this.fetchUnreadCount();
    this.intervalId = setInterval(() => this.fetchUnreadCount(), 30_000);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.callbacks = null;
  }

  private async fetchUnreadCount() {
    if (!this.callbacks) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        credentials: 'include',
      });
      if (!res.ok) return;
      
      const data = await res.json();
      const count = data.count ?? 0;
      
      if (count > this.prevCount) {
        if (this.callbacks.onNewNotification) {
          this.callbacks.onNewNotification({ count });
        }
      }
      
      this.prevCount = count;
      this.callbacks.onUnreadCountChange(count);
    } catch {
      // Silently fail - non-critical
    }
  }
}
