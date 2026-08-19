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

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      window.__pwaInstallEvent = e
      setInstallPrompt(e)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      window.__pwaInstalled = true
      setIsInstalled(true)
      setInstallPrompt(null)
      setIsInstallable(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = useCallback(async () => {
    const promptEvent = installPrompt || window.__pwaInstallEvent
    if (!promptEvent) return

    promptEvent.prompt()
    const choiceResult = await promptEvent.userChoice

    if (choiceResult.outcome === 'accepted') {
      setIsInstalled(true)
      setInstallPrompt(null)
      window.__pwaInstallEvent = null
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
      .catch(() => {
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

export function useNotifications() {
  const [notificationPermission, setNotificationPermission] = useState(null)
  const [isPushSupported, setIsPushSupported] = useState(false)
  const [isPushSubscribed, setIsPushSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkNotifications = async () => {
      setLoading(true)

      if ('Notification' in window) {
        setNotificationPermission(Notification.permission)
      }

      const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window
      setIsPushSupported(pushSupported)

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

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
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