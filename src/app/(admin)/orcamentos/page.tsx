'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/lib/use-supabase'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Header } from '@/components/layout/Header'
import type { Orcamento, StatusOrcamento } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search, SlidersHorizontal, ChevronRight, Send, Trash2, AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'

const STATUS_FILTERS: { label: string; value: StatusOrcamento | 'todos' }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendente', value: 'pendente' },
  { label: 'Enviado', value: 'enviado' },
  { label: 'Em Negociação', value: 'em_negociacao' },
  { label: 'Concluído', value: 'concluido' },
  { label: 'Cancelado', value: 'cancelado' },
]

export default function OrcamentosPage() {
  const supabase = useSupabase()
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusOrcamento | 'todos'>('todos')
  const [deleteTarget, setDeleteTarget] = useState<Orcamento | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchOrcamentos()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  async function fetchOrcamentos() {
    setLoading(true)
    const { data } = await supabase
      .from('orcamentos')
      .select('*')
      .order('created_at', { ascending: false })
    setOrcamentos(data ?? [])
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    // Remove notificações vinculadas primeiro (evita erro de foreign key)
    await supabase.from('notificacoes').delete().eq('orcamento_id', deleteTarget.id)
    await supabase.from('orcamentos').delete().eq('id', deleteTarget.id)
    setOrcamentos((prev) => prev.filter((o) => o.id !== deleteTarget.id))
    setDeleteTarget(null)
    setDeleting(false)
  }

  const filtered = orcamentos.filter((orc) => {
    const matchSearch =
      !search ||
      orc.cliente_nome.toLowerCase().includes(search.toLowerCase()) ||
      orc.origem.toLowerCase().includes(search.toLowerCase()) ||
      orc.destino.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'todos' || orc.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="animate-fade-in">
      <Header />

      {/* Modal de confirmação de exclusão */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-base">Excluir orçamento?</h3>
                <p className="text-xs text-slate-400 font-body">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm font-body font-semibold text-slate-700">{deleteTarget.cliente_nome}</p>
              <p className="text-xs text-slate-400 font-body mt-0.5 truncate">{deleteTarget.origem} → {deleteTarget.destino}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-sm font-body font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-body font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, origem ou destino..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm font-body bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 ml-2" />
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all',
                  statusFilter === f.value
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48">
              <Send className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm text-slate-400 font-body">Nenhum orçamento encontrado</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-6 py-3.5 text-xs font-body font-semibold text-slate-400 uppercase tracking-wide">
                    Cliente
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-body font-semibold text-slate-400 uppercase tracking-wide">
                    Rota
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-body font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">
                    Veículo
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-body font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">
                    Valor
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-body font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">
                    Motoristas
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-body font-semibold text-slate-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-body font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">
                    Data
                  </th>
                  <th className="w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((orc) => (
                  <tr
                    key={orc.id}
                    className="hover:bg-orange-50/40 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <Link href={`/orcamentos/${orc.id}`} className="block">
                        <p className="font-body font-semibold text-sm text-slate-800">{orc.cliente_nome}</p>
                        <p className="text-xs text-slate-400 font-tabular">{orc.cliente_whatsapp}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/orcamentos/${orc.id}`} className="block">
                        <p className="text-sm font-body text-slate-700 max-w-[180px] truncate">{orc.origem}</p>
                        <p className="text-xs text-slate-400 max-w-[180px] truncate">→ {orc.destino}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs font-body text-slate-500 capitalize">
                        {orc.tipo_veiculo_necessario || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm font-body font-semibold text-slate-700 font-tabular">
                        {orc.valor_estimado
                          ? `R$ ${orc.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm font-body text-slate-500 font-tabular">
                        {orc.motoristas_notificados > 0 ? `${orc.motoristas_notificados} notif.` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={orc.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-xs text-slate-400 font-body font-tabular">
                        {format(new Date(orc.created_at), 'dd/MM/yy', { locale: ptBR })}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(orc) }}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <Link href={`/orcamentos/${orc.id}`}>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 transition-colors" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-slate-400 font-body mt-3 text-right">
          {filtered.length} orçamento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
