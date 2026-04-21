import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY

export async function POST(request: NextRequest) {
  if (!GOOGLE_KEY) {
    return NextResponse.json({ error: 'Chave Google Maps não configurada' }, { status: 500 })
  }

  const { origem, destino } = await request.json()

  if (!origem || !destino) {
    return NextResponse.json({ error: 'Origem e destino obrigatórios' }, { status: 400 })
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origem)}&destinations=${encodeURIComponent(destino)}&key=${GOOGLE_KEY}&language=pt-BR&units=metric&region=br`

  const res = await fetch(url)
  const data = await res.json()

  const element = data.rows?.[0]?.elements?.[0]

  if (!element || element.status !== 'OK') {
    return NextResponse.json({ error: 'Rota não encontrada' }, { status: 422 })
  }

  const distanciaKm = Math.round(element.distance.value / 1000)
  const duracaoMin = Math.round(element.duration.value / 60)

  return NextResponse.json({ distanciaKm, duracaoMin })
}
