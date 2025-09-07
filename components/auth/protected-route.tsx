"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isHydrated } = useAuth()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (isHydrated && !loading && !user) {
      // Delay para evitar problemas de navegação durante hidratação
      const timer = setTimeout(() => {
        setShouldRedirect(true)
        router.replace("/login")
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user, loading, isHydrated, router])

  // Memoizar o loading component para evitar re-renders desnecessários
  const loadingComponent = useMemo(
    () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="text-sm text-gray-600 font-medium">Carregando...</span>
        </div>
      </div>
    ),
    [],
  )

  const redirectingComponent = useMemo(
    () => (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-600 font-medium">Redirecionando para login...</span>
      </div>
    ),
    [],
  )

  if (!isHydrated || loading) {
    return loadingComponent
  }

  if (!user || shouldRedirect) {
    return redirectingComponent
  }

  return <>{children}</>
}
