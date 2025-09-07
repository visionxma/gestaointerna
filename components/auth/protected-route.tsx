"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isHydrated } = useAuth()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isHydrated && !loading && !user) {
      console.log("[v0] Usuário não autenticado, redirecionando para login")
      const timer = setTimeout(() => {
        setShouldRedirect(true)
        router.replace("/login")
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user, loading, isHydrated, router, mounted])

  if (!mounted || !isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="text-sm text-gray-600 font-medium">Carregando...</span>
        </div>
      </div>
    )
  }

  if (!user || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-600 font-medium">Redirecionando para login...</span>
      </div>
    )
  }

  return <>{children}</>
}
