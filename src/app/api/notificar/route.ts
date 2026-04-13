import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { enviarWhatsApp, formatarMensagemFrete } from '@/lib/uazap'

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  let body: { orcamentoId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { orcamentoId } = body
  if (!orcamentoId) {
    return NextResponse.json({ error: 'orcamentoId obrigatório' }, { status: 400 })
  }

  // 1. Buscar orçamento
  const { data: orcamento, error: orcError } = await supabase
    .from('orcamentos')
    .select('*')
    .eq('id', orcamentoId)
    .single()

  if (orcError || !orcamento) {
    return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
  }

  // 2. Buscar motoristas ativos
  let query = supabase
    .from('motoristas')
    .select('*')
    .eq('ativo', true)
    .eq('disponibilidade', 'ativo')

  if (orcamento.tipo_veiculo_necessario) {
    query = query.eq('tipo_veiculo', orcamento.tipo_veiculo_necessario)
  }

  const { data: motoristas, error: motError } = await query

  if (motError) {
    return NextResponse.json({ error: 'Erro ao buscar motoristas' }, { status: 500 })
  }

  const lista = motoristas ?? []

  if (lista.length === 0) {
    return NextResponse.json({
      success: true,
      enviados: 0,
      total: 0,
      message: 'Nenhum motorista disponível para notificar',
    })
  }

  // 3. Montar mensagem
  const mensagem = formatarMensagemFrete(orcamento)

  // 4. Enviar WhatsApp para cada motorista
  const notificacoes: {
    orcamento_id: string
    motorista_id: string
    mensagem: string
    status: string
  }[] = []

  let enviados = 0

  for (const motorista of lista) {
    const success = await enviarWhatsApp(motorista.whatsapp, mensagem)
    notificacoes.push({
      orcamento_id: orcamentoId,
      motorista_id: motorista.id,
      mensagem,
      status: success ? 'enviado' : 'falha',
    })
    if (success) enviados++
  }

  // 5. Registrar notificações no banco
  if (notificacoes.length > 0) {
    await supabase.from('notificacoes').insert(notificacoes)
  }

  // 6. Atualizar status do orçamento
  await supabase
    .from('orcamentos')
    .update({
      status: 'enviado',
      motoristas_notificados: enviados,
      enviado_em: new Date().toISOString(),
    })
    .eq('id', orcamentoId)

  return NextResponse.json({
    success: true,
    enviados,
    total: lista.length,
    message: `${enviados} de ${lista.length} mensagens enviadas`,
  })
}
