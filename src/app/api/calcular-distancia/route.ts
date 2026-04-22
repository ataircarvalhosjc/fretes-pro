import { NextRequest, NextResponse } from 'next/server'

async function geocodeCep(cep: string): Promise<[number, number] | null> {
  try {
    const digits = cep.replace(/\D/g, '')
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    const data = await res.json()
    if (data.erro) return null

    // Busca coordenadas pelo endereço via Nominatim (OpenStreetMap) — gratuito
    const endereco = `${data.logradouro || ''} ${data.bairro || ''} ${data.localidade} ${data.uf} Brasil`
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endereco)}&format=json&limit=1&countrycodes=br`,
      { headers: { 'User-Agent': 'FretesIALog/1.0' } }
    )
    const geoData = await geoRes.json()
    if (!geoData?.[0]) return null
    return [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)]
  } catch {
    return null
  }
}

async function geocodeEndereco(endereco: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endereco + ' Brasil')}&format=json&limit=1&countrycodes=br`,
      { headers: { 'User-Agent': 'FretesIALog/1.0' } }
    )
    const data = await res.json()
    if (!data?.[0]) return null
    return [parseFloat(data[0].lon), parseFloat(data[0].lat)]
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const { origem, destino, cep_origem, cep_destino } = await request.json()

  if (!origem && !cep_origem) {
    return NextResponse.json({ error: 'Origem obrigatória' }, { status: 400 })
  }

  // Tenta geocodificar — primeiro por CEP, depois pelo endereço
  const [coordOrigem, coordDestino] = await Promise.all([
    cep_origem ? geocodeCep(cep_origem) : geocodeEndereco(origem),
    cep_destino ? geocodeCep(cep_destino) : geocodeEndereco(destino),
  ])

  if (!coordOrigem || !coordDestino) {
    return NextResponse.json({ error: 'Não foi possível localizar os endereços' }, { status: 422 })
  }

  // OSRM — gratuito, sem chave, calcula pela estrada
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordOrigem[0]},${coordOrigem[1]};${coordDestino[0]},${coordDestino[1]}?overview=false`
  const osrmRes = await fetch(osrmUrl)
  const osrmData = await osrmRes.json()

  if (osrmData.code !== 'Ok' || !osrmData.routes?.[0]) {
    return NextResponse.json({ error: 'Rota não encontrada' }, { status: 422 })
  }

  const distanciaKm = Math.round(osrmData.routes[0].distance / 1000)
  const duracaoMin = Math.round(osrmData.routes[0].duration / 60)

  return NextResponse.json({ distanciaKm, duracaoMin })
}
