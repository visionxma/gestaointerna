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
    // Usar requestAnimationFrame para garantir que a hidratação aconteça após o primeiro render
    const frame = requestAnimationFrame(() => {
      setIsHydrated(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const handleAuthStateChange = useCallback((user: User | null) => {
    console.log("[v0] Auth state changed:", user ? "logged in" : "logged out")
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
        console.log("[v0] Inicializando auth observer")
        const unsubscribe = observarEstadoAuth(handleAuthStateChange)
        return unsubscribe
      } catch (error) {
        console.error("[v0] Erro ao inicializar auth:", error)
        if (retryCount < maxRetries) {
          retryCount++
          console.log(`[v0] Tentativa ${retryCount}/${maxRetries} em ${1000 * retryCount}ms`)
          timeoutId = setTimeout(initAuth, 1000 * retryCount)
        } else {
          console.error("[v0] Máximo de tentativas atingido, definindo loading como false")
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
