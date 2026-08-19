'use client'

import { useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Image from 'next/image'

function isInstalled() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    window.__pwaInstalled === true
  )
}

export default function PWAInstallToast() {
  useEffect(() => {
    if (isInstalled()) return

    const timer = setTimeout(() => {
      if (isInstalled()) return

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-white/10 p-3.5 text-white gap-3 items-center`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center shrink-0 border border-purple-500/30 overflow-hidden relative">
              <Image
                src="/icon-192x192.png"
                alt="venuebook"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-purple-300">venuebook.in</p>
              <p className="text-xs text-slate-200 truncate">
                Install app for a faster & seamless experience
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={async () => {
                  toast.dismiss(t.id)
                  const promptEvent = window.__pwaInstallEvent
                  if (promptEvent) {
                    promptEvent.prompt()
                    const result = await promptEvent.userChoice
                    if (result.outcome === 'accepted') {
                      window.__pwaInstalled = true
                    }
                    window.__pwaInstallEvent = null
                  } else {
                    window.dispatchEvent(new CustomEvent('pwa-open-install-guide'))
                  }
                }}
                className="bg-purple-600 hover:bg-purple-500 active:scale-95 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md shadow-purple-600/30"
              >
                Install
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors text-xs"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        ),
        {
          duration: 9000,
          position: 'top-center',
        }
      )
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#0f172a',
          color: '#fff',
          borderRadius: '12px',
        },
      }}
    />
  )
}
