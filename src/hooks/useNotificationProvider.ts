import { useMemo, useEffect } from 'react';
import { NotificationProvider } from '../lib/notifications/provider';
import { BrowserNotificationProvider } from '../lib/notifications/browser-provider';
import { FirebaseNotificationProvider } from '../lib/notifications/firebase-provider';

export function useNotificationProvider(): NotificationProvider {
  const provider = useMemo(() => {
    const mode = process.env.NEXT_PUBLIC_NOTIFICATION_PROVIDER;
    if (mode === 'firebase') {
      return new FirebaseNotificationProvider();
    }
    return new BrowserNotificationProvider();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      provider.stop();
    };
  }, [provider]);

  return provider;
}
