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

  const { nome, whatsapp, tipo_veiculo, cidade, estado, categoria_cnh, email, placa, cpf } = body

  if (!nome || !whatsapp || !tipo_veiculo) {
    return NextResponse.json({ error: 'Nome, WhatsApp e tipo de veículo são obrigatórios' }, { status: 400 })
  }

  // Formatar whatsapp: remover tudo que não é número
  const whatsappFormatado = String(whatsapp).replace(/\D/g, '')

  const { data, error } = await supabase
    .from('motoristas')
    .insert({
      nome,
      whatsapp: whatsappFormatado,
      tipo_veiculo,
      cidade: cidade || null,
      estado: estado || null,
      categoria_cnh: categoria_cnh || null,
      email: email || null,
      placa: placa || null,
      cpf: cpf || null,
      disponibilidade: 'ativo',
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
