import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { enviarWhatsApp } from '@/lib/uazap'

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  let body: { orcamentoId?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { orcamentoId, status } = body

  if (!orcamentoId || !status) {
    return NextResponse.json({ error: 'orcamentoId e status são obrigatórios' }, { status: 400 })
  }

  if (!['concluido', 'cancelado'].includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  // Buscar orçamento
  const { data: orcamento } = await supabase
    .from('orcamentos')
    .select('*')
    .eq('id', orcamentoId)
    .single()

  if (!orcamento) {
    return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
  }

  // Buscar motoristas que foram notificados neste orçamento
  const { data: notificacoes } = await supabase
    .from('notificacoes')
    .select('motorista_id, motoristas(nome, whatsapp)')
    .eq('orcamento_id', orcamentoId)
    .eq('status', 'enviado')

  if (!notificacoes || notificacoes.length === 0) {
    // Atualizar status mesmo sem motoristas para notificar
    await supabase.from('orcamentos').update({ status }).eq('id', orcamentoId)
    return NextResponse.json({ success: true, enviados: 0 })
  }

  // Montar mensagem conforme status
  const origem = orcamento.origem
  const destino = orcamento.destino

  const mensagem =
    status === 'concluido'
      ? `✅ *FRETE CONFIRMADO*\n\n📍 ${origem} → ${destino}\n\nParabéns! O frete foi confirmado. Entre em contato para combinar os detalhes.\n\n_FretesPro_`
      : `❌ *FRETE CANCELADO*\n\n📍 ${origem} → ${destino}\n\nInfelizmente este frete foi cancelado. Fique atento aos próximos!\n\n_FretesPro_`

  // Enviar WhatsApp para cada motorista notificado
  let enviados = 0
  for (const notif of notificacoes) {
    const motorista = notif.motoristas as unknown as { nome: string; whatsapp: string } | null
    if (motorista?.whatsapp) {
      const ok = await enviarWhatsApp(motorista.whatsapp, mensagem)
      if (ok) enviados++
    }
  }

  // Atualizar status do orçamento
  await supabase.from('orcamentos').update({ status }).eq('id', orcamentoId)

  return NextResponse.json({ success: true, enviados, total: notificacoes.length })
}
