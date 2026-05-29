export const PWA_CONSTANTS = {
  SW_PATH: '/sw.js',
  NOTIFICATION_TAG: 'nextjs-pwa-notification',
  NOTIFICATION_BADGE: '/icon-192x192.png',
  NOTIFICATION_ICON: '/icon-192x192.png',
  CACHE_NAME: 'nextjs-pwa-v1',
  CACHE_PATHS: [
    '/',
    '/offline',
    '/manifest.json',
  ],
}

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
}