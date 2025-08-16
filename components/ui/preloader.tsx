"use client"

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface PreloaderProps {
  isLoading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  delay?: number
  minLoadTime?: number
  className?: string
}

export function Preloader({
  isLoading,
  children,
  fallback,
  delay = 200,
  minLoadTime = 500,
  className
}: PreloaderProps) {
  const [showLoader, setShowLoader] = useState(false)
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null)

  useEffect(() => {
    let delayTimer: NodeJS.Timeout
    let minTimeTimer: NodeJS.Timeout

    if (isLoading) {
      setLoadStartTime(Date.now())
      delayTimer = setTimeout(() => {
        setShowLoader(true)
      }, delay)
    } else {
      const elapsed = loadStartTime ? Date.now() - loadStartTime : 0
      const remainingTime = Math.max(0, minLoadTime - elapsed)

      if (remainingTime > 0) {
        minTimeTimer = setTimeout(() => {
          setShowLoader(false)
          setLoadStartTime(null)
        }, remainingTime)
      } else {
        setShowLoader(false)
        setLoadStartTime(null)
      }
    }

    return () => {
      clearTimeout(delayTimer)
      clearTimeout(minTimeTimer)
    }
  }, [isLoading, delay, minLoadTime, loadStartTime])

  const defaultFallback = (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">Cargando...</p>
          <p className="text-xs text-gray-500 mt-1">Por favor espera un momento</p>
        </div>
      </div>
    </div>
  )

  if (showLoader || isLoading) {
    return (
      <div className={cn("w-full", className)}>
        {fallback || defaultFallback}
      </div>
    )
  }

  return <>{children}</>
}

export default Preloader