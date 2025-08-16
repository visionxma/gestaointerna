"use client"

import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserProfileEdit } from "./user-profile-edit"

export function UserHeader() {
  const { user } = useAuth()

  if (!user) return null

  const displayName = user.displayName || user.email?.split("@")[0] || "Usuário"
  const firstName = displayName.split(" ")[0]

  return (
    <div className="flex items-center gap-3 mb-6 p-4 bg-card rounded-lg border">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.photoURL || undefined} />
        <AvatarFallback className="text-lg font-semibold">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-xl font-semibold">Olá, {firstName}!</h2>
        <p className="text-sm text-muted-foreground">Bem-vindo ao sistema VisionX</p>
      </div>
      <UserProfileEdit />
    </div>
  )
}
