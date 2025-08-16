"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Menu, Home, Users, Trophy, LogOut, User, ChevronDown, Settings } from "lucide-react"

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown cuando se hace click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Búsqueda en tiempo real
  useEffect(() => {
    const searchTerm = searchQuery.trim()
    
    if (searchTerm.length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) return

        // Buscar jugadores
        const playersResponse = await fetch(`/api/players?search=${encodeURIComponent(searchTerm)}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // Buscar equipos
        const teamsResponse = await fetch(`/api/teams?search=${encodeURIComponent(searchTerm)}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const players = playersResponse.ok ? (await playersResponse.json()).players || [] : []
        const teams = teamsResponse.ok ? (await teamsResponse.json()).teams || [] : []

        const results = [
          ...teams.slice(0, 3).map((team: any) => ({ ...team, type: 'team' })),
          ...players.slice(0, 5).map((player: any) => ({ ...player, type: 'player' }))
        ]

        setSearchResults(results)
        setShowSearchResults(true)
      } catch (error) {
        console.error('Error en búsqueda:', error)
      } finally {
        setSearchLoading(false)
      }
    }, 200) // Debounce optimizado de 200ms

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Equipos", href: "/teams", icon: Trophy },
    { name: "Jugadores", href: "/players", icon: Users },
    ...(user && user.role === "admin" ? [{ name: "Admin", href: "/admin/seed", icon: Settings }] : []),
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "coach":
        return "bg-blue-100 text-blue-800"
      case "parent":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "coach":
        return "Entrenador"
      case "parent":
        return "Padre/Madre"
      default:
        return role
    }
  }

  if (!user) return null

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container-fluid px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center gap-2 sm:gap-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center touch-target">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-gray-900">Academia FC</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Sistema de Gestión</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => router.push(item.href)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4 block" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                className="pl-10 pr-4 text-sm sm:text-base"
              />
              
              {/* Dropdown de resultados */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin h-4 w-4 mx-auto mb-2 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      Buscando...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result, index) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => {
                            if (result.type === 'team') {
                              // Si es un equipo, ir a ver los jugadores de ese equipo
                              router.push(`/players?team=${result.id}&teamName=${encodeURIComponent(result.name)}`)
                            } else {
                              // Si es un jugador, ir al equipo del jugador con foco en el jugador
                              if (result.team_id) {
                                router.push(`/players?team=${result.team_id}&focusPlayer=${result.id}&playerName=${encodeURIComponent(result.name)}`)
                              } else {
                                // Si el jugador no tiene equipo, ir a la página general con búsqueda
                                router.push(`/players?search=${encodeURIComponent(result.name)}`)
                              }
                            }
                            setShowSearchResults(false)
                            setSearchQuery("")
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                        >
                          {result.type === 'team' ? (
                            <Trophy className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Users className="h-4 w-4 text-green-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{result.name}</p>
                            <p className="text-sm text-gray-500">
                              {result.type === 'team' 
                                ? `Equipo • ${result.category || ''} • ${result.playerCount || 0} jugadores`
                                : `Jugador • ${result.age || 'N/A'} años • ${result.position || 'Sin posición'}`
                              }
                            </p>
                          </div>
                        </button>
                      ))}
                      {searchResults.length >= 8 && (
                        <div className="px-4 py-2 text-center border-t">
                          <button
                            onClick={() => {
                              router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
                              setShowSearchResults(false)
                              setSearchQuery("")
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Ver todos los resultados
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No se encontraron resultados para "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden touch-target btn-mobile">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Academia FC</h2>
                    <p className="text-sm text-gray-500">Sistema de Gestión</p>
                  </div>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="search"
                      placeholder="Buscar equipos o jugadores..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </form>

                {/* Mobile Navigation */}
                <div className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Button
                        key={item.name}
                        variant={isActive ? "default" : "ghost"}
                        className="w-full justify-start gap-3"
                        onClick={() => {
                          router.push(item.href)
                          setMobileMenuOpen(false)
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>

            {/* User Dropdown - Pure Tailwind Implementation */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  console.log("Tailwind dropdown clicked!")
                  setDropdownOpen(!dropdownOpen)
                }}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-700 text-sm font-semibold">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{user.name}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-[9999]">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        router.push("/profile")
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        logout()
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
