'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Orcamento } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const ETAPAS = [
  {
    status: 'pendente',
    icon: '📋',
    label: 'Pedido recebido',
    desc: 'Sua solicitação foi recebida e está sendo analisada.',
    cor: 'orange',
  },
  {
    status: 'enviado',
    icon: '✅',
    label: 'Aprovado',
    desc: 'Seu frete foi aprovado e motoristas foram notificados.',
    cor: 'blue',
  },
  {
    status: 'em_negociacao',
    icon: '🚛',
    label: 'Motorista a caminho',
    desc: 'Um motorista aceitou o frete e está em contato.',
    cor: 'purple',
  },
  {
    status: 'concluido',
    icon: '🏁',
    label: 'Entregue',
    desc: 'Frete concluído com sucesso!',
    cor: 'green',
  },
]

const STATUS_ORDER = ['pendente', 'enviado', 'em_negociacao', 'concluido']

function getEtapaIndex(status: string) {
  if (status === 'cancelado') return -1
  return STATUS_ORDER.indexOf(status)
}

export default function RastrearPage() {
  const { id } = useParams<{ id: string }>()
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function fetch() {
      const { data } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .single()

      if (!data) { setNotFound(true); setLoading(false); return }
      setOrcamento(data)
      setLoading(false)
    }

    fetch()

    // Atualização em tempo real
    const channel = supabase
      .channel(`orcamento-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orcamentos',
        filter: `id=eq.${id}`,
      }, (payload) => {
        setOrcamento(payload.new as Orcamento)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Buscando seu frete...</p>
        </div>
      </div>
    )
  }

  if (notFound || !orcamento) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-white font-bold text-xl mb-2">Frete não encontrado</h2>
          <p className="text-white/40 text-sm">Verifique o link e tente novamente.</p>
        </div>
      </div>
    )
  }

  const cancelado = orcamento.status === 'cancelado'
  const etapaAtual = getEtapaIndex(orcamento.status)

  return (
    <div className="min-h-screen bg-[#070b14] p-4 pb-12">
      {/* Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-orange-500/10 blur-[80px] pointer-events-none" />

      <div className="max-w-sm mx-auto relative">

        {/* Header */}
        <div className="flex items-center justify-center gap-3 pt-10 pb-8">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 3h15v13H1V3zm15 4h2.5l2.5 3v3h-5V7zM5.5 17a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm11 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-black text-base leading-none">FRETES IA</p>
            <p className="text-orange-400 text-[10px] font-bold tracking-widest">LOG</p>
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-5 mb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Rastreamento</p>
              <p className="text-white font-black text-lg leading-none">{orcamento.cliente_nome}</p>
            </div>
            {cancelado ? (
              <span className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-xl">Cancelado</span>
            ) : orcamento.status === 'concluido' ? (
              <span className="bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-bold px-3 py-1.5 rounded-xl">Concluído ✓</span>
            ) : (
              <span className="bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Em andamento
              </span>
            )}
          </div>

          {/* Rota */}
          <div className="flex items-center gap-3 bg-white/[0.04] rounded-2xl p-3">
            <div className="flex flex-col items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <div className="w-0.5 h-6 bg-white/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Origem</p>
                <p className="text-white text-sm font-semibold">{orcamento.origem}</p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Destino</p>
                <p className="text-white text-sm font-semibold">{orcamento.destino}</p>
              </div>
            </div>
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {orcamento.data_frete && (
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Data</p>
                <p className="text-white text-xs font-semibold">
                  {format(new Date(orcamento.data_frete + 'T12:00:00'), "dd 'de' MMM", { locale: ptBR })}
                </p>
              </div>
            )}
            {orcamento.descricao && (
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Carga</p>
                <p className="text-white text-xs font-semibold truncate">{orcamento.descricao}</p>
              </div>
            )}
            {orcamento.peso_kg && (
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Peso</p>
                <p className="text-white text-xs font-semibold">{orcamento.peso_kg} kg</p>
              </div>
            )}
            {orcamento.tipo_veiculo_necessario && (
              <div className="bg-white/[0.04] rounded-xl p-3">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Veículo</p>
                <p className="text-white text-xs font-semibold capitalize">{orcamento.tipo_veiculo_necessario}</p>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-5">
          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-5">Status do frete</p>

          {cancelado ? (
            <div className="flex items-center gap-4 py-2">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-lg shrink-0">❌</div>
              <div>
                <p className="text-red-400 font-bold text-sm">Frete cancelado</p>
                <p className="text-white/30 text-xs mt-0.5">Entre em contato para mais informações.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {ETAPAS.map((etapa, i) => {
                const concluida = etapaAtual >= i
                const atual = etapaAtual === i
                const isLast = i === ETAPAS.length - 1

                return (
                  <div key={etapa.status} className="flex gap-4">
                    {/* Linha vertical + ícone */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 transition-all duration-500 ${
                        concluida
                          ? 'bg-orange-500/20 border border-orange-500/50'
                          : 'bg-white/[0.04] border border-white/10'
                      } ${atual ? 'ring-2 ring-orange-500/30' : ''}`}>
                        <span className={concluida ? '' : 'grayscale opacity-30'}>{etapa.icon}</span>
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-8 my-1 transition-all duration-500 ${concluida && etapaAtual > i ? 'bg-orange-500/50' : 'bg-white/[0.06]'}`} />
                      )}
                    </div>

                    {/* Texto */}
                    <div className="pb-6 pt-2 flex-1">
                      <p className={`text-sm font-bold transition-all duration-300 ${concluida ? 'text-white' : 'text-white/20'}`}>
                        {etapa.label}
                        {atual && <span className="ml-2 text-orange-400 text-[10px] font-black uppercase tracking-wider">← agora</span>}
                      </p>
                      {concluida && (
                        <p className="text-white/30 text-xs mt-0.5">{etapa.desc}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <p className="text-center text-white/15 text-xs mt-6">
          Atualizado em tempo real • Fretes IA Log
        </p>
      </div>
    </div>
  )
}
