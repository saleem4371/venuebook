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

  const ua = navigator.userAgent || ''
  const maxTouchPoints = typeof navigator !== 'undefined' ? (navigator.maxTouchPoints || 0) : 0
  const isIpadOS = (navigator.platform === 'MacIntel' || ua.includes('Macintosh')) && maxTouchPoints > 1

  const isTablet = /Tablet|iPad/i.test(ua) || (ua.includes('Android') && !/Mobile/i.test(ua)) || isIpadOS
  const isMobile = (/Mobile|Android|iPhone|iPod/i.test(ua) || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) && !isTablet

  const isDesktop = !isMobile && !isTablet

  return {
    isMobile,
    isTablet,
    isDesktop,
    userAgent: ua,
  }
}

export function isMobileOrTabletDevice() {
  if (typeof window === 'undefined') return false
  const { isDesktop, isMobile, isTablet } = getDeviceInfo()
  return (isMobile || isTablet) && !isDesktop
}

export function isEligibleForPWAInstall() {
  if (typeof window === 'undefined') return false
  if (!isMobileOrTabletDevice()) return false
  if (isAppStandalone()) return false
  if (window.__pwaInstalled === true) return false
  try {
    if (localStorage.getItem('vb_pwa_installed') === 'true') return false
  } catch {}
  return true
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