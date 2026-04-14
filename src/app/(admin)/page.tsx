'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Users, CheckCircle, Clock, ArrowRight, Plus, TrendingUp } from 'lucide-react'
import { useSupabase } from '@/lib/use-supabase'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Header } from '@/components/layout/Header'
import type { Orcamento, Motorista } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Stats {
  totalOrcamentos: number
  pendentes: number
  motoristasAtivos: number
  concluidos: number
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <TrendingUp className="w-4 h-4 text-slate-300" />
      </div>
      <p className="font-display font-bold text-3xl text-slate-900 tracking-wide">{value}</p>
      <p className="font-body text-sm text-slate-500 mt-1">{label}</p>
      {sub && <p className="font-body text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const supabase = useSupabase()
  const [stats, setStats] = useState<Stats>({
    totalOrcamentos: 0,
    pendentes: 0,
    motoristasAtivos: 0,
    concluidos: 0,
  })
  const [recentOrcamentos, setRecentOrcamentos] = useState<Orcamento[]>([])
  const [recentMotoristas, setRecentMotoristas] = useState<Motorista[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() { // eslint-disable-line
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [orcRes, pendRes, motRes, conclRes, recentOrcRes, recentMotRes] = await Promise.all([
        supabase.from('orcamentos').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
        supabase.from('orcamentos').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
        supabase.from('motoristas').select('id', { count: 'exact', head: true }).eq('ativo', true).eq('disponibilidade', 'ativo'),
        supabase.from('orcamentos').select('id', { count: 'exact', head: true }).eq('status', 'concluido'),
        supabase.from('orcamentos').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('motoristas').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        totalOrcamentos: orcRes.count ?? 0,
        pendentes: pendRes.count ?? 0,
        motoristasAtivos: motRes.count ?? 0,
        concluidos: conclRes.count ?? 0,
      })
      setRecentOrcamentos(recentOrcRes.data ?? [])
      setRecentMotoristas(recentMotRes.data ?? [])
      setLoading(false)
    }

    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-body">Carregando dados...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Header />

      <div className="p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Orçamentos este mês"
            value={stats.totalOrcamentos}
            icon={FileText}
            color="bg-orange-50 text-orange-500"
            sub="período atual"
          />
          <StatCard
            label="Aguardando aprovação"
            value={stats.pendentes}
            icon={Clock}
            color="bg-amber-50 text-amber-600"
            sub="orçamentos pendentes"
          />
          <StatCard
            label="Motoristas disponíveis"
            value={stats.motoristasAtivos}
            icon={Users}
            color="bg-blue-50 text-blue-500"
            sub="prontos para receber fretes"
          />
          <StatCard
            label="Fretes concluídos"
            value={stats.concluidos}
            icon={CheckCircle}
            color="bg-emerald-50 text-emerald-500"
            sub="total acumulado"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent orçamentos */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-slate-800 tracking-wide uppercase">
                Orçamentos Recentes
              </h2>
              <Link
                href="/orcamentos"
                className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-body font-semibold transition-colors"
              >
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentOrcamentos.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-body">Nenhum orçamento cadastrado ainda</p>
                <Link
                  href="/orcamentos/novo"
                  className="inline-flex items-center gap-2 mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Criar primeiro orçamento
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentOrcamentos.map((orc) => (
                  <Link
                    key={orc.id}
                    href={`/orcamentos/${orc.id}`}
                    className="flex items-center px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-sm text-slate-800 truncate">
                        {orc.cliente_nome}
                      </p>
                      <p className="text-xs text-slate-400 font-body truncate mt-0.5">
                        {orc.origem} → {orc.destino}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <StatusBadge status={orc.status} size="sm" />
                      <p className="text-xs text-slate-400 font-body font-tabular w-20 text-right">
                        {format(new Date(orc.created_at), 'dd MMM', { locale: ptBR })}
                      </p>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent motoristas */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-slate-800 tracking-wide uppercase">
                Motoristas
              </h2>
              <Link
                href="/motoristas"
                className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-body font-semibold transition-colors"
              >
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentMotoristas.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-body">Nenhum motorista cadastrado</p>
                <Link
                  href="/motoristas/novo"
                  className="inline-flex items-center gap-2 mt-4 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-slate-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Cadastrar motorista
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentMotoristas.map((mot) => (
                  <Link
                    key={mot.id}
                    href={`/motoristas/${mot.id}`}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-display font-bold text-slate-600">
                        {mot.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-sm text-slate-800 truncate">{mot.nome}</p>
                      <p className="text-xs text-slate-400 font-body truncate capitalize">{mot.tipo_veiculo}</p>
                    </div>
                    <StatusBadge status={mot.disponibilidade} size="sm" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
