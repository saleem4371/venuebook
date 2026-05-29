'use client'

import { useServiceWorker, useNotifications, useOfflineStatus } from '@/lib/pwa/hooks'
import { getDeviceInfo, isPWASupported, isAppStandalone, getStorageInfo } from '@/lib/utils/pwaUtils'
import { useEffect, useState } from 'react'

export default function PWAStatus() {
  const { isSupported: swSupported, isRegistered } = useServiceWorker()
  const { notificationPermission, isPushSupported } = useNotifications()
  const { isOnline } = useOfflineStatus()
  const [deviceInfo, setDeviceInfo] = useState(null)
  const [storageInfo, setStorageInfo] = useState(null)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setDeviceInfo(getDeviceInfo())
    setIsStandalone(isAppStandalone())

    getStorageInfo().then(setStorageInfo)
  }, [])

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        padding: '16px',
        borderRadius: '8px',
        marginTop: '20px',
      }}
    >
      <h2 style={{ marginTop: 0 }}>PWA Status</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Features</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
            <li>PWA Supported: {isPWASupported() ? '✅' : '❌'}</li>
            <li>Service Worker: {swSupported ? '✅' : '❌'}</li>
            <li>Service Worker Registered: {isRegistered ? '✅' : '❌'}</li>
            <li>Notifications: {notificationPermission === 'granted' ? '✅' : '❌'}</li>
            <li>Push Notifications: {isPushSupported ? '✅' : '❌'}</li>
            <li>Standalone Mode: {isStandalone ? '✅' : '❌'}</li>
          </ul>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Device Info</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
            <li>Online: {isOnline ? '✅' : '❌'}</li>
            {deviceInfo && (
              <>
                <li>Mobile: {deviceInfo.isMobile ? '✅' : '❌'}</li>
                <li>Tablet: {deviceInfo.isTablet ? '✅' : '❌'}</li>
                <li>Desktop: {deviceInfo.isDesktop ? '✅' : '❌'}</li>
              </>
            )}
            {storageInfo && (
              <li>Storage: {Math.round(storageInfo.usage / 1024 / 1024)}MB / {Math.round(storageInfo.quota / 1024 / 1024)}MB ({storageInfo.percentUsed}%)</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}