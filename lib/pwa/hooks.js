'use client'

import { useEffect, useState, useCallback } from 'react'
import { PWA_CONSTANTS } from './constants'
import {
  requestNotificationPermission,
  showLocalNotification,
  subscribeToPushNotifications,
  getPushSubscription,
  unsubscribePushNotifications,
} from './notifications'

/**
 * Hook to manage PWA installation
 */
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      setIsInstallable(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    if (!installPrompt) return

    installPrompt.prompt()
    const choiceResult = await installPrompt.userChoice

    if (choiceResult.outcome === 'accepted') {
      setIsInstalled(true)
      setInstallPrompt(null)
      setIsInstallable(false)
    }
  }, [installPrompt])

  return {
    installPrompt,
    isInstallable,
    isInstalled,
    install,
  }
}

/**
 * Hook to manage service worker registration
 */
export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setIsSupported(false)
      setLoading(false)
      return
    }

    setIsSupported(true)

    navigator.serviceWorker
      .register(PWA_CONSTANTS.SW_PATH)
      .then((reg) => {
        setRegistration(reg)
        setIsRegistered(true)
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
        setIsRegistered(false)
      })
      .finally(() => setLoading(false))
  }, [])

  const unregister = useCallback(async () => {
    if (registration) {
      await registration.unregister()
      setIsRegistered(false)
      setRegistration(null)
    }
  }, [registration])

  return {
    isSupported,
    isRegistered,
    registration,
    loading,
    unregister,
  }
}

/**
 * Hook to manage notifications
 */
export function useNotifications() {
  const [notificationPermission, setNotificationPermission] = useState(null)
  const [isPushSupported, setIsPushSupported] = useState(false)
  const [isPushSubscribed, setIsPushSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkNotifications = async () => {
      setLoading(true)

      // Check notification permission
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission)
      }

      // Check push support
      const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window
      setIsPushSupported(pushSupported)

      // Check if already subscribed
      if (pushSupported) {
        const subscription = await getPushSubscription()
        setIsPushSubscribed(!!subscription)
      }

      setLoading(false)
    }

    checkNotifications()
  }, [])

  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      setNotificationPermission('granted')
    }
    return granted
  }, [])

  const sendNotification = useCallback(async (options) => {
    if (notificationPermission !== 'granted') {
      await requestPermission()
    }
    return showLocalNotification(options)
  }, [notificationPermission, requestPermission])

  const subscribeToPush = useCallback(
    async (vapidKey) => {
      if (!isPushSupported) return null
      const subscription = await subscribeToPushNotifications(vapidKey)
      setIsPushSubscribed(!!subscription)
      return subscription
    },
    [isPushSupported]
  )

  const unsubscribeFromPush = useCallback(async () => {
    const result = await unsubscribePushNotifications()
    setIsPushSubscribed(!result)
    return result
  }, [])

  return {
    notificationPermission,
    isPushSupported,
    isPushSubscribed,
    loading,
    requestPermission,
    sendNotification,
    subscribeToPush,
    unsubscribeFromPush,
  }
}

/**
 * Hook to manage offline status
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline }
}