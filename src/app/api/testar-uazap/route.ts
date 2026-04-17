import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.UAZAP_TOKEN

  if (!token || token === 'placeholder-uazap-token') {
    return NextResponse.json({ ok: false, erro: 'UAZAP_TOKEN não configurado' })
  }

  try {
    const response = await fetch('https://ipazua.uazapi.com/send/text', {
      method: 'POST',
      headers: {
        'token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: '5512982273194',
        text: '✅ Teste Fretes IA Log — uazap funcionando!'
      }),
    })

    const body = await response.text()

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      resposta: body,
      token_inicio: token.slice(0, 12) + '...',
    })
  } catch (err: unknown) {
    return NextResponse.json({
      ok: false,
      erro: err instanceof Error ? err.message : 'Erro desconhecido'
    })
  }
}
