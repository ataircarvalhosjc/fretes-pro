import { NextRequest, NextResponse } from 'next/server'

async function geocodeTexto(query: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`,
      { headers: { 'User-Agent': 'FretesIALog/1.0' } }
    )
    const data = await res.json()
    // Filtra apenas resultados do Brasil
    const br = data?.features?.find(
      (f: { properties: { country?: string }; geometry: { coordinates: [number, number] } }) =>
        f.properties?.country === 'Brazil' || f.properties?.country === 'Brasil'
    ) ?? data?.features?.[0]
    if (!br) return null
    const [lon, lat] = br.geometry.coordinates
    return [lon, lat]
  } catch {
    return null
  }
}

async function geocodeCep(cep: string): Promise<[number, number] | null> {
  try {
    const digits = cep.replace(/\D/g, '')
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    const data = await res.json()
    if (data.erro) return null

    // Tenta primeiro com logradouro+bairro, depois só cidade+UF como fallback
    const queryCompleta = [data.logradouro, data.bairro, data.localidade, data.uf, 'Brasil']
      .filter(Boolean).join(' ')
    const queryCidade = `${data.localidade} ${data.uf} Brasil`

    const coord = await geocodeTexto(queryCompleta)
    if (coord) return coord
    return geocodeTexto(queryCidade)
  } catch {
    return null
  }
}

async function geocodeEndereco(endereco: string): Promise<[number, number] | null> {
  return geocodeTexto(endereco + ' Brasil')
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
