import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { enviarWhatsApp } from '@/lib/uazap'

export async function POST(req: NextRequest) {
  try {
    const { orcamentoId, motoristaId, resposta } = await req.json()

    if (!orcamentoId || !motoristaId || !['aceitar', 'recusar'].includes(resposta)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Atualizar resposta na tabela notificacoes
    const { error } = await supabase
      .from('notificacoes')
      .update({ resposta, respondido_em: new Date().toISOString() })
      .eq('orcamento_id', orcamentoId)
      .eq('motorista_id', motoristaId)

    if (error) throw error

    // Buscar dados do motorista e orçamento para notificar admin
    const [{ data: motorista }, { data: orcamento }] = await Promise.all([
      supabase.from('motoristas').select('nome, whatsapp').eq('id', motoristaId).single(),
      supabase.from('orcamentos').select('origem, destino').eq('id', orcamentoId).single(),
    ])

    // Notificar admin via WhatsApp
    if (motorista && orcamento) {
      const emoji = resposta === 'aceitar' ? '✅' : '❌'
      const acao = resposta === 'aceitar' ? 'ACEITOU' : 'RECUSOU'
      const msg =
        `${emoji} *MOTORISTA ${acao} O FRETE*\n\n` +
        `👤 *Motorista:* ${motorista.nome}\n` +
        `📲 *WhatsApp:* ${motorista.whatsapp}\n` +
        `📍 *Rota:* ${orcamento.origem} → ${orcamento.destino}\n\n` +
        `_Fretes IA Log_`
      enviarWhatsApp('5512982273194', msg).catch(console.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erro ao salvar resposta motorista:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
