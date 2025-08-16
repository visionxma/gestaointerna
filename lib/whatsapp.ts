export const formatPhoneNumber = (phone: string): string => {
  // Remove todos os caracteres não numéricos
  const numericPhone = phone.replace(/\D/g, "")

  // Se não começar com 55 (código do Brasil), adiciona
  if (!numericPhone.startsWith("55")) {
    return `55${numericPhone}`
  }

  return numericPhone
}

export const createWhatsAppUrl = (phone: string, message: string): string => {
  const formattedPhone = formatPhoneNumber(phone)
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
}

export const messageTemplates = {
  followUp: (clientName: string, service: string) =>
    `Olá ${clientName}! 👋\n\nEspero que esteja tudo bem!\n\nGostaria de saber como está o andamento do projeto: "${service}".\n\nEstou à disposição para qualquer dúvida ou ajuste necessário.\n\nAbraços! 😊`,

  newProject: (clientName: string) =>
    `Olá ${clientName}! 👋\n\nObrigado pelo interesse em nossos serviços de desenvolvimento!\n\nGostaria de agendar uma conversa para entender melhor suas necessidades e apresentar uma proposta personalizada.\n\nQuando seria um bom horário para você?\n\nAbraços! 😊`,

  support: (clientName: string, service: string) =>
    `Olá ${clientName}! 👋\n\nVi que você pode precisar de suporte técnico para o projeto: "${service}".\n\nEstou aqui para ajudar! Pode me contar qual é a situação?\n\nVamos resolver isso juntos! 💪`,

  invoice: (clientName: string, service: string) =>
    `Olá ${clientName}! 👋\n\nEspero que esteja satisfeito com o projeto: "${service}".\n\nEstou enviando a fatura para sua aprovação. Qualquer dúvida, estou à disposição!\n\nObrigado pela confiança! 😊`,
}
