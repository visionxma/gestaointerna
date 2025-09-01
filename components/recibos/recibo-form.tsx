"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adicionarRecibo, obterClientes } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"
import { Receipt } from "lucide-react"
import type { Cliente } from "@/lib/types"

interface ReciboFormProps {
  onReciboAdicionado: () => void
}

const formasPagamento = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'transferencia', label: 'Transferência Bancária' },
  { value: 'boleto', label: 'Boleto Bancário' },
]

export function ReciboForm({ onReciboAdicionado }: ReciboFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [formData, setFormData] = useState({
    clienteId: "none",
    nomeCliente: "",
    emailCliente: "",
    telefoneCliente: "",
    descricaoServico: "",
    valorPago: "",
    formaPagamento: "pix" as const,
    dataPagamento: new Date().toISOString().split("T")[0],
    dataVencimento: "",
    observacoes: "",
    status: "pago" as const,
  })

  useEffect(() => {
    const carregarClientes = async () => {
      try {
        // Verificar se a função existe
        if (typeof obterClientes === 'function') {
          const clientesData = await obterClientes()
          setClientes(clientesData)
        } else {
          console.error('obterClientes não é uma função')
          setClientes([])
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
        setClientes([])
        toast({
          title: "Aviso",
          description: "Não foi possível carregar clientes existentes.",
          variant: "destructive",
        })
      }
    }
    carregarClientes()
  }, [toast])

  const gerarNumeroRecibo = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const time = String(now.getTime()).slice(-4)
    return `REC-${year}${month}${day}-${time}`
  }

  const handleClienteChange = (clienteId: string) => {
    setFormData(prev => ({ ...prev, clienteId }))
    
    if (clienteId !== "none") {
      const cliente = clientes.find(c => c.id === clienteId)
      if (cliente) {
        setFormData(prev => ({
          ...prev,
          clienteId,
          nomeCliente: cliente.nome,
          emailCliente: cliente.email || "",
          telefoneCliente: cliente.telefone || "",
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        clienteId: "none",
        nomeCliente: "",
        emailCliente: "",
        telefoneCliente: "",
      }))
    }
  }

  const validarFormulario = () => {
    if (!formData.nomeCliente.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do cliente é obrigatório.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.descricaoServico.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Descrição do serviço é obrigatória.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.valorPago || Number.parseFloat(formData.valorPago) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Valor pago deve ser maior que zero.",
        variant: "destructive",
      })
      return false
    }

    if (!formData.dataPagamento) {
      toast({
        title: "Campo obrigatório",
        description: "Data do pagamento é obrigatória.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Iniciando criação do recibo...')
    console.log('Dados do formulário:', formData)
    
    // Verificar se a função adicionarRecibo existe
    if (typeof adicionarRecibo !== 'function') {
      console.error('adicionarRecibo não é uma função ou não foi importada corretamente')
      toast({
        title: "Erro de configuração",
        description: "Função adicionarRecibo não encontrada. Verifique a importação do banco de dados.",
        variant: "destructive",
      })
      return
    }
    
    if (!validarFormulario()) {
      return
    }
    
    setLoading(true)

    try {
      const numeroRecibo = gerarNumeroRecibo()
      console.log('Número do recibo gerado:', numeroRecibo)

      const reciboData = {
        numeroRecibo,
        clienteId: formData.clienteId !== "none" ? formData.clienteId : undefined,
        nomeCliente: formData.nomeCliente.trim(),
        emailCliente: formData.emailCliente.trim() || undefined,
        telefoneCliente: formData.telefoneCliente.trim() || undefined,
        descricaoServico: formData.descricaoServico.trim(),
        valorPago: Number.parseFloat(formData.valorPago),
        formaPagamento: formData.formaPagamento,
        dataPagamento: new Date(formData.dataPagamento),
        dataVencimento: formData.dataVencimento ? new Date(formData.dataVencimento) : undefined,
        observacoes: formData.observacoes.trim() || undefined,
        status: formData.status,
        dataCriacao: new Date(),
      }

      console.log('Dados que serão enviados para adicionarRecibo:', reciboData)

      // Tentativa de salvar o recibo
      const resultado = await adicionarRecibo(reciboData)
      console.log('Resultado da operação:', resultado)

      console.log('Recibo criado com sucesso!')

      toast({
        title: "Sucesso!",
        description: `Recibo ${numeroRecibo} criado com sucesso!`,
      })

      // Reset form
      setFormData({
        clienteId: "none",
        nomeCliente: "",
        emailCliente: "",
        telefoneCliente: "",
        descricaoServico: "",
        valorPago: "",
        formaPagamento: "pix",
        dataPagamento: new Date().toISOString().split("T")[0],
        dataVencimento: "",
        observacoes: "",
        status: "pago",
      })

      // Chama a função callback
      if (typeof onReciboAdicionado === 'function') {
        onReciboAdicionado()
      }

    } catch (error) {
      console.error('Erro ao criar recibo:', error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar recibo. Verifique a configuração do banco de dados.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
      {/* Decorações de fundo */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gray-300 rounded-full opacity-10 -translate-y-20 translate-x-20" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-black rounded-full opacity-5 translate-y-14 -translate-x-14" />

      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-gray-700" />
          <CardTitle className="text-xl font-bold text-gray-900">Criar Novo Recibo</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Preencha os dados para gerar um recibo de pagamento.
        </p>
      </CardHeader>

      <CardContent className="relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dados do Cliente</h3>
            
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
                <Label htmlFor="emailCliente">Email</Label>
                <Input
                  id="emailCliente"
                  name="emailCliente"
                  type="email"
                  value={formData.emailCliente}
                  onChange={handleChange}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefoneCliente">Telefone</Label>
                <Input
                  id="telefoneCliente"
                  name="telefoneCliente"
                  value={formData.telefoneCliente}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Dados do Pagamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dados do Pagamento</h3>
            
            <div className="space-y-2">
              <Label htmlFor="descricaoServico">Descrição do Serviço *</Label>
              <Textarea
                id="descricaoServico"
                name="descricaoServico"
                value={formData.descricaoServico}
                onChange={handleChange}
                required
                placeholder="Descreva o serviço prestado"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="valorPago">Valor Pago (R$) *</Label>
                <Input
                  id="valorPago"
                  name="valorPago"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorPago}
                  onChange={handleChange}
                  required
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento *</Label>
                <Select
                  value={formData.formaPagamento}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, formaPagamento: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a forma" />
                  </SelectTrigger>
                  <SelectContent>
                    {formasPagamento.map((forma) => (
                      <SelectItem key={forma.value} value={forma.value}>
                        {forma.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dataPagamento">Data do Pagamento *</Label>
                <Input
                  id="dataPagamento"
                  name="dataPagamento"
                  type="date"
                  value={formData.dataPagamento}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                <Input
                  id="dataVencimento"
                  name="dataVencimento"
                  type="date"
                  value={formData.dataVencimento}
                  onChange={handleChange}
                />
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
              placeholder="Observações adicionais sobre o pagamento"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
          >
            {loading ? "Criando..." : "Criar Recibo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}