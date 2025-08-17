"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, TrendingUp, TrendingDown, Menu, X, LogOut, Shield, FolderKanban, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { fazerLogout } from "@/lib/auth"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Projetos", href: "/projetos", icon: FolderKanban },
  { name: "Orçamentos", href: "/orcamentos", icon: FileText },
  { name: "Receitas", href: "/receitas", icon: TrendingUp },
  { name: "Despesas", href: "/despesas", icon: TrendingDown },
  { name: "Senhas", href: "/senhas", icon: Shield },
]

const motivationalMessages = [
  "Você é capaz de grandes conquistas!",
  "Cada dia é uma nova oportunidade.",
  "Persistência é o caminho para o sucesso.",
  "Acredite no seu potencial!",
  "Faça hoje melhor do que ontem.",
  "Pequenos passos levam a grandes resultados.",
  "O sucesso começa com uma atitude positiva.",
  "Transforme desafios em aprendizado.",
  "Seja a mudança que você quer ver.",
  "Continue avançando, mesmo devagar."
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % motivationalMessages.length)
    }, 5000) // alterna a cada 5 segundos
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    const { error } = await fazerLogout()
    if (!error) router.push("/login")
  }

  return (
    <>
      {/* Botão mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition"
        >
          {isOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-br from-gray-50 to-gray-100 border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Decorações de fundo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-300 rounded-full opacity-10 -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black rounded-full opacity-5 translate-y-12 -translate-x-12" />

          {/* Logo e título */}
          <div className="relative flex flex-col items-center justify-center px-4 py-6 border-b border-gray-200 z-10">
<Image src="./images/visionx-logo.png" alt="VisionX Logo" width={120} height={120} />
            <div className="text-center">
              <h1 className="text-sm font-semibold text-gray-900">Sistema de Gestão</h1>
              <p className="text-xs text-gray-600">Interno VisionX</p>
            </div>
          </div>

          {/* Navegação */}
          <nav className="relative flex-1 px-4 py-6 space-y-2 z-10">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

{/* Rodapé com usuário, email completo e logout */}
<div className="relative px-4 py-4 border-t border-gray-200 z-10 bg-white/70 backdrop-blur-md">
  {/* Email completo */}
  <div className="mb-1 text-xs text-gray-500 break-words">
    Logado como: <span className="font-medium text-gray-700">{user?.email || "Usuário"}</span>
  </div>

  {/* Mensagem motivacional */}
  <div className="mb-2 text-xs text-gray-600 italic">
    {motivationalMessages[messageIndex]}
  </div>

  {/* Botão de logout */}
  <Button
    variant="outline"
    size="sm"
    onClick={handleLogout}
    className="w-full flex items-center justify-center rounded-lg border-gray-300 hover:bg-gray-50"
  >
    <LogOut className="mr-2 h-4 w-4" />
    Sair
  </Button>
</div>

        </div>
      </div>

      {/* Overlay mobile */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
