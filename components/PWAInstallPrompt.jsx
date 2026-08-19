'use client'

import { usePWAInstall } from '@/lib/pwa/hooks'
import { useState } from 'react'

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, install } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)

  if (!isInstallable || isInstalled || dismissed) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#111827',
        color: '#ffffff',
        padding: '16px 20px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 9999,
        maxWidth: '400px',
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 4px 0', fontWeight: '700', fontSize: '15px' }}>
          Install App
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>
          Add venuebook to your home screen
        </p>
      </div>
      <button
        onClick={() => install()}
        style={{
          backgroundColor: '#7C3AED',
          color: '#ffffff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '13px',
          whiteSpace: 'nowrap',
        }}
      >
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: '#9CA3AF',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '4px',
        }}
      >
        ✕
      </button>
    </div>
  )
}