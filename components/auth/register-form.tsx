"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { criarConta } from "@/lib/auth"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, EyeOff, AlertCircle, Upload } from "lucide-react"

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nome, setNome] = useState("")
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho do arquivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("A foto deve ter no máximo 5MB")
        return
      }

      // Validar tipo do arquivo
      if (!file.type.startsWith('image/')) {
        setError("Apenas arquivos de imagem são permitidos")
        return
      }

      setFoto(file)
      setError("") // Limpar erro se a validação passou
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validações no frontend
    if (!nome.trim()) {
      setError("Nome é obrigatório")
      setLoading(false)
      return
    }

    if (!email.trim()) {
      setError("Email é obrigatório")
      setLoading(false)
      return
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Formato de email inválido")
      setLoading(false)
      return
    }

    if (!password) {
      setError("Senha é obrigatória")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    try {
      console.log("[Register Form] Tentando criar conta...")
      const { user, error: registerError } = await criarConta(email, password, nome, foto)

      if (registerError) {
        console.error("[Register Form] Erro no registro:", registerError)
        setError(registerError)
      } else if (user) {
        console.log("[Register Form] Conta criada com sucesso, redirecionando...")
        router.push("/")
      } else {
        console.error("[Register Form] Erro inesperado: usuário não retornado")
        setError("Erro inesperado ao criar conta. Tente novamente.")
      }
    } catch (error) {
      console.error("[Register Form] Erro inesperado:", error)
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
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <CardDescription>Crie sua conta no Sistema de Gestão Interno VisionX</CardDescription>
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
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Seu nome completo"
                disabled={loading}
                className={error && !nome.trim() ? "border-destructive" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto">Foto de Perfil (opcional)</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={fotoPreview || undefined} />
                  <AvatarFallback className="text-lg">
                    {nome ? nome.charAt(0).toUpperCase() : <Upload className="h-6 w-6" />}
                  </AvatarFallback>
                </Avatar>
                <Input 
                  id="foto" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFotoChange} 
                  className="flex-1"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Máximo 5MB. Formatos: JPG, PNG, GIF
              </p>
            </div>

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
                  minLength={6}
                  disabled={loading}
                  className={error && password.length < 6 ? "border-destructive pr-10" : "pr-10"}
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
              <p className="text-xs text-muted-foreground">
                Mínimo 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  disabled={loading}
                  className={error && password !== confirmPassword ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={() => router.push("/login")}
                disabled={loading}
              >
                Faça login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}