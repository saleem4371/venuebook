import { PWA_CONSTANTS, NOTIFICATION_TYPES } from './constants'

export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
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

  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
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

export async function sendPushNotification(options = {}) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
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
    throw error
  }
}

export async function subscribeToPushNotifications(vapidKey) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
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
    throw error
  }
}

export async function unsubscribePushNotifications() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      return true
    }
  } catch {
    return false
  }

  return false
}

export async function getPushSubscription() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch {
    return null
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)))
}

export function showTypedNotification(type, title, body, options = {}) {
  const typeIcons = {
    [NOTIFICATION_TYPES.INFO]: 'ℹ️',
    [NOTIFICATION_TYPES.SUCCESS]: '✅',
    [NOTIFICATION_TYPES.ERROR]: '❌',
    [NOTIFICATION_TYPES.WARNING]: '⚠️',
  }

  const icon = typeIcons[type] || typeIcons[NOTIFICATION_TYPES.INFO]

  return showLocalNotification({
    title: `${icon} ${title}`,
    body,
    ...options,
  })
}