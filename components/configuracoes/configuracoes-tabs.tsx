"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContaInfo } from "./conta-info"
import { SuporteInfo } from "./suporte-info"
import SistemaInfo from "./sistema-info"
import { User, HelpCircle, Settings } from "lucide-react"

export function ConfiguracoesTabs() {
  return (
    <Tabs defaultValue="conta" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="conta" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Conta
        </TabsTrigger>
        <TabsTrigger value="suporte" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Suporte
        </TabsTrigger>
        <TabsTrigger value="sistema" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Sistema
        </TabsTrigger>
      </TabsList>

      <TabsContent value="conta">
        <ContaInfo />
      </TabsContent>

      <TabsContent value="suporte">
        <SuporteInfo />
      </TabsContent>

      <TabsContent value="sistema">
        <SistemaInfo />
      </TabsContent>
    </Tabs>
  )
}
