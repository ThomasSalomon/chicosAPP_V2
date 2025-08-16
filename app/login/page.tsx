"use client"

import { LoginForm } from "@/components/auth/login-form"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const handleToggleMode = () => {
    router.push("/registro")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <LoginForm onToggleMode={handleToggleMode} />
    </div>
  )
}
