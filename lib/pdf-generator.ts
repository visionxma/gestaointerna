import jsPDF from 'jspdf'
import type { Orcamento } from './types'

export const gerarPDFOrcamento = (orcamento: Orcamento) => {
  const pdf = new jsPDF()
  
  // Configurações
  const pageWidth = pdf.internal.pageSize.width
  const pageHeight = pdf.internal.pageSize.height
  const margin = 20
  const usableHeight = pageHeight - 40 // Espaço para cabeçalho e rodapé
  const footerHeight = 35 // Altura reservada para rodapé
  let yPosition = 30
  let currentPage = 1

  // Função para verificar se precisa de nova página
  const checkNewPage = (requiredSpace: number = 15) => {
    if (yPosition + requiredSpace + footerHeight > pageHeight - margin) {
      addNewPage()
      return true
    }
    return false
  }

  // Função para adicionar espaçamento padronizado
  const addSpacing = (type: 'small' | 'medium' | 'large') => {
    const spacings = { small: 8, medium: 15, large: 25 }
    yPosition += spacings[type]
  }

  // Função para adicionar nova página
  const addNewPage = () => {
    addFooter(currentPage)
    pdf.addPage()
    currentPage++
    yPosition = 30
    addHeader()
  }

  // Função para adicionar cabeçalho
  const addHeader = () => {
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('VisionX', margin, yPosition)
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Soluções em Desenvolvimento Web, Desktop & Mobile', margin, yPosition + 10)
    pdf.text('visionxma@gmail.com • (99) 98468-0391', margin, yPosition + 20)

    // Linha separadora
    pdf.setLineWidth(1)
    pdf.line(margin, yPosition + 25, pageWidth - margin, yPosition + 25)
    
    yPosition += 35
  }

  // Função para adicionar rodapé
  const addFooter = (pageNum: number) => {
    const footerY = pageHeight - 25
    
    pdf.setLineWidth(0.5)
    pdf.setDrawColor(128, 128, 128)
    pdf.line(margin, footerY, pageWidth - margin, footerY)
    
    pdf.setTextColor(128, 128, 128)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.text('VISIONX - Desenvolvedora de Software', margin, footerY + 8)
    pdf.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, margin, footerY + 15)
    pdf.text('visionxma.com', pageWidth - 40, footerY + 8)
    pdf.text(`Página ${pageNum}`, pageWidth - 40, footerY + 15)
  }

  // Cabeçalho inicial
  addHeader()

  // Título do documento
  checkNewPage(35)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('PROPOSTA COMERCIAL', margin, yPosition)
  
  // Informações do orçamento (alinhadas à direita)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  const infoWidth = 70
  pdf.text(`Orçamento Nº: ${orcamento.numeroOrcamento}`, pageWidth - margin - infoWidth, yPosition - 5)
  pdf.text(`Data: ${new Date(orcamento.dataCriacao).toLocaleDateString('pt-BR')}`, pageWidth - margin - infoWidth, yPosition + 5)
  addSpacing('large')

  // Dados do cliente
  checkNewPage(60)
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('DADOS DO CLIENTE', margin, yPosition)
  
  // Linha abaixo do título
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPosition + 2, margin + 60, yPosition + 2)
  addSpacing('medium')
  
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  const labelWidth = 50
  
  pdf.text('Nome:', margin, yPosition)
  pdf.text(orcamento.nomeCliente, margin + labelWidth, yPosition)
  addSpacing('small')
  
  pdf.text('Email:', margin, yPosition)
  pdf.text(orcamento.emailCliente || 'Não informado', margin + labelWidth, yPosition)
  addSpacing('small')
  
  if (orcamento.telefoneCliente) {
    pdf.text('Telefone:', margin, yPosition)
    pdf.text(orcamento.telefoneCliente, margin + labelWidth, yPosition)
    addSpacing('small')
  }
  addSpacing('medium')

  // Informações do projeto
  checkNewPage(50)
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('PROJETO', margin, yPosition)
  
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPosition + 2, margin + 35, yPosition + 2)
  addSpacing('medium')
  
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.text(orcamento.titulo, margin, yPosition)
  addSpacing('medium')

  // Descrição/Observações
  if (orcamento.observacoes) {
    const descLines = pdf.splitTextToSize(orcamento.observacoes, pageWidth - 40)
    const descHeight = descLines.length * 5 + 35
    
    checkNewPage(descHeight)
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DESCRIÇÃO:', margin, yPosition)
    addSpacing('small')
    addSpacing('small')
    
    pdf.setFont('helvetica', 'normal')
    
    // Verificar se a descrição precisa ser quebrada entre páginas
    for (let i = 0; i < descLines.length; i++) {
      checkNewPage(10)
      pdf.text(descLines[i], margin, yPosition)
      yPosition += 5
    }
    addSpacing('medium')
  }

  // Tabela de itens
  checkNewPage(70)
  addSpacing('medium')
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('ITENS DA PROPOSTA', margin, yPosition)
  
  // Linha dupla para destaque
  pdf.setLineWidth(1)
  pdf.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2)
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPosition + 4, pageWidth - margin, yPosition + 4)
  addSpacing('medium')

  // Função para adicionar cabeçalho da tabela
  const addTableHeader = () => {
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    
    // Posições das colunas alinhadas
    const cols = {
      descricao: margin,
      quantidade: margin + 105,
      valorUnit: margin + 135,
      total: margin + 165
    }
    
    pdf.text('DESCRIÇÃO', cols.descricao, yPosition)
    pdf.text('QTD', cols.quantidade, yPosition)
    pdf.text('VALOR UNIT.', cols.valorUnit, yPosition)
    pdf.text('TOTAL', cols.total, yPosition)

    // Linha abaixo do cabeçalho
    pdf.setLineWidth(0.3)
    pdf.line(margin, yPosition + 3, pageWidth - margin, yPosition + 3)
    addSpacing('small')
    addSpacing('small')
  }

  // Cabeçalho da tabela
  addTableHeader()

  // Itens da tabela
  pdf.setFont('helvetica', 'normal')
  
  // Posições das colunas (mesmas do cabeçalho)
  const cols = {
    descricao: margin,
    quantidade: margin + 105,
    valorUnit: margin + 135,
    total: margin + 165
  }
  
  orcamento.itens.forEach((item, index) => {
    // Verificar se precisa de nova página antes de cada item
    if (checkNewPage(18)) {
      addTableHeader() // Adicionar cabeçalho novamente na nova página
    }
    
    // Truncar descrição se muito longa
    const maxDescWidth = 90
    const descricao = pdf.getTextWidth(item.descricao) > maxDescWidth 
      ? item.descricao.substring(0, 35) + '...'
      : item.descricao
    
    pdf.text(descricao, cols.descricao, yPosition)
    pdf.text(item.quantidade.toString(), cols.quantidade, yPosition)
    pdf.text(`R$ ${item.valorUnitario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, cols.valorUnit, yPosition)
    pdf.text(`R$ ${item.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, cols.total, yPosition)
    
    yPosition += 10
  })

  // Totais
  checkNewPage(60)
  addSpacing('medium')
  
  // Linha de separação antes dos totais
  pdf.setLineWidth(0.5)
  pdf.line(margin + 90, yPosition, pageWidth - margin, yPosition)
  addSpacing('small')
  addSpacing('small')

  // Posições alinhadas para os totais
  const totalCols = {
    label: margin + 115,
    value: margin + 165
  }

  pdf.setFont('helvetica', 'normal')
  pdf.text('Subtotal:', totalCols.label, yPosition)
  pdf.text(`R$ ${orcamento.subtotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, totalCols.value, yPosition)
  addSpacing('small')

  if (orcamento.desconto > 0) {
    pdf.text('Desconto:', totalCols.label, yPosition)
    pdf.text(`R$ ${orcamento.desconto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, totalCols.value, yPosition)
    addSpacing('small')
  }

  addSpacing('small')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(12)
  pdf.text('TOTAL GERAL:', totalCols.label - 5, yPosition)
  pdf.text(`R$ ${orcamento.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, totalCols.value, yPosition)

  // Linha dupla após o total
  pdf.setLineWidth(1)
  pdf.line(margin + 90, yPosition + 5, pageWidth - margin, yPosition + 5)
  pdf.setLineWidth(0.5)
  pdf.line(margin + 90, yPosition + 7, pageWidth - margin, yPosition + 7)
  addSpacing('large')

  // Validade
  checkNewPage(35)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`Proposta válida até: ${new Date(orcamento.dataVencimento).toLocaleDateString('pt-BR')}`, margin, yPosition)
  addSpacing('large')

  // Termos e condições
  checkNewPage(70)
  pdf.setTextColor(128, 128, 128)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('TERMOS E CONDIÇÕES:', margin, yPosition)
  addSpacing('small')
  addSpacing('small')
  
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  const termos = [
    '• Proposta válida por 30 dias a partir da data de emissão',
    '• Prazo de entrega conforme especificado no projeto',
    '• Forma de pagamento a ser definida',
    '• Alterações no escopo podem impactar no valor final'
  ]
  
  termos.forEach(termo => {
    checkNewPage(10)
    pdf.text(termo, margin, yPosition)
    yPosition += 7
  })

  // Adicionar rodapé na última página
  addFooter(currentPage)

  return pdf
}

export const baixarPDFOrcamento = (orcamento: Orcamento) => {
  const pdf = gerarPDFOrcamento(orcamento)
  pdf.save(`Proposta_${orcamento.numeroOrcamento}_${orcamento.nomeCliente.replace(/\s+/g, '_')}.pdf`)
}