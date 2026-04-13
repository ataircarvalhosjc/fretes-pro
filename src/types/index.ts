export type Disponibilidade = 'ativo' | 'inativo' | 'ferias'
export type CategoriaCNH = 'B' | 'C' | 'D' | 'E'
export type TipoCarroceria = 'Baú' | 'Sider' | 'Aberto' | 'Frigorífico' | 'Tanque' | 'Graneleiro'
export type StatusOrcamento = 'pendente' | 'enviado' | 'em_negociacao' | 'concluido' | 'cancelado'

export interface Motorista {
  id: string
  nome: string
  cpf?: string
  data_nascimento?: string
  whatsapp: string
  email?: string
  cidade?: string
  estado?: string
  foto_url?: string
  numero_cnh?: string
  categoria_cnh?: CategoriaCNH
  validade_cnh?: string
  rntrc?: string
  tipo_veiculo: string
  placa?: string
  ano_veiculo?: number
  tipo_carroceria?: TipoCarroceria
  capacidade_kg?: number
  regioes_atuacao?: string[]
  aceita_fracionado: boolean
  aceita_refrigerado: boolean
  disponibilidade: Disponibilidade
  ativo: boolean
  created_at: string
}

export interface Orcamento {
  id: string
  cliente_nome: string
  cliente_whatsapp: string
  origem: string
  destino: string
  descricao?: string
  tipo_veiculo_necessario?: string
  peso_kg?: number
  valor_estimado?: number
  status: StatusOrcamento
  motoristas_notificados: number
  observacoes?: string
  data_frete?: string
  created_at: string
  enviado_em?: string
}

export interface Notificacao {
  id: string
  orcamento_id: string
  motorista_id: string
  mensagem: string
  status: string
  created_at: string
  motoristas?: Motorista
}

export const TIPOS_VEICULO = [
  { label: 'Moto', value: 'moto', capacidade: 'até 30 kg' },
  { label: 'Utilitário/Furgão', value: 'utilitario', capacidade: 'até 700 kg' },
  { label: 'Van / VUC (¾)', value: 'van', capacidade: 'até 1.500 kg' },
  { label: 'VUC - Caminhão ¾', value: 'vuc', capacidade: 'até 3.000 kg' },
  { label: 'Toco - Semipesado', value: 'toco', capacidade: 'até 6.000 kg' },
  { label: 'Truck 6x2', value: 'truck', capacidade: 'até 14.000 kg' },
  { label: 'Bitruck 4 eixos', value: 'bitruck', capacidade: 'até 22.000 kg' },
  { label: 'Carreta Simples', value: 'carreta', capacidade: 'até 25.000 kg' },
  { label: 'Bitrem 7 eixos', value: 'bitrem', capacidade: 'até 57.000 kg' },
] as const

export const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

export const CATEGORIAS_CNH: CategoriaCNH[] = ['B', 'C', 'D', 'E']

export const TIPOS_CARROCERIA: TipoCarroceria[] = [
  'Baú', 'Sider', 'Aberto', 'Frigorífico', 'Tanque', 'Graneleiro',
]
