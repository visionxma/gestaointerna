"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !user) {
      // Adicionar delay para evitar problemas de navegação em mobile
      const timer = setTimeout(() => {
        router.replace("/login")
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user, loading, router, mounted])

  // Memoizar o loading component para evitar re-renders desnecessários
  const loadingComponent = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="text-sm text-gray-600 font-medium">Carregando...</span>
      </div>
    </div>
  ), [])

  const redirectingComponent = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center">
      <span className="text-sm text-gray-600 font-medium">
        Redirecionando para login...
      </span>
    </div>
  ), [])
  if (!mounted || loading) {
    return loadingComponent
  }

  if (!user) {
    return redirectingComponent
  }

  return <>{children}</>
}
