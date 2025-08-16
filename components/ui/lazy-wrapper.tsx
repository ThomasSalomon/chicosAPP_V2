"use client"

import { ReactNode } from 'react'
import { useLazyLoad } from '@/hooks/use-lazy-load'
import { cn } from '@/lib/utils'

interface LazyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  minHeight?: number
}

export function LazyWrapper({
  children,
  fallback,
  className,
  threshold = 0.1,
  rootMargin = '100px',
  triggerOnce = true,
  minHeight = 200
}: LazyWrapperProps) {
  const { elementRef, isIntersecting } = useLazyLoad({
    threshold,
    rootMargin,
    triggerOnce
  })

  const defaultFallback = (
    <div 
      className="flex items-center justify-center bg-gray-50 animate-pulse rounded-lg"
      style={{ minHeight }}
    >
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-500">Cargando...</p>
      </div>
    </div>
  )

  return (
    <div ref={elementRef} className={cn("w-full", className)}>
      {isIntersecting ? children : (fallback || defaultFallback)}
    </div>
  )
}

export default LazyWrapper