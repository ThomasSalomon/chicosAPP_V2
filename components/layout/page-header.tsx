"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PageHeaderProps {
  title: string
  description?: string
  backButton?: {
    href: string
    label: string
  }
  action?: React.ReactNode
  children?: React.ReactNode
}

export function PageHeader({ title, description, backButton, action, children }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backButton && (
            <Button variant="ghost" size="sm" onClick={() => router.push(backButton.href)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backButton.label}
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
