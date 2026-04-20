export type FaixaPreco = {
  label: string
  base: number        // valor mínimo (0-5 km)
  km_5_15: number     // R$/km de 5 a 15 km
  km_15_30: number    // R$/km de 15 a 30 km
  km_30plus: number   // R$/km acima de 30 km
}

export const TABELA_PRECOS: Record<string, FaixaPreco> = {
  moto:        { label: 'Moto',           base: 30,  km_5_15: 3.00, km_15_30: 2.00, km_30plus: 1.50 },
  utilitario:  { label: 'Van / Pick-up',  base: 60,  km_5_15: 5.00, km_15_30: 3.50, km_30plus: 2.50 },
  furgao:      { label: 'Furgão',         base: 80,  km_5_15: 6.00, km_15_30: 4.00, km_30plus: 3.00 },
  vuc:         { label: 'VUC / ¾',        base: 100, km_5_15: 7.00, km_15_30: 5.00, km_30plus: 3.50 },
  toco:        { label: 'Toco',           base: 150, km_5_15: 9.00, km_15_30: 7.00, km_30plus: 5.00 },
  truck:       { label: 'Truck 6x2',      base: 200, km_5_15: 12.00, km_15_30: 9.00, km_30plus: 7.00 },
  carreta:     { label: 'Carreta',        base: 350, km_5_15: 18.00, km_15_30: 14.00, km_30plus: 10.00 },
}

export const TABELA_PRECOS_PUBLICO: Record<string, FaixaPreco> = {
  moto:       TABELA_PRECOS.moto,
  utilitario: TABELA_PRECOS.utilitario,
  furgao:     TABELA_PRECOS.furgao,
}

export function calcularFrete(distanciaKm: number, tipoVeiculo: string): number | null {
  const tabela = TABELA_PRECOS[tipoVeiculo]
  if (!tabela) return null

  if (distanciaKm <= 5) return tabela.base

  let valor = tabela.base

  if (distanciaKm <= 15) {
    valor += (distanciaKm - 5) * tabela.km_5_15
  } else if (distanciaKm <= 30) {
    valor += 10 * tabela.km_5_15 + (distanciaKm - 15) * tabela.km_15_30
  } else {
    valor += 10 * tabela.km_5_15 + 15 * tabela.km_15_30 + (distanciaKm - 30) * tabela.km_30plus
  }

  return Math.round(valor)
}

export function formatarPreco(valor: number): string {
  return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}
