export interface NotificationPermissionState {
  permission: NotificationPermission;
  supported: boolean;
}

export class PushNotificationManager {
  private vapidPublicKey: string = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with your VAPID key

  async getPermissionState(): Promise<NotificationPermissionState> {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    
    return {
      permission: supported ? Notification.permission : 'denied',
      supported
    };
  }

  async requestPermission(): Promise<NotificationPermission> {
    const { supported } = await this.getPermissionState();
    
    if (!supported) {
      throw new Error('Push notifications are not supported in this browser');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    const permission = await this.requestPermission();
    
    if (permission !== 'granted') {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;
    
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Send subscription to your server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const success = await subscription.unsubscribe();
      if (success) {
        await this.removeSubscriptionFromServer(subscription);
      }
      return success;
    }
    
    return true;
  }

  async getSubscription(): Promise<PushSubscription | null> {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  }

  async showLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    const permission = await this.getPermissionState();
    
    if (permission.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options
    });
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // Replace with your server endpoint
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.warn('Failed to send subscription to server:', error);
      // Store locally for later sync
      localStorage.setItem('pendingPushSubscription', JSON.stringify(subscription.toJSON()));
    }
  }

  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });
    } catch (error) {
      console.warn('Failed to remove subscription from server:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const pushNotificationManager = new PushNotificationManager();

export const usePushNotifications = () => {
  const requestPermission = () => pushNotificationManager.requestPermission();
  const subscribe = () => pushNotificationManager.subscribeToPush();
  const unsubscribe = () => pushNotificationManager.unsubscribeFromPush();
  const getPermissionState = () => pushNotificationManager.getPermissionState();
  const showNotification = (title: string, options?: NotificationOptions) => 
    pushNotificationManager.showLocalNotification(title, options);

  return {
    requestPermission,
    subscribe,
    unsubscribe,
    getPermissionState,
    showNotification
  };
};