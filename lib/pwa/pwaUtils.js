/**
 * Check if PWA is supported by browser
 */
export function isPWASupported() {
  return (
    'serviceWorker' in navigator &&
    'caches' in window &&
    'indexedDB' in window
  )
}

/**
 * Check if app is running in standalone mode (installed)
 */
export function isAppStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
}

/**
 * Get device info
 */
export function getDeviceInfo() {
  const ua = navigator.userAgent
  const isMobile = /Mobile|Android|iPhone/i.test(ua)
  const isTablet = /Tablet|iPad/i.test(ua)

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    userAgent: ua,
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches() {
  const cacheNames = await caches.keys()
  return Promise.all(cacheNames.map((name) => caches.delete(name)))
}

/**
 * Get storage info
 */
export async function getStorageInfo() {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null
  }

  try {
    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentUsed: Math.round((estimate.usage / estimate.quota) * 100),
    }
  } catch (error) {
    console.error('Failed to get storage info:', error)
    return null
  }
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage() {
  if (!navigator.storage || !navigator.storage.persist) {
    return false
  }

  try {
    return await navigator.storage.persist()
  } catch (error) {
    console.error('Failed to request persistent storage:', error)
    return false
  }
}