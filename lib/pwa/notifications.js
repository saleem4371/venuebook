import { PWA_CONSTANTS, NOTIFICATION_TYPES } from './constants'

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

/**
 * Show local notification
 */
export function showLocalNotification(options = {}) {
  const {
    title = 'Notification',
    body = '',
    icon = PWA_CONSTANTS.NOTIFICATION_ICON,
    badge = PWA_CONSTANTS.NOTIFICATION_BADGE,
    tag = PWA_CONSTANTS.NOTIFICATION_TAG,
    requireInteraction = false,
    actions = [],
    data = {},
  } = options

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted')
    return null
  }

  const notification = new Notification(title, {
    body,
    icon,
    badge,
    tag,
    requireInteraction,
    actions,
    data,
  })

  return notification
}

/**
 * Send push notification via service worker
 */
export async function sendPushNotification(options = {}) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(options.title || 'Notification', {
      body: options.body || '',
      icon: options.icon || PWA_CONSTANTS.NOTIFICATION_ICON,
      badge: options.badge || PWA_CONSTANTS.NOTIFICATION_BADGE,
      tag: options.tag || PWA_CONSTANTS.NOTIFICATION_TAG,
      requireInteraction: options.requireInteraction || false,
      actions: options.actions || [],
      data: options.data || {},
    })
  } catch (error) {
    console.error('Failed to send push notification:', error)
    throw error
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(vapidKey) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })
    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    throw error
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribePushNotifications() {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      return true
    }
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
  }

  return false
}

/**
 * Get current push subscription
 */
export async function getPushSubscription() {
  if (!('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch (error) {
    console.error('Failed to get push subscription:', error)
    return null
  }
}

/**
 * Convert VAPID key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)))
}

/**
 * Show typed notification
 */
export function showTypedNotification(type, title, body, options = {}) {
  const typeColors = {
    [NOTIFICATION_TYPES.INFO]: { icon: 'ℹ️', color: '#3498db' },
    [NOTIFICATION_TYPES.SUCCESS]: { icon: '✅', color: '#2ecc71' },
    [NOTIFICATION_TYPES.ERROR]: { icon: '❌', color: '#e74c3c' },
    [NOTIFICATION_TYPES.WARNING]: { icon: '⚠️', color: '#f39c12' },
  }

  const typeConfig = typeColors[type] || typeColors[NOTIFICATION_TYPES.INFO]

  return showLocalNotification({
    title: `${typeConfig.icon} ${title}`,
    body,
    ...options,
  })
}