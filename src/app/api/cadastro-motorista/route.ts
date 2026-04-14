import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { nome, whatsapp, tipo_veiculo } = body

  if (!nome || !whatsapp || !tipo_veiculo) {
    return NextResponse.json({ error: 'Nome, WhatsApp e tipo de veículo são obrigatórios' }, { status: 400 })
  }

  const whatsappFormatado = String(whatsapp).replace(/\D/g, '')

  const { data, error } = await supabase
    .from('motoristas')
    .insert({
      nome: body.nome,
      cpf: body.cpf || null,
      data_nascimento: body.data_nascimento || null,
      whatsapp: whatsappFormatado,
      email: body.email || null,
      cidade: body.cidade || null,
      estado: body.estado || null,
      numero_cnh: body.numero_cnh || null,
      categoria_cnh: body.categoria_cnh || null,
      validade_cnh: body.validade_cnh || null,
      rntrc: body.rntrc || null,
      tipo_veiculo: body.tipo_veiculo,
      placa: body.placa || null,
      ano_veiculo: body.ano_veiculo || null,
      tipo_carroceria: body.tipo_carroceria || null,
      capacidade_kg: body.capacidade_kg || null,
      aceita_fracionado: body.aceita_fracionado ?? false,
      aceita_refrigerado: body.aceita_refrigerado ?? false,
      disponibilidade: body.disponibilidade || 'ativo',
      ativo: true,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[cadastro-motorista]', error)
    return NextResponse.json({ error: 'Erro ao cadastrar motorista' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id })
}
