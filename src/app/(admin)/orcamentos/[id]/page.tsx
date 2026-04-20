'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/lib/use-supabase'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Header } from '@/components/layout/Header'
import type { Orcamento, Motorista, Notificacao } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft,
  Send,
  Users,
  CheckCircle,
  AlertCircle,
  Truck,
  MapPin,
  Package,
  DollarSign,
  Calendar,
  Phone,
  User,
  MessageSquare,
  Loader2,
  Trash2,
} from 'lucide-react'
import { calcularFrete, formatarPreco, TABELA_PRECOS } from '@/lib/tabela-precos'

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value?: string | number | null
}) {
  if (!value) return null
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-body font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-sm font-body text-slate-800 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function OrcamentoDetailPage() {
  const supabase = useSupabase()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [motoristasCount, setMotoristasCount] = useState(0)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ success: boolean; enviados: number; total: number } | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editandoValor, setEditandoValor] = useState(false)
  const [novoValor, setNovoValor] = useState('')
  const [salvandoValor, setSalvandoValor] = useState(false)
  const [distancia, setDistancia] = useState<{ distanciaKm: number; duracaoMin: number } | null>(null)
  const [calculando, setCalculando] = useState(false)
  const [erroDistancia, setErroDistancia] = useState('')

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, supabase])

  async function fetchData() {
    setLoading(true)

    const [orcRes, notifRes] = await Promise.all([
      supabase.from('orcamentos').select('*').eq('id', id).single(),
      supabase
        .from('notificacoes')
        .select('*, motoristas(nome, tipo_veiculo)')
        .eq('orcamento_id', id)
        .order('created_at', { ascending: false }),
    ])

    setOrcamento(orcRes.data)
    setNotificacoes(notifRes.data ?? [])

    if (orcRes.data) {
      let query = supabase
        .from('motoristas')
        .select('id', { count: 'exact', head: true })
        .eq('ativo', true)
        .eq('disponibilidade', 'ativo')

      if (orcRes.data.tipo_veiculo_necessario) {
        query = query.eq('tipo_veiculo', orcRes.data.tipo_veiculo_necessario)
      }

      const { count } = await query
      setMotoristasCount(count ?? 0)
    }

    setLoading(false)
  }

  async function handleEnviar() {
    setSending(true)
    setConfirmOpen(false)

    try {
      const res = await fetch('/api/notificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orcamentoId: id }),
      })

      const json = await res.json()

      if (res.ok) {
        setSendResult(json)
        fetchData()
      } else {
        setSendResult({ success: false, enviados: 0, total: 0 })
      }
    } catch {
      setSendResult({ success: false, enviados: 0, total: 0 })
    } finally {
      setSending(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    // Remove notificações vinculadas primeiro (evita erro de foreign key)
    await supabase.from('notificacoes').delete().eq('orcamento_id', id)
    await supabase.from('orcamentos').delete().eq('id', id)
    router.push('/orcamentos')
  }

  async function calcularDistancia() {
    if (!orcamento) return
    setCalculando(true)
    setErroDistancia('')
    try {
      const res = await fetch('/api/calcular-distancia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origem: orcamento.origem, destino: orcamento.destino }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDistancia(data)

      // Auto-calcula o valor se não tiver valor definido e tiver tipo de veículo
      if (!orcamento.valor_estimado && orcamento.tipo_veiculo_necessario) {
        const sugestao = calcularFrete(data.distanciaKm, orcamento.tipo_veiculo_necessario)
        if (sugestao) {
          setNovoValor(String(sugestao))
          setEditandoValor(true)
        }
      }
    } catch (e: unknown) {
      setErroDistancia(e instanceof Error ? e.message : 'Erro ao calcular')
    } finally {
      setCalculando(false)
    }
  }

  async function salvarValor() {
    setSalvandoValor(true)
    const valor = parseFloat(novoValor.replace(',', '.'))
    await supabase.from('orcamentos').update({ valor_estimado: isNaN(valor) ? null : valor }).eq('id', id)
    setOrcamento((prev) => prev ? { ...prev, valor_estimado: isNaN(valor) ? undefined : valor } : prev)
    setEditandoValor(false)
    setSalvandoValor(false)
  }

  async function updateStatus(newStatus: string) {
    setStatusUpdating(true)

    // Se concluído ou cancelado, notifica motoristas via WhatsApp
    if (newStatus === 'concluido' || newStatus === 'cancelado') {
      await fetch('/api/notificar-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orcamentoId: id, status: newStatus }),
      })
    } else {
      await supabase.from('orcamentos').update({ status: newStatus }).eq('id', id)
    }

    setOrcamento((prev) => prev ? { ...prev, status: newStatus as any } : prev)
    setStatusUpdating(false)
  }

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (!orcamento) {
    return (
      <div>
        <Header />
        <div className="p-8 text-center">
          <p className="text-slate-500 font-body">Orçamento não encontrado.</p>
          <Link href="/orcamentos" className="text-orange-500 text-sm font-body mt-2 inline-block">
            ← Voltar
          </Link>
        </div>
      </div>
    )
  }

  const canSend = orcamento.status === 'pendente' || orcamento.status === 'enviado'

  return (
    <div className="animate-fade-in">
      <Header />

      {/* Modal de confirmação de exclusão */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-base">Excluir orçamento?</h3>
                <p className="text-xs text-slate-400 font-body">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm font-body font-semibold text-slate-700">{orcamento.cliente_nome}</p>
              <p className="text-xs text-slate-400 font-body mt-0.5 truncate">{orcamento.origem} → {orcamento.destino}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="flex-1 py-2.5 text-sm font-body font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-body font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/orcamentos"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-body transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <div className="flex items-center gap-3">
            <StatusBadge status={orcamento.status} />
            {statusUpdating && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
            <button
              onClick={() => setDeleteOpen(true)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Excluir orçamento"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Client + Route */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-display font-bold text-lg text-slate-800 tracking-wide uppercase mb-5">
                Informações do Frete
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InfoItem icon={User} label="Cliente" value={orcamento.cliente_nome} />
                <InfoItem icon={Phone} label="WhatsApp" value={orcamento.cliente_whatsapp} />
                <InfoItem icon={MapPin} label="Origem" value={orcamento.origem} />
                <InfoItem icon={MapPin} label="Destino" value={orcamento.destino} />
                <div className="sm:col-span-2">
                  {distancia ? (
                    <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="flex gap-6">
                        <div>
                          <p className="text-xs text-blue-400 font-body font-semibold uppercase tracking-wide">Distância</p>
                          <p className="text-sm font-body font-bold text-blue-700">{distancia.distanciaKm} km</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-400 font-body font-semibold uppercase tracking-wide">Tempo estimado</p>
                          <p className="text-sm font-body font-bold text-blue-700">
                            {distancia.duracaoMin >= 60
                              ? `${Math.floor(distancia.duracaoMin / 60)}h ${distancia.duracaoMin % 60}min`
                              : `${distancia.duracaoMin} min`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={calcularDistancia}
                        disabled={calculando}
                        className="flex items-center gap-2 text-xs font-body font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-4 py-2 rounded-xl transition-all disabled:opacity-60"
                      >
                        {calculando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                        {calculando ? 'Calculando...' : 'Calcular distância'}
                      </button>
                      {erroDistancia && <p className="text-xs text-red-500 font-body">{erroDistancia}</p>}
                    </div>
                  )}
                </div>
                <InfoItem
                  icon={Package}
                  label="Carga"
                  value={orcamento.descricao}
                />
                <InfoItem
                  icon={Truck}
                  label="Tipo de veículo"
                  value={orcamento.tipo_veiculo_necessario}
                />
                <InfoItem
                  icon={Package}
                  label="Peso estimado"
                  value={orcamento.peso_kg ? `${orcamento.peso_kg.toLocaleString('pt-BR')} kg` : null}
                />
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 font-body font-semibold uppercase tracking-wide">Valor do frete</p>
                    {editandoValor ? (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-500 font-body">R$</span>
                        <input
                          type="text"
                          autoFocus
                          className="w-32 px-2 py-1 text-sm font-body border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500"
                          placeholder="0,00"
                          value={novoValor}
                          onChange={(e) => setNovoValor(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') salvarValor(); if (e.key === 'Escape') setEditandoValor(false) }}
                        />
                        <button onClick={salvarValor} disabled={salvandoValor} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-lg transition-colors">
                          {salvandoValor ? '...' : 'Salvar'}
                        </button>
                        <button onClick={() => setEditandoValor(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancelar</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setNovoValor(orcamento.valor_estimado ? String(orcamento.valor_estimado) : ''); setEditandoValor(true) }}
                        className="text-sm font-body font-medium text-slate-800 mt-0.5 hover:text-orange-500 transition-colors group flex items-center gap-1"
                      >
                        {orcamento.valor_estimado
                          ? `R$ ${orcamento.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : <span className="text-slate-300 italic">Clique para definir o valor</span>
                        }
                        <span className="text-[10px] text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
                      </button>
                    )}
                  </div>
                </div>
                <InfoItem
                  icon={Calendar}
                  label="Data do frete"
                  value={
                    orcamento.data_frete
                      ? format(new Date(orcamento.data_frete + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : null
                  }
                />
                <InfoItem
                  icon={Calendar}
                  label="Cadastrado em"
                  value={format(new Date(orcamento.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                />
                {orcamento.observacoes && (
                  <div className="sm:col-span-2">
                    <InfoItem icon={MessageSquare} label="Observações" value={orcamento.observacoes} />
                  </div>
                )}
              </div>
            </div>

            {/* Notification log */}
            {notificacoes.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-lg text-slate-800 tracking-wide uppercase mb-4">
                  Motoristas Notificados ({notificacoes.length})
                </h2>
                <div className="space-y-2">
                  {notificacoes.map((notif) => {
                    const resposta = (notif as any).resposta as string | null
                    return (
                      <div
                        key={notif.id}
                        className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          resposta === 'aceitar' ? 'bg-emerald-50' :
                          resposta === 'recusar' ? 'bg-red-50' : 'bg-slate-50'
                        }`}>
                          {resposta === 'aceitar' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : resposta === 'recusar' ? (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body font-medium text-slate-700">
                            {(notif as any).motoristas?.nome ?? 'Motorista'}
                          </p>
                          <p className="text-xs font-body capitalize">
                            {resposta === 'aceitar' ? (
                              <span className="text-emerald-600 font-semibold">✅ Aceitou o frete</span>
                            ) : resposta === 'recusar' ? (
                              <span className="text-red-400 font-semibold">❌ Recusou o frete</span>
                            ) : (
                              <span className="text-slate-400">Aguardando resposta...</span>
                            )}
                          </p>
                        </div>
                        <p className="text-xs text-slate-400 font-body font-tabular shrink-0">
                          {format(new Date(notif.created_at), 'dd/MM HH:mm')}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions sidebar */}
          <div className="space-y-4">
            {/* Send action */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-body font-semibold text-slate-700">
                  {motoristasCount} motorista{motoristasCount !== 1 ? 's' : ''} disponíve{motoristasCount !== 1 ? 'is' : 'l'}
                </p>
              </div>
              <p className="text-xs text-slate-400 font-body mb-5">
                {orcamento.tipo_veiculo_necessario
                  ? `Filtrado por: ${orcamento.tipo_veiculo_necessario}`
                  : 'Todos os tipos de veículo'}
              </p>

              {sendResult ? (
                <div
                  className={`rounded-xl p-4 mb-4 ${
                    sendResult.success
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {sendResult.success ? (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-body font-semibold text-emerald-700">
                          Enviado com sucesso!
                        </p>
                        <p className="text-xs text-emerald-600 font-body mt-0.5">
                          {sendResult.enviados} de {sendResult.total} mensagens enviadas
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-body font-semibold text-red-700">Erro ao enviar</p>
                        <p className="text-xs text-red-600 font-body mt-0.5">Verifique o token do uazap</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {canSend && !confirmOpen && (
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={sending || motoristasCount === 0}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-body font-semibold transition-colors shadow-sm shadow-orange-500/20"
                >
                  <Send className="w-4 h-4" />
                  Aprovar e Enviar para Motoristas
                </button>
              )}

              {confirmOpen && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm font-body font-semibold text-amber-800 mb-1">Confirmar envio?</p>
                  <p className="text-xs text-amber-700 font-body mb-4">
                    Será enviada uma mensagem para {motoristasCount} motorista{motoristasCount !== 1 ? 's' : ''} via WhatsApp.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmOpen(false)}
                      className="flex-1 py-2 text-xs font-body font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleEnviar}
                      disabled={sending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-body font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                    >
                      {sending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      {sending ? 'Enviando...' : 'Confirmar'}
                    </button>
                  </div>
                </div>
              )}

              {motoristasCount === 0 && (
                <p className="text-xs text-amber-600 font-body mt-3 text-center">
                  Nenhum motorista disponível para este veículo.{' '}
                  <Link href="/motoristas/novo" className="underline">Cadastre um motorista</Link>
                </p>
              )}
            </div>

            {/* Status update */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Atualizar Status
              </p>
              <div className="space-y-2">
                {(['pendente', 'em_negociacao', 'concluido', 'cancelado'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={orcamento.status === s || statusUpdating}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-body font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-600 flex items-center justify-between"
                  >
                    <StatusBadge status={s} size="sm" />
                    {orcamento.status === s && (
                      <CheckCircle className="w-3.5 h-3.5 text-orange-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            {orcamento.enviado_em && (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Envio
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500 font-body">Enviado em</span>
                    <span className="text-xs font-body font-semibold text-slate-700 font-tabular">
                      {format(new Date(orcamento.enviado_em), 'dd/MM/yy HH:mm')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500 font-body">Notificados</span>
                    <span className="text-xs font-body font-semibold text-slate-700">
                      {orcamento.motoristas_notificados} motoristas
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
