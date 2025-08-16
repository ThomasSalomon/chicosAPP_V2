import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Suspense } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Preloader } from "@/components/ui/preloader"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Academia de Fútbol - Sistema de Gestión",
    template: "%s | Academia de Fútbol"
  },
  description: "Sistema profesional de gestión para academias de fútbol con funcionalidades avanzadas de administración de jugadores y equipos",
  keywords: ["fútbol", "academia", "gestión", "deportes", "jugadores", "equipos"],
  authors: [{ name: "Academia de Fútbol" }],
  creator: "Academia de Fútbol",
  publisher: "Academia de Fútbol",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://academia-futbol.com'),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Academia Fútbol',
  },
  openGraph: {
    title: "Academia de Fútbol - Sistema de Gestión",
    description: "Sistema profesional de gestión para academias de fútbol",
    url: 'https://academia-futbol.com',
    siteName: 'Academia de Fútbol',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Academia de Fútbol - Sistema de Gestión",
    description: "Sistema profesional de gestión para academias de fútbol",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    apple: '/icon-192x192.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#2563eb',
    'msapplication-tap-highlight': 'no',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <Suspense fallback={
            <Preloader children={children}
              isLoading={true} 
              fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-lg font-medium">Cargando Academia de Fútbol...</p>
                  </div>
                </div>
              }
            />
          }>
            {children}
          </Suspense>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
