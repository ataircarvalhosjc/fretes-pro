import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { orcamentoId, fcmToken } = await req.json()

    if (!orcamentoId || !fcmToken) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { error } = await supabase
      .from('orcamentos')
      .update({ fcm_token: fcmToken })
      .eq('id', orcamentoId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erro ao salvar FCM token:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
