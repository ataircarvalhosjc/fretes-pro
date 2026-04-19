import { NextRequest, NextResponse } from 'next/server'

const ORS_KEY = process.env.OPENROUTESERVICE_API_KEY

async function geocode(address: string): Promise<[number, number] | null> {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(address)}&boundary.country=BR&size=1`
  const res = await fetch(url)
  const data = await res.json()
  const feature = data.features?.[0]
  if (!feature) return null
  const [lng, lat] = feature.geometry.coordinates
  return [lng, lat]
}

export async function POST(request: NextRequest) {
  if (!ORS_KEY) {
    return NextResponse.json({ error: 'Chave ORS não configurada' }, { status: 500 })
  }

  const { origem, destino } = await request.json()

  if (!origem || !destino) {
    return NextResponse.json({ error: 'Origem e destino obrigatórios' }, { status: 400 })
  }

  const [coordOrigem, coordDestino] = await Promise.all([
    geocode(origem),
    geocode(destino),
  ])

  if (!coordOrigem || !coordDestino) {
    return NextResponse.json({ error: 'Não foi possível localizar os endereços' }, { status: 422 })
  }

  const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-hgv', {
    method: 'POST',
    headers: {
      'Authorization': ORS_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates: [coordOrigem, coordDestino],
    }),
  })

  const data = await res.json()
  const summary = data.routes?.[0]?.summary

  if (!summary) {
    return NextResponse.json({ error: 'Rota não encontrada' }, { status: 422 })
  }

  const distanciaKm = Math.round(summary.distance / 1000)
  const duracaoMin = Math.round(summary.duration / 60)

  return NextResponse.json({ distanciaKm, duracaoMin })
}
