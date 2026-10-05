export interface NotificationCallbacks {
  onUnreadCountChange: (count: number) => void;
  onNewNotification?: (notification: any) => void;
}

export interface NotificationProvider {
  /** Start the notification mechanism (polling or FCM listener) */
  start(callbacks: NotificationCallbacks): void | Promise<void>;

  /** Stop / cleanup the mechanism */
  stop(): void | Promise<void>;

  /** Provider type for debugging */
  readonly type: 'browser' | 'firebase';
}
