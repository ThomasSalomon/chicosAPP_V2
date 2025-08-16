"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs() {
  const pathname = usePathname()

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Inicio", href: "/dashboard" }]

    const pathMap: Record<string, string> = {
      dashboard: "Dashboard",
      teams: "Equipos",
      players: "Jugadores",
      search: "Búsqueda",
      profile: "Perfil",
    }

    segments.forEach((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/")
      const label = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

      breadcrumbs.push({
        label,
        href: index === segments.length - 1 ? undefined : href,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  if (breadcrumbs.length <= 1) return null

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          {breadcrumb.href ? (
            <Link href={breadcrumb.href} className="hover:text-gray-700 transition-colors">
              {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
              {breadcrumb.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">
              {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
              {breadcrumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
