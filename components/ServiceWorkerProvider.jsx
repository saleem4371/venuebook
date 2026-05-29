'use client'

import { useEffect } from 'react'
import { useServiceWorker } from '../lib/pwa/hooks'

export default function ServiceWorkerProvider({ children }) {
  const { isSupported, isRegistered, loading } = useServiceWorker()

  useEffect(() => {
    if (!loading && isRegistered) {
      console.log('✅ Service Worker registered successfully')
    }
  }, [isRegistered, loading])

  return <>{children}</>
}