'use client'

import { usePWAInstall } from '../lib/pwa/hooks'
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
        backgroundColor: '#000',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 9999,
        maxWidth: '400px',
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
          Install App
        </p>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Add our app to your home screen
        </p>
      </div>
      <button
        onClick={() => install()}
        style={{
          backgroundColor: '#007AFF',
          color: '#fff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '600',
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
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '0',
        }}
      >
        ✕
      </button>
    </div>
  )
}