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
    <div className="fixed bottom-5 right-5 z-[9999] max-w-[400px] p-4 rounded-2xl bg-white/95 text-gray-900 shadow-xl border border-gray-200/80 dark:bg-gray-900/95 dark:text-white dark:border-white/10 dark:shadow-2xl flex items-center gap-3 backdrop-blur-md transition-colors duration-200">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-gray-900 dark:text-white">
          Install App
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
          Add venuebook to your home screen
        </p>
      </div>
      <button
        onClick={() => install()}
        className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-md shadow-purple-600/25"
      >
        Install
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 p-1 rounded-lg transition-colors text-base"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  )
}