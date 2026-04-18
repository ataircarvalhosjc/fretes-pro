import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const { motoristaId, fcmToken } = await req.json()
    if (!motoristaId || !fcmToken) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('motoristas')
      .update({ fcm_token: fcmToken })
      .eq('id', motoristaId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erro ao salvar FCM token motorista:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
