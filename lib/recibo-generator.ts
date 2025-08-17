import jsPDF from 'jspdf'
import type { Recibo } from './types'

export const gerarPDFRecibo = (recibo: Recibo) => {
  const pdf = new jsPDF()
  
  // Configurações
  const pageWidth = pdf.internal.pageSize.width
  const pageHeight = pdf.internal.pageSize.height
  const margin = 20
  let yPosition = 30

  // Função para adicionar espaçamento
  const addSpacing = (type: 'small' | 'medium' | 'large') => {
    const spacings = { small: 8, medium: 15, large: 25 }
    yPosition += spacings[type]
  }

  // Cabeçalho da empresa
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

  // Título do documento
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text('RECIBO DE PAGAMENTO', margin, yPosition)
  
  // Número do recibo (alinhado à direita)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Recibo Nº: ${recibo.numeroRecibo}`, pageWidth - margin - 60, yPosition - 5)
  pdf.text(`Data: ${new Date(recibo.dataCriacao).toLocaleDateString('pt-BR')}`, pageWidth - margin - 60, yPosition + 5)
  addSpacing('large')

  // Status
  const statusColor = recibo.status === 'pago' ? [0, 128, 0] : recibo.status === 'pendente' ? [255, 165, 0] : [255, 0, 0]
  pdf.setTextColor(...statusColor)
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  const statusText = recibo.status === 'pago' ? 'PAGO' : recibo.status === 'pendente' ? 'PENDENTE' : 'CANCELADO'
  pdf.text(`STATUS: ${statusText}`, margin, yPosition)
  addSpacing('large')

  // Dados do cliente
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('DADOS DO CLIENTE', margin, yPosition)
  
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPosition + 2, margin + 60, yPosition + 2)
  addSpacing('medium')
  
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  const labelWidth = 50
  
  pdf.text('Nome:', margin, yPosition)
  pdf.text(recibo.nomeCliente, margin + labelWidth, yPosition)
  addSpacing('small')
  
  pdf.text('Email:', margin, yPosition)
  pdf.text(recibo.emailCliente || 'Não informado', margin + labelWidth, yPosition)
  addSpacing('small')
  
  if (recibo.telefoneCliente) {
    pdf.text('Telefone:', margin, yPosition)
    pdf.text(recibo.telefoneCliente, margin + labelWidth, yPosition)
    addSpacing('small')
  }
  addSpacing('medium')

  // Detalhes do pagamento
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text('DETALHES DO PAGAMENTO', margin, yPosition)
  
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPosition + 2, margin + 80, yPosition + 2)
  addSpacing('medium')

  // Caixa com fundo cinza para destacar o valor
  pdf.setFillColor(245, 245, 245)
  pdf.rect(margin, yPosition, pageWidth - 40, 40, 'F')
  
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  
  pdf.text('Serviço:', margin + 5, yPosition + 10)
  const servicoLines = pdf.splitTextToSize(recibo.descricaoServico, pageWidth - 80)
  pdf.text(servicoLines, margin + 5, yPosition + 20)
  
  // Valor em destaque
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(0, 128, 0)
  const valorText = `R$ ${recibo.valorPago.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
  const valorWidth = pdf.getTextWidth(valorText)
  pdf.text(valorText, pageWidth - margin - valorWidth - 5, yPosition + 25)
  
  yPosition += 50
  addSpacing('medium')

  // Informações de pagamento
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  
  const formasPagamento = {
    'dinheiro': 'Dinheiro',
    'pix': 'PIX',
    'cartao': 'Cartão',
    'transferencia': 'Transferência Bancária',
    'boleto': 'Boleto Bancário'
  }
  
  pdf.text('Data do Pagamento:', margin, yPosition)
  pdf.text(new Date(recibo.dataPagamento).toLocaleDateString('pt-BR'), margin + labelWidth, yPosition)
  addSpacing('small')
  
  pdf.text('Forma de Pagamento:', margin, yPosition)
  pdf.text(formasPagamento[recibo.formaPagamento], margin + labelWidth, yPosition)
  addSpacing('small')

  if (recibo.dataVencimento) {
    pdf.text('Data de Vencimento:', margin, yPosition)
    pdf.text(new Date(recibo.dataVencimento).toLocaleDateString('pt-BR'), margin + labelWidth, yPosition)
    addSpacing('small')
  }
  addSpacing('large')

  // Observações
  if (recibo.observacoes) {
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('OBSERVAÇÕES:', margin, yPosition)
    addSpacing('small')
    addSpacing('small')
    
    pdf.setFont('helvetica', 'normal')
    const obsLines = pdf.splitTextToSize(recibo.observacoes, pageWidth - 40)
    pdf.text(obsLines, margin, yPosition)
    yPosition += obsLines.length * 5
    addSpacing('large')
  }

  // Assinatura
  yPosition = Math.max(yPosition, pageHeight - 80)
  
  pdf.setLineWidth(0.5)
  pdf.line(margin, yPosition, margin + 80, yPosition)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Assinatura do Responsável', margin, yPosition + 10)
  pdf.text('VisionX', margin, yPosition + 20)

  // Rodapé
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

  return pdf
}

export const baixarPDFRecibo = (recibo: Recibo) => {
  const pdf = gerarPDFRecibo(recibo)
  pdf.save(`Recibo_${recibo.numeroRecibo}_${recibo.nomeCliente.replace(/\s+/g, '_')}.pdf`)
}

export const gerarWordRecibo = (recibo: Recibo) => {
  const formasPagamento = {
    'dinheiro': 'Dinheiro',
    'pix': 'PIX',
    'cartao': 'Cartão',
    'transferencia': 'Transferência Bancária',
    'boleto': 'Boleto Bancário'
  }

  const statusText = recibo.status === 'pago' ? 'PAGO' : recibo.status === 'pendente' ? 'PENDENTE' : 'CANCELADO'

  const wordContent = `
VISIONX
Soluções em Desenvolvimento Web, Desktop & Mobile
visionxma@gmail.com • (99) 98468-0391

═══════════════════════════════════════════════════════════════

RECIBO DE PAGAMENTO

Recibo Nº: ${recibo.numeroRecibo}
Data: ${new Date(recibo.dataCriacao).toLocaleDateString('pt-BR')}
Status: ${statusText}

═══════════════════════════════════════════════════════════════

DADOS DO CLIENTE

Nome: ${recibo.nomeCliente}
Email: ${recibo.emailCliente || 'Não informado'}
Telefone: ${recibo.telefoneCliente || 'Não informado'}

═══════════════════════════════════════════════════════════════

DETALHES DO PAGAMENTO

Serviço: ${recibo.descricaoServico}

Valor Pago: R$ ${recibo.valorPago.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

Data do Pagamento: ${new Date(recibo.dataPagamento).toLocaleDateString('pt-BR')}
Forma de Pagamento: ${formasPagamento[recibo.formaPagamento]}
${recibo.dataVencimento ? `Data de Vencimento: ${new Date(recibo.dataVencimento).toLocaleDateString('pt-BR')}` : ''}

${recibo.observacoes ? `\nOBSERVAÇÕES:\n${recibo.observacoes}` : ''}

═══════════════════════════════════════════════════════════════

Assinatura do Responsável: _________________________
VisionX

═══════════════════════════════════════════════════════════════

VISIONX - Desenvolvedora de Software
Gerado em ${new Date().toLocaleString('pt-BR')}
visionxma.com
  `.trim()

  return wordContent
}

export const baixarWordRecibo = (recibo: Recibo) => {
  const content = gerarWordRecibo(recibo)
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Recibo_${recibo.numeroRecibo}_${recibo.nomeCliente.replace(/\s+/g, '_')}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}