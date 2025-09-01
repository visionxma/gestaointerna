"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { updateProfile, updatePassword } from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { User, Mail, Calendar, Shield, Camera, Key, Save } from "lucide-react"

export function ContaInfo() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [passwordMode, setPasswordMode] = useState(false)
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)

  const getInitials = (name: string) => {
    if (!name) return "U"
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

  const handleSaveProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      let photoURL = user.photoURL

      // Upload da nova foto se selecionada
      if (foto) {
        const photoRef = ref(storage, `profile-photos/${user.uid}`)
        await uploadBytes(photoRef, foto)
        photoURL = await getDownloadURL(photoRef)
      }

      // Atualizar perfil
      await updateProfile(user, {
        displayName: formData.displayName || null,
        photoURL: photoURL,
      })

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      })

      setEditMode(false)
      setFoto(null)
      setFotoPreview(null)
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    setLoadingPassword(true)
    try {
      await updatePassword(user, passwordData.newPassword)
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso!",
      })

      setPasswordMode(false)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      toast({
        title: "Erro",
        description: "Erro ao alterar senha. Verifique sua senha atual.",
        variant: "destructive",
      })
    } finally {
      setLoadingPassword(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-300 rounded-full opacity-10 -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black rounded-full opacity-5 translate-y-12 -translate-x-12" />

        <CardHeader className="relative">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-700" />
            <CardTitle className="text-xl font-bold text-gray-900">Informações da Conta</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie suas informações pessoais e configurações de perfil.
          </p>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Avatar e informações principais */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={fotoPreview || user.photoURL || undefined} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-gray-800 to-black text-white">
                  {getInitials(user.displayName || user.email || "")}
                </AvatarFallback>
              </Avatar>
              
              {editMode && (
                <div className="absolute -bottom-2 -right-2">
                  <label htmlFor="foto-upload" className="cursor-pointer">
                    <div className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                    <input
                      id="foto-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              {editMode ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nome de Exibição</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} disabled={loading} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditMode(false)
                        setFoto(null)
                        setFotoPreview(null)
                        setFormData({
                          displayName: user.displayName || "",
                          email: user.email || "",
                        })
                      }}
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {user.displayName || "Nome não definido"}
                    </h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Conta Ativa
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      Administrador
                    </Badge>
                  </div>

                  <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
                    Editar Perfil
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Informações detalhadas */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {user.emailVerified ? "Verificado" : "Não verificado"}
                </Badge>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Membro desde</h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(user.metadata.creationTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Último acesso</h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(user.metadata.lastSignInTime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Segurança</h4>
                      <p className="text-sm text-gray-600">Alterar senha</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setPasswordMode(!passwordMode)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {passwordMode ? "Cancelar" : "Alterar"}
                  </Button>
                </div>

                {passwordMode && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Digite a nova senha"
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirme a nova senha"
                        minLength={6}
                      />
                    </div>

                    <Button 
                      onClick={handleChangePassword} 
                      disabled={loadingPassword}
                      className="w-full"
                    >
                      {loadingPassword ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}