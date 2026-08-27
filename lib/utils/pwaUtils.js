export function isPWASupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'caches' in window &&
    'indexedDB' in window
  )
}

export function isAppStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export function getDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      userAgent: '',
    }
  }

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

export async function clearAllCaches() {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return []
  }
  const cacheNames = await caches.keys()
  return Promise.all(cacheNames.map((name) => caches.delete(name)))
}

export async function getStorageInfo() {
  if (typeof window === 'undefined' || !navigator.storage || !navigator.storage.estimate) {
    return null
  }

  try {
    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentUsed: Math.round((estimate.usage / estimate.quota) * 100),
    }
  } catch {
    return null
  }
}

export async function requestPersistentStorage() {
  if (typeof window === 'undefined' || !navigator.storage || !navigator.storage.persist) {
    return false
  }

  try {
    return await navigator.storage.persist()
  } catch {
    return false
  }
}