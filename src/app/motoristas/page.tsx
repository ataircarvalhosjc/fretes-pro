'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/lib/use-supabase'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Header } from '@/components/layout/Header'
import type { Motorista } from '@/types'
import { TIPOS_VEICULO } from '@/types'
import { Search, ChevronRight, Users, Truck } from 'lucide-react'
import { clsx } from 'clsx'

const DISPONIBILIDADE_FILTERS = [
  { label: 'Todos', value: 'todos' },
  { label: 'Ativo', value: 'ativo' },
  { label: 'Inativo', value: 'inativo' },
  { label: 'Férias', value: 'ferias' },
]

export default function MotoristasPage() {
  const supabase = useSupabase()
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dispFilter, setDispFilter] = useState('todos')
  const [veiculoFilter, setVeiculoFilter] = useState('todos')

  useEffect(() => {
    fetchMotoristas()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  async function fetchMotoristas() {
    setLoading(true)
    const { data } = await supabase
      .from('motoristas')
      .select('*')
      .order('nome', { ascending: true })
    setMotoristas(data ?? [])
    setLoading(false)
  }

  const filtered = motoristas.filter((mot) => {
    const matchSearch =
      !search ||
      mot.nome.toLowerCase().includes(search.toLowerCase()) ||
      mot.whatsapp.includes(search) ||
      (mot.cidade ?? '').toLowerCase().includes(search.toLowerCase())
    const matchDisp = dispFilter === 'todos' || mot.disponibilidade === dispFilter
    const matchVeiculo = veiculoFilter === 'todos' || mot.tipo_veiculo === veiculoFilter
    return matchSearch && matchDisp && matchVeiculo
  })

  return (
    <div className="animate-fade-in">
      <Header />

      <div className="p-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, WhatsApp ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm font-body bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {DISPONIBILIDADE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setDispFilter(f.value)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all',
                  dispFilter === f.value
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            value={veiculoFilter}
            onChange={(e) => setVeiculoFilter(e.target.value)}
            className="px-3 py-2.5 text-sm font-body bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 transition-all"
          >
            <option value="todos">Todos os veículos</option>
            {TIPOS_VEICULO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48">
              <Users className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm text-slate-400 font-body">Nenhum motorista encontrado</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-6 py-3.5 text-xs font-body font-semibold text-slate-400 uppercase tracking-wide">
                    Motorista
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-body font-semibold text-slate-400 uppercase tracking-wide hidden sm:table-cell">
                    WhatsApp
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-body font-semibold text-slate-400 uppercase tracking-wide">
                    Veículo
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-body font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">
                    Localização
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-body font-semibold text-slate-400 uppercase tracking-wide hidden lg:table-cell">
                    CNH
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-body font-semibold text-slate-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((mot) => (
                  <tr
                    key={mot.id}
                    className="hover:bg-orange-50/40 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <Link href={`/motoristas/${mot.id}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 border border-slate-200">
                          <span className="text-sm font-display font-bold text-slate-600">
                            {mot.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-body font-semibold text-sm text-slate-800">{mot.nome}</p>
                          {mot.placa && (
                            <p className="text-xs text-slate-400 font-body font-tabular uppercase tracking-wide">
                              {mot.placa}
                            </p>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm font-body text-slate-600 font-tabular">
                        {mot.whatsapp}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-sm font-body text-slate-600 capitalize">
                          {mot.tipo_veiculo}
                        </span>
                      </div>
                      {mot.tipo_carroceria && (
                        <p className="text-xs text-slate-400 font-body mt-0.5">{mot.tipo_carroceria}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm font-body text-slate-600">
                        {mot.cidade && mot.estado ? `${mot.cidade}, ${mot.estado}` : mot.cidade || mot.estado || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm font-body text-slate-600">
                        {mot.categoria_cnh ? `Cat. ${mot.categoria_cnh}` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={mot.disponibilidade} size="sm" />
                    </td>
                    <td className="px-4 py-4">
                      <Link href={`/motoristas/${mot.id}`}>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 transition-colors" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-slate-400 font-body mt-3 text-right">
          {filtered.length} motorista{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
