"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X, Smartphone, Monitor } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Detectar se já está instalado
    const standalone = window.matchMedia("(display-mode: standalone)").matches
    setIsStandalone(standalone)

    // Verificar se já foi instalado ou se o prompt foi dispensado
    const promptDismissed = localStorage.getItem("pwa-prompt-dismissed")

    if (!standalone && !promptDismissed) {
      if (iOS) {
        // Para iOS, mostrar instruções manuais
        setShowPrompt(true)
      } else {
        // Para outros navegadores, aguardar evento beforeinstallprompt
        const handleBeforeInstallPrompt = (e: Event) => {
          e.preventDefault()
          setDeferredPrompt(e as BeforeInstallPromptEvent)
          setShowPrompt(true)
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

        return () => {
          window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        }
      }
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        setDeferredPrompt(null)
        setShowPrompt(false)
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-prompt-dismissed", "true")
  }

  if (isStandalone || !showPrompt) {
    return null
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Instalar VisionX</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {isIOS ? "Adicione à tela inicial para melhor experiência" : "Instale o app para acesso rápido e uso offline"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isIOS ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Smartphone className="h-4 w-4" />
              <span>Toque no botão compartilhar</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Monitor className="h-4 w-4" />
              <span>Selecione "Adicionar à Tela Inicial"</span>
            </div>
            <Button onClick={handleDismiss} className="w-full bg-transparent" variant="outline">
              Entendi
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleInstall} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Instalar
            </Button>
            <Button onClick={handleDismiss} variant="outline">
              Agora não
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
