"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { adicionarOrcamento, obterClientes } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { FileText, Plus, Trash2 } from "lucide-react"
import type { Cliente, ItemOrcamento } from "@/lib/types"

interface OrcamentoFormProps {
  onOrcamentoAdicionado: () => void
}

export function OrcamentoForm({ onOrcamentoAdicionado }: OrcamentoFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [itens, setItens] = useState<ItemOrcamento[]>([
    { id: '1', descricao: '', quantidade: 1, valorUnitario: 0, valorTotal: 0 }
  ])
  
  const [formData, setFormData] = useState({
    clienteId: "none",
    nomeCliente: "",
    emailCliente: "",
    telefoneCliente: "",
    titulo: "",
    descricao: "",
    desconto: 0,
    dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 dias
    observacoes: "",
  })

  useEffect(() => {
    const carregarClientes = async () => {
      const clientesData = await obterClientes()
      setClientes(clientesData)
    }
    carregarClientes()
  }, [])

  const gerarNumeroOrcamento = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const time = String(now.getTime()).slice(-4)
    return `ORC-${year}${month}${day}-${time}`
  }

  const adicionarItem = () => {
    const novoItem: ItemOrcamento = {
      id: Date.now().toString(),
      descricao: '',
      quantidade: 1,
      valorUnitario: 0,
      valorTotal: 0
    }
    setItens([...itens, novoItem])
  }

  const removerItem = (id: string) => {
    if (itens.length > 1) {
      setItens(itens.filter(item => item.id !== id))
    }
  }

  const atualizarItem = (id: string, campo: keyof ItemOrcamento, valor: any) => {
    setItens(itens.map(item => {
      if (item.id === id) {
        const itemAtualizado = { ...item, [campo]: valor }
        if (campo === 'quantidade' || campo === 'valorUnitario') {
          itemAtualizado.valorTotal = itemAtualizado.quantidade * itemAtualizado.valorUnitario
        }
        return itemAtualizado
      }
      return item
    }))
  }

  const calcularSubtotal = () => {
    return itens.reduce((sum, item) => sum + item.valorTotal, 0)
  }

  const calcularTotal = () => {
    return calcularSubtotal() - formData.desconto
  }

  const handleClienteChange = (clienteId: string) => {
    setFormData({ ...formData, clienteId })
    
    if (clienteId !== "none") {
      const cliente = clientes.find(c => c.id === clienteId)
      if (cliente) {
        setFormData(prev => ({
          ...prev,
          nomeCliente: cliente.nome,
          emailCliente: cliente.email,
          telefoneCliente: cliente.telefone,
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        nomeCliente: "",
        emailCliente: "",
        telefoneCliente: "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const subtotal = calcularSubtotal()
      const valorTotal = calcularTotal()

      await adicionarOrcamento({
        numeroOrcamento: gerarNumeroOrcamento(),
        clienteId: formData.clienteId !== "none" ? formData.clienteId : undefined,
        nomeCliente: formData.nomeCliente,
        emailCliente: formData.emailCliente,
        telefoneCliente: formData.telefoneCliente,
        titulo: formData.titulo,
        descricao: formData.descricao,
        itens,
        subtotal,
        desconto: formData.desconto,
        valorTotal,
        status: 'rascunho',
        dataVencimento: new Date(formData.dataVencimento),
        dataCriacao: new Date(),
        observacoes: formData.observacoes,
      })

      toast({
        title: "Orçamento criado",
        description: "Orçamento foi criado com sucesso!",
      })

      // Reset form
      setFormData({
        clienteId: "none",
        nomeCliente: "",
        emailCliente: "",
        telefoneCliente: "",
        titulo: "",
        descricao: "",
        desconto: 0,
        dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        observacoes: "",
      })
      setItens([{ id: '1', descricao: '', quantidade: 1, valorUnitario: 0, valorTotal: 0 }])

      onOrcamentoAdicionado()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar orçamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value, type } = e.target
  setFormData({
    ...formData,
    [name]: type === "number" ? Number(value) : value,
  })
}


  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-700" />
          <CardTitle className="text-xl font-bold text-gray-900">Criar Novo Orçamento</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os dados para gerar um orçamento profissional.
        </p>
      </CardHeader>

      <CardContent className="relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dados do Cliente</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clienteId">Cliente Existente (Opcional)</Label>
                <Select value={formData.clienteId} onValueChange={handleClienteChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Novo cliente</SelectItem>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
                <Input
                  id="nomeCliente"
                  name="nomeCliente"
                  value={formData.nomeCliente}
                  onChange={handleChange}
                  required
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailCliente">Email *</Label>
                <Input
                  id="emailCliente"
                  name="emailCliente"
                  type="email"
                  value={formData.emailCliente}
                  onChange={handleChange}
                  required
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefoneCliente">Telefone *</Label>
                <Input
                  id="telefoneCliente"
                  name="telefoneCliente"
                  value={formData.telefoneCliente}
                  onChange={handleChange}
                  required
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Dados do Projeto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dados do Projeto</h3>
            
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Projeto *</Label>
              <Input
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                placeholder="Ex: Desenvolvimento de Site Institucional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descreva o projeto e seus objetivos"
                rows={3}
              />
            </div>
          </div>

          {/* Itens do Orçamento */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Itens do Orçamento</h3>
              <Button type="button" onClick={adicionarItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-3">
              {itens.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="grid gap-4 md:grid-cols-12 items-end">
                    <div className="md:col-span-5 space-y-2">
                      <Label>Descrição *</Label>
                      <Input
                        value={item.descricao}
                        onChange={(e) => atualizarItem(item.id, 'descricao', e.target.value)}
                        placeholder="Descrição do serviço"
                        required
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => atualizarItem(item.id, 'quantidade', Number(e.target.value))}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Valor Unitário</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.valorUnitario}
                        onChange={(e) => atualizarItem(item.id, 'valorUnitario', Number(e.target.value))}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Total</Label>
                      <div className="text-lg font-semibold text-green-600">
                        R$ {item.valorTotal.toFixed(2)}
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      {itens.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Totais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Totais</h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="desconto">Desconto (R$)</Label>
                <Input
                  id="desconto"
                  name="desconto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.desconto}
                  onChange={handleChange}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Válido até *</Label>
                <Input
                  id="dataVencimento"
                  name="dataVencimento"
                  type="date"
                  value={formData.dataVencimento}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-y-2">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Subtotal: R$ {calcularSubtotal().toFixed(2)}
                </div>
                {formData.desconto > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Desconto: -R$ {formData.desconto.toFixed(2)}
                  </div>
                )}
                <div className="text-xl font-bold text-green-600">
                  Total: R$ {calcularTotal().toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Observações adicionais, condições de pagamento, etc."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
          >
            {loading ? "Criando..." : "Criar Orçamento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}