import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { enviarWhatsApp } from '@/lib/uazap'

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { cliente_nome, cliente_whatsapp, origem, destino } = body

  if (!cliente_nome || !cliente_whatsapp || !origem || !destino) {
    return NextResponse.json(
      { error: 'Nome, WhatsApp, origem e destino são obrigatórios' },
      { status: 400 }
    )
  }

  const whatsapp = String(cliente_whatsapp).replace(/\D/g, '')

  const { data, error } = await supabase
    .from('orcamentos')
    .insert({
      cliente_nome: body.cliente_nome,
      cliente_whatsapp: whatsapp,
      origem: body.origem,
      destino: body.destino,
      descricao: body.descricao || null,
      tipo_veiculo_necessario: body.tipo_veiculo_necessario || null,
      peso_kg: body.peso_kg ? parseInt(String(body.peso_kg)) : null,
      valor_estimado: body.valor_estimado ? parseFloat(String(body.valor_estimado)) : null,
      data_frete: body.data_frete || null,
      horario_frete: body.horario_frete || null,
      observacoes: body.observacoes || null,
      status: 'pendente',
    })
    .select('id')
    .single()

  if (error) {
    console.error('[solicitar-frete]', error)
    return NextResponse.json({ error: 'Erro ao registrar solicitação' }, { status: 500 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fretes-pro-cv53.vercel.app'
  const linkRastreio = `${baseUrl}/rastrear/${data.id}`

  // Notificação para o admin
  const msgAdmin = `🔔 *NOVO PEDIDO DE FRETE*\n\n👤 *Cliente:* ${body.cliente_nome}\n📲 *WhatsApp:* ${whatsapp}\n📍 *De:* ${body.origem}\n📍 *Para:* ${body.destino}${body.descricao ? `\n📦 *Carga:* ${body.descricao}` : ''}${body.peso_kg ? `\n⚖️ *Peso:* ${body.peso_kg} kg` : ''}${body.data_frete ? `\n📅 *Data:* ${body.data_frete}${body.horario_frete ? ` às ${body.horario_frete}` : ''}` : ''}${body.observacoes ? `\n📝 *Obs:* ${body.observacoes}` : ''}\n\n🔍 *Rastreamento:*\n${linkRastreio}\n\n⚡ Acesse o painel para aprovar!\n\n_Fretes IA Log_`

  enviarWhatsApp('5512982273194', msgAdmin).catch(console.error)

  return NextResponse.json({ success: true, id: data.id })
}
