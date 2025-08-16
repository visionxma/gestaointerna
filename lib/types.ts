export interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  linkSite: string
  servico: string
  dataRegistro: Date
  registradoPor?: string
}

export interface Receita {
  id: string
  descricao: string
  valor: number
  clienteId?: string
  categoria: string
  data: Date
  registradoPor?: string
}

export interface Despesa {
  id: string
  descricao: string
  valor: number
  categoria: string
  data: Date
  registradoPor?: string
}

export interface DashboardData {
  totalReceitas: number
  totalDespesas: number
  lucro: number
  totalClientes: number
  receitasMes: number
  despesasMes: number
}
