import jsPDF from 'jspdf'
import type { Recibo } from './types'

export const gerarPDFRecibo = (recibo: Recibo) => {
  const pdf = new jsPDF()
  
  // Configurações
  const pageWidth = pdf.internal.pageSize.width
  const pageHeight = pdf.internal.pageSize.height
  const margin = 20
  let yPosition = 40

  // Cabeçalho da empresa
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('VISIONX', margin, yPosition)
  
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Soluções em Desenvolvimento Web, Desktop & Mobile', margin, yPosition + 12)
  pdf.text('visionxma@gmail.com • (99) 98468-0391', margin, yPosition + 22)

  yPosition += 50

  // Título do documento
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('RECIBO', pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 30

  // Texto principal do recibo de forma simples
  const formasPagamento = {
    'dinheiro': 'em dinheiro',
    'pix': 'via PIX',
    'cartao': 'no cartão de crédito',
    'transferencia': 'via transferência bancária',
    'boleto': 'via boleto bancário'
  }

  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  
  const textoRecibo = `Recebi de ${recibo.nomeCliente} a quantia de R$ ${recibo.valorPago.toLocaleString('pt-BR', {minimumFractionDigits: 2})} (${valorPorExtenso(recibo.valorPago)}) referente ao serviço de ${recibo.descricaoServico}, pago ${formasPagamento[recibo.formaPagamento]} em ${new Date(recibo.dataPagamento).toLocaleDateString('pt-BR')}.`
  
  const linhasTexto = pdf.splitTextToSize(textoRecibo, pageWidth - 40)
  pdf.text(linhasTexto, margin, yPosition)
  
  yPosition += linhasTexto.length * 8 + 20

  // Observações se existirem
  if (recibo.observacoes) {
    pdf.text(`Obs: ${recibo.observacoes}`, margin, yPosition)
    yPosition += 20
  }

  // Data e local
  yPosition += 20
  pdf.text(`Pedreiras/MA, ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition)

  // Assinatura
  yPosition += 60
  pdf.setLineWidth(0.5)
  pdf.line(pageWidth - 120, yPosition, pageWidth - 20, yPosition)
  pdf.setFontSize(10)
  pdf.text('VisionX', pageWidth - 70, yPosition + 10, { align: 'center' })
  pdf.text('Assinatura do Responsável', pageWidth - 70, yPosition + 20, { align: 'center' })

  // Rodapé simples
  const footerY = pageHeight - 20
  pdf.setTextColor(128, 128, 128)
  pdf.setFontSize(8)
  pdf.text(`Recibo Nº: ${recibo.numeroRecibo}`, margin, footerY)
  pdf.text('visionxma.com', pageWidth - 40, footerY)

  return pdf
}

// Função auxiliar para converter valor em extenso (versão simplificada)
const valorPorExtenso = (valor: number): string => {
  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']
  
  if (valor === 0) return 'zero reais'
  if (valor === 1) return 'um real'
  
  const parteInteira = Math.floor(valor)
  const centavos = Math.round((valor - parteInteira) * 100)
  
  let resultado = ''
  
  if (parteInteira >= 1000) {
    const milhares = Math.floor(parteInteira / 1000)
    if (milhares === 1) {
      resultado += 'mil '
    } else {
      resultado += converterCentenas(milhares) + ' mil '
    }
    const resto = parteInteira % 1000
    if (resto > 0) {
      resultado += converterCentenas(resto) + ' '
    }
  } else {
    resultado += converterCentenas(parteInteira) + ' '
  }
  
  resultado += parteInteira === 1 ? 'real' : 'reais'
  
  if (centavos > 0) {
    resultado += ' e ' + converterCentenas(centavos) + (centavos === 1 ? ' centavo' : ' centavos')
  }
  
  return resultado.trim()
  
  function converterCentenas(num: number): string {
    if (num === 0) return ''
    if (num === 100) return 'cem'
    
    let resultado = ''
    const c = Math.floor(num / 100)
    const d = Math.floor((num % 100) / 10)
    const u = num % 10
    
    if (c > 0) resultado += centenas[c] + ' '
    if (d === 1 && u > 0) resultado += especiais[u] + ' '
    else {
      if (d > 0) resultado += dezenas[d] + ' '
      if (u > 0 && d !== 1) resultado += unidades[u] + ' '
    }
    
    return resultado.trim()
  }
}

export const baixarPDFRecibo = (recibo: Recibo) => {
  const pdf = gerarPDFRecibo(recibo)
  pdf.save(`Recibo_${recibo.numeroRecibo}_${recibo.nomeCliente.replace(/\s+/g, '_')}.pdf`)
}

export const gerarWordRecibo = (recibo: Recibo) => {
  const formasPagamento = {
    'dinheiro': 'Dinheiro',
    'pix': 'PIX',
    'cartao': 'Cartão de Crédito',
    'transferencia': 'Transferência Bancária',
    'boleto': 'Boleto Bancário'
  }

  const statusText = recibo.status === 'pago' ? 'PAGO' : recibo.status === 'pendente' ? 'PENDENTE' : 'CANCELADO'

  const wordContent = `VISIONX
Soluções em Desenvolvimento Web, Desktop & Mobile
visionxma@gmail.com • (99) 98468-0391

---

RECIBO DE PAGAMENTO

Recibo Nº: ${recibo.numeroRecibo}
Data: ${new Date(recibo.dataCriacao).toLocaleDateString('pt-BR')}
Status: ${statusText}

---

DADOS DO CLIENTE

Nome: ${recibo.nomeCliente}
Email: ${recibo.emailCliente || 'Não informado'}
Telefone: ${recibo.telefoneCliente || 'Não informado'}

---

DETALHES DO PAGAMENTO

Serviço: ${recibo.descricaoServico}
Valor Pago: R$ ${recibo.valorPago.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
Data do Pagamento: ${new Date(recibo.dataPagamento).toLocaleDateString('pt-BR')}
Forma de Pagamento: ${formasPagamento[recibo.formaPagamento]}${recibo.dataVencimento ? `
Data de Vencimento: ${new Date(recibo.dataVencimento).toLocaleDateString('pt-BR')}` : ''}

${recibo.observacoes ? `Observações: ${recibo.observacoes}` : ''}

---

Assinatura do Responsável: _________________________

VisionX

---

VISIONX - Desenvolvedora de Software
Gerado em ${new Date().toLocaleString('pt-BR')}
visionxma.com`

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