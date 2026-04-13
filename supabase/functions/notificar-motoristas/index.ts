// Supabase Edge Function: notificar-motoristas
// Deploy: supabase functions deploy notificar-motoristas
//
// Esta função pode ser chamada via:
// 1. HTTP POST diretamente (com Authorization header)
// 2. Database Webhook quando orcamento.status = 'enviado'

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const UAZAP_API_URL = 'https://api.uazap.com/v1/messages/send'

interface OrcamentoPayload {
  orcamentoId?: string
  // Para database webhooks, o payload vem no formato:
  record?: {
    id: string
    status: string
  }
  type?: string
}

async function enviarWhatsApp(
  token: string,
  phone: string,
  message: string
): Promise<boolean> {
  try {
    const res = await fetch(UAZAP_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, message }),
    })
    return res.ok
  } catch {
    return false
  }
}

function formatarMensagem(orcamento: {
  origem: string
  destino: string
  descricao?: string | null
  peso_kg?: number | null
  valor_estimado?: number | null
  data_frete?: string | null
}): string {
  const valor = orcamento.valor_estimado
    ? `R$ ${orcamento.valor_estimado.toFixed(2).replace('.', ',')}`
    : 'A combinar'

  const peso = orcamento.peso_kg
    ? `${orcamento.peso_kg.toLocaleString('pt-BR')} kg`
    : 'Não informado'

  return `🚛 *NOVO FRETE DISPONÍVEL*

📍 *Origem:* ${orcamento.origem}
📍 *Destino:* ${orcamento.destino}
📦 *Carga:* ${orcamento.descricao || 'Não especificado'}
⚖️ *Peso:* ${peso}
💰 *Valor estimado:* ${valor}

Interessado? Responda esta mensagem!

_Plataforma FretesPro_`
}

Deno.serve(async (req: Request) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const uazapToken = Deno.env.get('UAZAP_TOKEN')!

  const supabase = createClient(supabaseUrl, serviceKey)

  let orcamentoId: string

  try {
    const body: OrcamentoPayload = await req.json()

    // Suporte a chamada direta ou database webhook
    if (body.orcamentoId) {
      orcamentoId = body.orcamentoId
    } else if (body.record?.id) {
      orcamentoId = body.record.id
    } else {
      return Response.json({ error: 'orcamentoId obrigatório' }, { status: 400 })
    }
  } catch {
    return Response.json({ error: 'Body inválido' }, { status: 400 })
  }

  // Buscar orçamento
  const { data: orcamento, error: orcError } = await supabase
    .from('orcamentos')
    .select('*')
    .eq('id', orcamentoId)
    .single()

  if (orcError || !orcamento) {
    return Response.json({ error: 'Orçamento não encontrado' }, { status: 404 })
  }

  // Buscar motoristas ativos
  let query = supabase
    .from('motoristas')
    .select('id, nome, whatsapp, tipo_veiculo')
    .eq('ativo', true)
    .eq('disponibilidade', 'ativo')

  if (orcamento.tipo_veiculo_necessario) {
    query = query.eq('tipo_veiculo', orcamento.tipo_veiculo_necessario)
  }

  const { data: motoristas } = await query
  const lista = motoristas ?? []

  if (lista.length === 0) {
    return Response.json({ success: true, enviados: 0, total: 0 })
  }

  const mensagem = formatarMensagem(orcamento)
  const notificacoes: {
    orcamento_id: string
    motorista_id: string
    mensagem: string
    status: string
  }[] = []
  let enviados = 0

  for (const motorista of lista) {
    const ok = await enviarWhatsApp(uazapToken, motorista.whatsapp, mensagem)
    notificacoes.push({
      orcamento_id: orcamentoId,
      motorista_id: motorista.id,
      mensagem,
      status: ok ? 'enviado' : 'falha',
    })
    if (ok) enviados++
  }

  // Registrar log
  if (notificacoes.length > 0) {
    await supabase.from('notificacoes').insert(notificacoes)
  }

  // Atualizar orçamento
  await supabase
    .from('orcamentos')
    .update({
      status: 'enviado',
      motoristas_notificados: enviados,
      enviado_em: new Date().toISOString(),
    })
    .eq('id', orcamentoId)

  return Response.json({
    success: true,
    enviados,
    total: lista.length,
  })
})
