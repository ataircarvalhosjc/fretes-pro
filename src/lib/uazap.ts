const UAZAP_API_URL = 'https://api.uazap.com/v1/messages/send'

export async function enviarWhatsApp(phone: string, message: string): Promise<boolean> {
  const token = process.env.UAZAP_TOKEN

  if (!token) {
    console.error('[uazap] UAZAP_TOKEN não configurado')
    return false
  }

  try {
    const response = await fetch(UAZAP_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, message }),
    })

    if (!response.ok) {
      const body = await response.text()
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

_Plataforma FretesPro_`
}
