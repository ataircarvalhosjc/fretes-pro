const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE_ID
const ZAPI_TOKEN = process.env.ZAPI_TOKEN

export async function enviarWhatsApp(phone: string, message: string): Promise<boolean> {
  if (!ZAPI_INSTANCE || !ZAPI_TOKEN) {
    console.error('[zapi] ZAPI_INSTANCE_ID ou ZAPI_TOKEN não configurado')
    return false
  }

  console.log(`[zapi] Enviando para ${phone}`)

  try {
    const response = await fetch(
      `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
      }
    )

    const body = await response.text()
    console.log(`[zapi] Status: ${response.status} | Resposta: ${body}`)

    if (!response.ok) {
      console.error(`[zapi] Erro ${response.status}:`, body)
      return false
    }

    return true
  } catch (error) {
    console.error('[zapi] Falha na requisição:', error)
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
