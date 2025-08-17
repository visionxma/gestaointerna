import jsPDF from 'jspdf'
import type { Orcamento } from './types'

export const gerarPDFOrcamento = (orcamento: Orcamento) => {
  const pdf = new jsPDF()
  
  // Configurações
  const pageWidth = pdf.internal.pageSize.width
  const margin = 20
  let yPosition = 30

  // Cabeçalho VisionX
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.text('VISIONX', margin, yPosition)
  
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Soluções em Desenvolvimento', margin, yPosition + 8)
  
  // Linha divisória
  yPosition += 20
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)
  
  // Título do documento
  yPosition += 15
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text('ORÇAMENTO', margin, yPosition)
  
  // Número do orçamento e data
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Nº: ${orcamento.numeroOrcamento}`, pageWidth - 60, yPosition - 5)
  pdf.text(`Data: ${orcamento.dataCriacao.toLocaleDateString('pt-BR')}`, pageWidth - 60, yPosition + 5)
  
  // Dados do cliente
  yPosition += 25
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('DADOS DO CLIENTE:', margin, yPosition)
  
  yPosition += 8
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Nome: ${orcamento.nomeCliente}`, margin, yPosition)
  yPosition += 6
  pdf.text(`Email: ${orcamento.emailCliente}`, margin, yPosition)
  yPosition += 6
  pdf.text(`Telefone: ${orcamento.telefoneCliente}`, margin, yPosition)
  
  // Título do projeto
  yPosition += 15
  pdf.setFont('helvetica', 'bold')
  pdf.text('PROJETO:', margin, yPosition)
  yPosition += 8
  pdf.setFont('helvetica', 'normal')
  pdf.text(orcamento.titulo, margin, yPosition)
  
  if (orcamento.descricao) {
    yPosition += 8
    const descricaoLines = pdf.splitTextToSize(orcamento.descricao, pageWidth - 2 * margin)
    pdf.text(descricaoLines, margin, yPosition)
    yPosition += descricaoLines.length * 6
  }
  
  // Tabela de itens
  yPosition += 15
  pdf.setFont('helvetica', 'bold')
  pdf.text('ITENS DO ORÇAMENTO:', margin, yPosition)
  
  yPosition += 10
  // Cabeçalho da tabela
  pdf.setFontSize(10)
  pdf.text('DESCRIÇÃO', margin, yPosition)
  pdf.text('QTD', margin + 100, yPosition)
  pdf.text('VALOR UNIT.', margin + 120, yPosition)
  pdf.text('TOTAL', margin + 160, yPosition)
  
  // Linha do cabeçalho
  yPosition += 2
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)
  
  // Itens
  yPosition += 8
  pdf.setFont('helvetica', 'normal')
  orcamento.itens.forEach((item) => {
    pdf.text(item.descricao, margin, yPosition)
    pdf.text(item.quantidade.toString(), margin + 100, yPosition)
    pdf.text(`R$ ${item.valorUnitario.toFixed(2)}`, margin + 120, yPosition)
    pdf.text(`R$ ${item.valorTotal.toFixed(2)}`, margin + 160, yPosition)
    yPosition += 8
  })
  
  // Linha de separação
  pdf.line(margin, yPosition, pageWidth - margin, yPosition)
  
  // Totais
  yPosition += 10
  pdf.setFont('helvetica', 'bold')
  pdf.text(`Subtotal: R$ ${orcamento.subtotal.toFixed(2)}`, margin + 120, yPosition)
  
  if (orcamento.desconto > 0) {
    yPosition += 8
    pdf.text(`Desconto: R$ ${orcamento.desconto.toFixed(2)}`, margin + 120, yPosition)
  }
  
  yPosition += 8
  pdf.setFontSize(12)
  pdf.text(`TOTAL: R$ ${orcamento.valorTotal.toFixed(2)}`, margin + 120, yPosition)
  
  // Validade
  yPosition += 15
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Válido até: ${orcamento.dataVencimento.toLocaleDateString('pt-BR')}`, margin, yPosition)
  
  // Observações
  if (orcamento.observacoes) {
    yPosition += 15
    pdf.setFont('helvetica', 'bold')
    pdf.text('OBSERVAÇÕES:', margin, yPosition)
    yPosition += 8
    pdf.setFont('helvetica', 'normal')
    const obsLines = pdf.splitTextToSize(orcamento.observacoes, pageWidth - 2 * margin)
    pdf.text(obsLines, margin, yPosition)
    yPosition += obsLines.length * 6
  }
  
  // Rodapé com assinatura
  const footerY = pdf.internal.pageSize.height - 40
  pdf.line(margin, footerY, pageWidth - margin, footerY)
  
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('VISIONX - Soluções em Desenvolvimento', margin, footerY + 10)
  
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Este orçamento foi gerado automaticamente pelo sistema VisionX', margin, footerY + 20)
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, footerY + 28)
  
  return pdf
}

export const baixarPDFOrcamento = (orcamento: Orcamento) => {
  const pdf = gerarPDFOrcamento(orcamento)
  pdf.save(`Orcamento_${orcamento.numeroOrcamento}_${orcamento.nomeCliente}.pdf`)
}