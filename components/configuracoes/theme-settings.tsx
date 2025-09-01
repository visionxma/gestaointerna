"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun, Palette, Check } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-gray-700" />
            <CardTitle className="text-xl font-bold text-gray-900">Aparência</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const themes = [
    {
      id: "light",
      name: "Claro",
      description: "Tema claro para uso diurno",
      icon: Sun,
      preview: "bg-white border-gray-200",
      textPreview: "text-gray-900"
    },
    {
      id: "dark",
      name: "Escuro",
      description: "Tema escuro para uso noturno",
      icon: Moon,
      preview: "bg-gray-900 border-gray-700",
      textPreview: "text-gray-100"
    },
    {
      id: "system",
      name: "Sistema",
      description: "Segue o tema do sistema",
      icon: Monitor,
      preview: "bg-gradient-to-br from-white to-gray-900 border-gray-400",
      textPreview: "text-gray-600"
    }
  ]

  const getCurrentThemeInfo = () => {
    const currentTheme = themes.find(t => t.id === theme)
    return currentTheme || themes[0]
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Decorações de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full opacity-10 -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black dark:bg-white rounded-full opacity-5 translate-y-12 -translate-x-12" />

      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Aparência</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha como o sistema deve aparecer para você
        </p>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Tema atual */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {React.createElement(getCurrentThemeInfo().icon, {
                className: "h-4 w-4 text-gray-700 dark:text-gray-300"
              })}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Tema Atual</p>
              <p className="text-sm text-muted-foreground">{getCurrentThemeInfo().name}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300">
            Ativo
          </Badge>
        </div>

        {/* Seleção de temas */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Escolher Tema</Label>
          <div className="grid grid-cols-1 gap-3">
            {themes.map((themeOption) => {
              const isSelected = theme === themeOption.id
              const Icon = themeOption.icon
              
              return (
                <Button
                  key={themeOption.id}
                  variant="outline"
                  onClick={() => setTheme(themeOption.id)}
                  className={`relative h-auto p-4 justify-start transition-all duration-200 ${
                    isSelected 
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-4 w-full">
                    {/* Preview do tema */}
                    <div className={`w-12 h-8 rounded-md border-2 ${themeOption.preview} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${themeOption.textPreview}`} />
                    </div>
                    
                    {/* Informações do tema */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{themeOption.name}</span>
                        {isSelected && (
                          <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{themeOption.description}</p>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 dark:bg-blue-800 rounded">
              <Palette className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Dica sobre temas</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                O tema "Sistema" automaticamente alterna entre claro e escuro baseado nas configurações do seu dispositivo.
                {resolvedTheme && (
                  <span className="block mt-1">
                    Atualmente usando: <strong>{resolvedTheme === 'dark' ? 'Escuro' : 'Claro'}</strong>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}