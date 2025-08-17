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

export interface Senha {
  id: string
  titulo: string
  categoria: string
  usuario: string
  senha: string
  url?: string
  observacoes?: string
  dataRegistro: Date
  registradoPor?: string
}

export interface Projeto {
  id: string
  nome: string
  descricao: string
  clienteId?: string
  status: 'prospeccao' | 'desenvolvimento' | 'entregue'
  valor?: number
  dataInicio: Date
  dataPrevisao?: Date
  dataEntrega?: Date
  observacoes?: string
  registradoPor?: string
}
