'use client'

import { useNotifications, useOfflineStatus } from '../lib/pwa/hooks'
import { showTypedNotification } from '../lib/pwa/notifications'
import { NOTIFICATION_TYPES } from '../lib/pwa/constants'
import { useEffect, useState } from 'react'
import styles from './NotificationHandler.module.css'

export default function NotificationHandler() {
  const {
    notificationPermission,
    isPushSupported,
    isPushSubscribed,
    requestPermission,
    sendNotification,
    subscribeToPush,
    unsubscribeFromPush,
  } = useNotifications()
  const { isOnline } = useOfflineStatus()
  const [showUI, setShowUI] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    setShowUI(true)
  }, [])

  const handleRequestPermission = async () => {
    await requestPermission()
  }

  const handleSendTestNotification = async () => {
    await sendNotification({
      title: '🎉 Test Notification',
      body: 'This is a test notification from your PWA!',
      requireInteraction: true,
    })
  }

  const handleSubscribePush = async () => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (vapidKey) {
      await subscribeToPush(vapidKey)
    } else {
      showTypedNotification(
        NOTIFICATION_TYPES.WARNING,
        'Push Setup Required',
        'VAPID key not configured'
      )
    }
  }

  if (!showUI) return null

  const statusIndicators = {
    online: {
      color: '#10B981',
      label: 'Online',
      icon: '🌐',
    },
    offline: {
      color: '#EF4444',
      label: 'Offline',
      icon: '📵',
    },
    notificationsGranted: {
      color: '#10B981',
      label: 'Enabled',
      icon: '🔔',
    },
    notificationsDenied: {
      color: '#EF4444',
      label: 'Disabled',
      icon: '🔕',
    },
    pushSubscribed: {
      color: '#10B981',
      label: 'Subscribed',
      icon: '✓',
    },
    pushNotSubscribed: {
      color: '#F59E0B',
      label: 'Not Subscribed',
      icon: '○',
    },
  }

  return (
    <div className={styles.container}>
      {/* Floating Toggle Button */}
      <button
        className={`${styles.toggleBtn} ${isExpanded ? styles.toggleBtnActive : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        title="Toggle notification panel"
      >
        <span className={styles.toggleIcon}>
          {notificationPermission === 'granted' ? '🔔' : '📢'}
        </span>
        {notificationPermission === 'granted' && (
          <span className={styles.activeBadge}></span>
        )}
      </button>

      {/* Main Panel */}
      <div className={`${styles.panel} ${isExpanded ? styles.panelExpanded : ''}`}>
        <div className={styles.panelHeader}>
          <div className={styles.headerTitle}>
            <span className={styles.titleIcon}>📱</span>
            <h3>Notification Hub</h3>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setIsExpanded(false)}
          >
            ✕
          </button>
        </div>

        <div className={styles.panelContent}>
          {/* Status Section */}
          <div className={styles.statusSection}>
            <h4 className={styles.sectionTitle}>Status</h4>
            
            <div className={styles.statusItems}>
              {/* Connection Status */}
              <div className={styles.statusItem}>
                <div className={styles.statusIndicator}>
                  <span
                    className={styles.statusDot}
                    style={{
                      backgroundColor: isOnline
                        ? statusIndicators.online.color
                        : statusIndicators.offline.color,
                    }}
                  ></span>
                  <span className={styles.statusLabel}>
                    {isOnline
                      ? statusIndicators.online.icon
                      : statusIndicators.offline.icon}
                  </span>
                </div>
                <div className={styles.statusText}>
                  <span className={styles.statusName}>Connection</span>
                  <span className={styles.statusValue}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Notification Permission Status */}
              <div className={styles.statusItem}>
                <div className={styles.statusIndicator}>
                  <span
                    className={styles.statusDot}
                    style={{
                      backgroundColor:
                        notificationPermission === 'granted'
                          ? statusIndicators.notificationsGranted.color
                          : statusIndicators.notificationsDenied.color,
                    }}
                  ></span>
                  <span className={styles.statusLabel}>
                    {notificationPermission === 'granted'
                      ? statusIndicators.notificationsGranted.icon
                      : statusIndicators.notificationsDenied.icon}
                  </span>
                </div>
                <div className={styles.statusText}>
                  <span className={styles.statusName}>Notifications</span>
                  <span className={styles.statusValue}>
                    {notificationPermission === 'granted'
                      ? statusIndicators.notificationsGranted.label
                      : notificationPermission === 'denied'
                      ? statusIndicators.notificationsDenied.label
                      : 'Ask'}
                  </span>
                </div>
              </div>

              {/* Push Status */}
              {isPushSupported && (
                <div className={styles.statusItem}>
                  <div className={styles.statusIndicator}>
                    <span
                      className={styles.statusDot}
                      style={{
                        backgroundColor: isPushSubscribed
                          ? statusIndicators.pushSubscribed.color
                          : statusIndicators.pushNotSubscribed.color,
                      }}
                    ></span>
                    <span className={styles.statusLabel}>
                      {isPushSubscribed
                        ? statusIndicators.pushSubscribed.icon
                        : statusIndicators.pushNotSubscribed.icon}
                    </span>
                  </div>
                  <div className={styles.statusText}>
                    <span className={styles.statusName}>Push Notifications</span>
                    <span className={styles.statusValue}>
                      {isPushSubscribed
                        ? statusIndicators.pushSubscribed.label
                        : statusIndicators.pushNotSubscribed.label}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className={styles.actionsSection}>
            <h4 className={styles.sectionTitle}>Quick Actions</h4>
            
            <div className={styles.actionsGrid}>
              {notificationPermission !== 'granted' && (
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                  onClick={handleRequestPermission}
                >
                  <span className={styles.actionIcon}>✓</span>
                  <span className={styles.actionLabel}>Enable</span>
                </button>
              )}

              {notificationPermission === 'granted' && (
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                  onClick={handleSendTestNotification}
                >
                  <span className={styles.actionIcon}>📤</span>
                  <span className={styles.actionLabel}>Test</span>
                </button>
              )}

              {isPushSupported && (
                <button
                  className={`${styles.actionBtn} ${
                    isPushSubscribed ? styles.actionBtnDanger : styles.actionBtnWarning
                  }`}
                  onClick={
                    isPushSubscribed
                      ? unsubscribeFromPush
                      : handleSubscribePush
                  }
                >
                  <span className={styles.actionIcon}>
                    {isPushSubscribed ? '🔕' : '🔔'}
                  </span>
                  <span className={styles.actionLabel}>
                    {isPushSubscribed ? 'Unsubscribe' : 'Subscribe'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className={styles.infoSection}>
            <p className={styles.infoText}>
              ✨ Push notifications allow us to send you updates even when the app is closed.
            </p>
          </div>
        </div>

        {/* Panel Footer */}
        <div className={styles.panelFooter}>
          <span className={styles.footerText}>PWA Ready</span>
          <span className={styles.footerBadge}>v1.0</span>
        </div>
      </div>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className={styles.backdrop}
          onClick={() => setIsExpanded(false)}
        ></div>
      )}
    </div>
  )
}
