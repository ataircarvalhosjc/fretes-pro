const UAZAP_API_URL = 'https://api.uazap.com/v1/messages/send'

export async function enviarWhatsApp(phone: string, message: string): Promise<boolean> {
  const token = process.env.UAZAP_TOKEN

  if (!token || token === 'placeholder-uazap-token') {
    console.error('[uazap] UAZAP_TOKEN não configurado ou é placeholder')
    return false
  }

  console.log(`[uazap] Enviando para ${phone} | token: ${token.slice(0, 8)}...`)

  try {
    const response = await fetch(UAZAP_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, message }),
    })

    const body = await response.text()
    console.log(`[uazap] Status: ${response.status} | Resposta: ${body}`)

    if (!response.ok) {
      console.error(`[uazap] Erro ${response.status}:`, body)
      return false
    }

    return true
  } catch (error) {
    console.error('[uazap] Falha na requisição:', error)
    return false
  }
}

export function formatarMensagemFrete(orcamento: {
  origem: string
  destino: string
  descricao?: string | null
  peso_kg?: number | null
  valor_estimado?: number | null
  data_frete?: string | null
}): string {
  const valor = orcamento.valor_estimado
    ? `R$ ${orcamento.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : 'A combinar'

  const peso = orcamento.peso_kg
    ? `${orcamento.peso_kg.toLocaleString('pt-BR')} kg`
    : 'Não informado'

  const data = orcamento.data_frete
    ? new Date(orcamento.data_frete + 'T12:00:00').toLocaleDateString('pt-BR')
    : 'A combinar'

  return `🚛 *NOVO FRETE DISPONÍVEL*

📍 *Origem:* ${orcamento.origem}
📍 *Destino:* ${orcamento.destino}
📦 *Carga:* ${orcamento.descricao || 'Não especificado'}
⚖️ *Peso:* ${peso}
📅 *Data:* ${data}
💰 *Valor estimado:* ${valor}

Interessado? Responda esta mensagem!

_Fretes IA Log_`
}
