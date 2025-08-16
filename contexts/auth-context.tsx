"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
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

  useEffect(() => {
    console.log("[Auth Context] Configurando observador de autenticação")
    const unsubscribe = observarEstadoAuth((user) => {
      console.log("[Auth Context] Estado de autenticação alterado:", user ? "Logado" : "Deslogado")
      setUser(user)
      setLoading(false)
    })

    return () => {
      console.log("[Auth Context] Removendo observador de autenticação")
      unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
