import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';

// VAPID public key - in production, this should come from environment variables
// For now, we'll generate one on the server side
const VAPID_PUBLIC_KEY = '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
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

export function usePushNotifications() {
  const { isAuthenticated } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  const subscribeMutation = trpc.notifications.subscribePush.useMutation();
  const unsubscribeMutation = trpc.notifications.unsubscribePush.useMutation();

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 
        'serviceWorker' in navigator && 
        'PushManager' in window && 
        'Notification' in window;
      
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        
        // Check if already subscribed
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      }
    };

    checkSupport();
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('ログインが必要です');
      return false;
    }

    if (!isSupported) {
      toast.error('お使いのブラウザはプッシュ通知に対応していません');
      return false;
    }

    setIsLoading(true);

    try {
      // Request permission if not granted
      if (permission !== 'granted') {
        const result = await requestPermission();
        if (result !== 'granted') {
          toast.error('通知の許可が必要です');
          setIsLoading(false);
          return false;
        }
      }

      // Register service worker
      const registration = await registerServiceWorker();
      await navigator.serviceWorker.ready;

      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        // Note: In production, you would need a valid VAPID key
        // For now, we'll skip the actual push subscription and just store the intent
        toast.info('プッシュ通知の設定が完了しました（デモモード）');
        setIsSubscribed(true);
        setIsLoading(false);
        return true;
      }

      // Send subscription to server
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');

      if (p256dh && auth) {
        const p256dhArray = new Uint8Array(p256dh);
        const authArray = new Uint8Array(auth);
        await subscribeMutation.mutateAsync({
          endpoint: subscription.endpoint,
          p256dh: btoa(String.fromCharCode.apply(null, Array.from(p256dhArray))),
          auth: btoa(String.fromCharCode.apply(null, Array.from(authArray))),
          userAgent: navigator.userAgent,
        });
      }

      setIsSubscribed(true);
      toast.success('プッシュ通知を有効にしました');
      return true;
    } catch (error) {
      console.error('Push subscription error:', error);
      toast.error('プッシュ通知の設定に失敗しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isSupported, permission, requestPermission, registerServiceWorker, subscribeMutation]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Remove from server
        await unsubscribeMutation.mutateAsync({
          endpoint: subscription.endpoint,
        });
      }

      setIsSubscribed(false);
      toast.success('プッシュ通知を無効にしました');
      return true;
    } catch (error) {
      console.error('Push unsubscription error:', error);
      toast.error('プッシュ通知の解除に失敗しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [unsubscribeMutation]);

  // Toggle subscription
  const toggle = useCallback(async () => {
    if (isSubscribed) {
      return unsubscribe();
    } else {
      return subscribe();
    }
  }, [isSubscribed, subscribe, unsubscribe]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    toggle,
    requestPermission,
  };
}
