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

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [nome, setNome] = useState("")
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFoto(file)
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

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    if (!nome.trim()) {
      setError("Nome é obrigatório")
      setLoading(false)
      return
    }

    try {
      const { user, error: registerError } = await criarConta(email, password, nome, foto)

      if (registerError) {
        if (registerError.includes("auth/email-already-in-use")) {
          setError("Este email já está cadastrado. Tente fazer login ou use outro email.")
        } else if (registerError.includes("auth/weak-password")) {
          setError("A senha é muito fraca. Use pelo menos 6 caracteres.")
        } else if (registerError.includes("auth/invalid-email")) {
          setError("Email inválido. Verifique o formato do email.")
        } else {
          setError("Erro ao criar conta: " + registerError)
        }
      } else if (user) {
        router.push("/")
      } else {
        setError("Erro inesperado ao criar conta")
      }
    } catch (error) {
      console.error("[v0] Erro no cadastro:", error)
      setError("Erro inesperado ao criar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="./images/visionx-logo.png" alt="VisionX Logo" width={200} height={60} className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <CardDescription>Crie sua conta no Sistema de Gestão Interno VisionX</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto">Foto de Perfil (opcional)</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={fotoPreview || undefined} />
                  <AvatarFallback className="text-lg">{nome ? nome.charAt(0).toUpperCase() : "?"}</AvatarFallback>
                </Avatar>
                <Input id="foto" type="file" accept="image/*" onChange={handleFotoChange} className="flex-1" />
              </div>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/login")}>
                Faça login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
