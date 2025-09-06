"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "firebase/auth"
import { observarEstadoAuth } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Memoizar o callback para evitar re-renders desnecessários
  const handleAuthStateChange = useCallback((user: User | null) => {
    console.log('Auth state changed:', user ? 'logged in' : 'logged out')
    setUser(user)
    setLoading(false)
  }, [])
  useEffect(() => {
    if (!mounted) return

    let timeoutId: NodeJS.Timeout
    
    // Adicionar timeout para evitar problemas de inicialização em mobile
    const initAuth = () => {
      try {
        const unsubscribe = observarEstadoAuth(handleAuthStateChange)
        return unsubscribe
      } catch (error) {
        console.error('Erro ao inicializar auth:', error)
        // Retry após 1 segundo em caso de erro
        timeoutId = setTimeout(initAuth, 1000)
        return () => {}
      }
    }

    const unsubscribe = initAuth()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [mounted, handleAuthStateChange])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
