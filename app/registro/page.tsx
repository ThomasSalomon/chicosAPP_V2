"use client"

import { RegisterForm } from "@/components/auth/register-form"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  const handleToggleMode = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <RegisterForm onToggleMode={handleToggleMode} />
    </div>
  )
}
