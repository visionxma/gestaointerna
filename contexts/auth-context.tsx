"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "firebase/auth"
import { observarEstadoAuth } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  isHydrated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isHydrated: false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Memoizar o callback para evitar re-renders desnecessários
  const handleAuthStateChange = useCallback((user: User | null) => {
    console.log("Auth state changed:", user ? "logged in" : "logged out")
    setUser(user)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    let timeoutId: NodeJS.Timeout
    let retryCount = 0
    const maxRetries = 3

    const initAuth = () => {
      try {
        const unsubscribe = observarEstadoAuth(handleAuthStateChange)
        return unsubscribe
      } catch (error) {
        console.error("Erro ao inicializar auth:", error)
        if (retryCount < maxRetries) {
          retryCount++
          timeoutId = setTimeout(initAuth, 1000 * retryCount)
        } else {
          // Se falhar após tentativas, definir como não carregando
          setLoading(false)
        }
        return () => {}
      }
    }

    const unsubscribe = initAuth()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [isHydrated, handleAuthStateChange])

  return <AuthContext.Provider value={{ user, loading, isHydrated }}>{children}</AuthContext.Provider>
}
