"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fazerLogin } from "@/lib/auth"
import Image from "next/image"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validações no frontend
    if (!email.trim()) {
      setError("Email é obrigatório")
      setLoading(false)
      return
    }

    if (!password.trim()) {
      setError("Senha é obrigatória")
      setLoading(false)
      return
    }

    try {
      console.log("[Login Form] Tentando fazer login...")
      const { user, error: loginError } = await fazerLogin(email, password)

      if (loginError) {
        console.error("[Login Form] Erro no login:", loginError)
        setError(loginError)
      } else if (user) {
        console.log("[Login Form] Login realizado com sucesso, redirecionando...")
        router.push("/")
      } else {
        console.error("[Login Form] Erro inesperado: usuário não retornado")
        setError("Erro inesperado no login. Tente novamente.")
      }
    } catch (error) {
      console.error("[Login Form] Erro inesperado:", error)
      setError("Erro inesperado. Verifique sua conexão e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/images/visionx-logo.png" 
              alt="VisionX Logo" 
              width={200} 
              height={60} 
              className="h-12 w-auto"
              priority
            />
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Acesse o Sistema de Gestão Interno VisionX</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                disabled={loading}
                className={error && !email.trim() ? "border-destructive" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                  className={error && !password.trim() ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={() => router.push("/cadastro")}
                disabled={loading}
              >
                Cadastre-se
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}