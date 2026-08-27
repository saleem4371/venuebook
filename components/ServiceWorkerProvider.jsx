'use client'

import { useServiceWorker } from '@/lib/pwa/hooks'

export function ServiceWorkerProvider({ children }) {
  useServiceWorker()
  return <>{children}</>
}

export default ServiceWorkerProvider