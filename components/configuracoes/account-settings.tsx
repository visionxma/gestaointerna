"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { updateProfile } from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { User, Camera, Mail, Calendar, Shield } from "lucide-react"

export function AccountSettings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  if (!user) return null

  const getInitials = (name: string) => {
    const words = name.split(" ")
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const formatDate = (date: string | null) => {
    if (!date) return "Não disponível"
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      let photoURL = user.photoURL

      // Upload da nova foto se selecionada
      if (photoFile) {
        const photoRef = ref(storage, `profile-photos/${user.uid}`)
        await uploadBytes(photoRef, photoFile)
        photoURL = await getDownloadURL(photoRef)
      }

      // Atualizar perfil
      await updateProfile(user, {
        displayName: displayName || null,
        photoURL: photoURL,
      })

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      })

      setPhotoFile(null)
      setPhotoPreview(null)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Decorações de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full opacity-10 -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black dark:bg-white rounded-full opacity-5 translate-y-12 -translate-x-12" />

      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Dados da Conta</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie suas informações pessoais e foto de perfil
        </p>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Foto de perfil */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-700 shadow-lg">
              <AvatarImage src={photoPreview || user.photoURL || undefined} />
              <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-gray-800 to-black dark:from-gray-200 dark:to-gray-400 text-white dark:text-gray-900">
                {getInitials(user.displayName || user.email?.split("@")[0] || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 border-2 border-white dark:border-gray-700 rounded-full flex items-center justify-center">
              <Camera className="h-3 w-3 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <Label htmlFor="photo" className="text-sm font-medium">Foto de Perfil</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
            </p>
          </div>
        </div>

        {/* Nome de exibição */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Nome de Exibição</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Seu nome completo"
          />
        </div>

        {/* Informações da conta (somente leitura) */}
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <div className="flex items-center gap-2">
                <Input value={user.email || ""} disabled className="bg-gray-50 dark:bg-gray-800" />
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300">
                  <Shield className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Conta criada em
              </Label>
              <Input 
                value={formatDate(user.metadata.creationTime)} 
                disabled 
                className="bg-gray-50 dark:bg-gray-800" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Último acesso
            </Label>
            <Input 
              value={formatDate(user.metadata.lastSignInTime)} 
              disabled 
              className="bg-gray-50 dark:bg-gray-800" 
            />
          </div>
        </div>

        {/* Botão de salvar */}
        <Button
          onClick={handleUpdateProfile}
          disabled={loading || (!displayName.trim() && !photoFile)}
          className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </CardContent>
    </Card>
  )
}