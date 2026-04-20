'use client'

export const dynamic = 'force-dynamic'

import { Header } from '@/components/layout/Header'
import { Settings, Truck, MessageSquare, DollarSign, ExternalLink } from 'lucide-react'
import { TABELA_PRECOS, calcularFrete, formatarPreco } from '@/lib/tabela-precos'

function ConfigSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-orange-500" />
        </div>
        <h2 className="font-display font-bold text-base text-slate-700 tracking-wide uppercase">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export default function ConfiguracoesPage() {
  return (
    <div className="animate-fade-in">
      <Header />
      <div className="p-8 max-w-2xl mx-auto space-y-5">

        <ConfigSection title="Plataforma WhatsApp" icon={MessageSquare}>
          <div className="space-y-4">
            <p className="text-sm font-body text-slate-600">
              O envio de mensagens para motoristas é feito via <strong>uazap API</strong>. Configure seu token no arquivo <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">.env.local</code>.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-body font-semibold text-slate-500 uppercase tracking-wide">Variáveis de ambiente</p>
              <code className="block text-xs font-mono text-slate-700">UAZAP_TOKEN=seu-token-aqui</code>
              <code className="block text-xs font-mono text-slate-700">NEXT_PUBLIC_SUPABASE_URL=...</code>
              <code className="block text-xs font-mono text-slate-700">NEXT_PUBLIC_SUPABASE_ANON_KEY=...</code>
              <code className="block text-xs font-mono text-slate-700">SUPABASE_SERVICE_ROLE_KEY=...</code>
            </div>
            <a
              href="https://uazap.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-body font-semibold transition-colors"
            >
              Acessar painel uazap <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </ConfigSection>

        <ConfigSection title="Banco de Dados" icon={Settings}>
          <div className="space-y-4">
            <p className="text-sm font-body text-slate-600">
              O banco de dados usa <strong>Supabase</strong> (PostgreSQL). Execute as migrations abaixo para criar as tabelas necessárias.
            </p>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-body font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Migration SQL
              </p>
              <code className="block text-xs font-mono text-slate-600">
                supabase/migrations/001_initial.sql
              </code>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-body font-semibold transition-colors"
            >
              Acessar Supabase Dashboard <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </ConfigSection>

        <ConfigSection title="Modelos de Cobrança" icon={DollarSign}>
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-xs font-body font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                Fase Atual — Fase 1: Tração
              </p>
              <p className="text-sm font-body text-emerald-800">
                Motoristas cadastram <strong>gratuitamente</strong>. Receita via taxa de conveniência do cliente.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-xl border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">2</div>
                <div>
                  <p className="text-sm font-body font-semibold text-slate-700">Freemium</p>
                  <p className="text-xs font-body text-slate-400">Gratuito até 5 notificações/mês → R$ 29/mês ilimitado</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-xl border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">3</div>
                <div>
                  <p className="text-sm font-body font-semibold text-slate-700">Mensalidade consolidada</p>
                  <p className="text-xs font-body text-slate-400">Planos por região e volume de fretes</p>
                </div>
              </div>
            </div>
          </div>
        </ConfigSection>

        <ConfigSection title="Tabela de Preços Aproximados" icon={DollarSign}>
          <div className="space-y-3">
            <p className="text-xs text-slate-400 font-body">Valores calculados automaticamente por distância. O valor final é confirmado pelo administrador antes do envio.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-body">
                <thead>
                  <tr className="text-slate-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left py-2 pr-3">Veículo</th>
                    <th className="text-right py-2 px-2">Mínimo</th>
                    <th className="text-right py-2 px-2">10 km</th>
                    <th className="text-right py-2 px-2">20 km</th>
                    <th className="text-right py-2 px-2">40 km</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(TABELA_PRECOS).map(([key, v]) => (
                    <tr key={key} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 pr-3 font-semibold text-slate-700">{v.label}</td>
                      <td className="py-2.5 px-2 text-right text-slate-600">{formatarPreco(v.base)}</td>
                      <td className="py-2.5 px-2 text-right text-slate-600">{formatarPreco(calcularFrete(10, key)!)}</td>
                      <td className="py-2.5 px-2 text-right text-slate-600">{formatarPreco(calcularFrete(20, key)!)}</td>
                      <td className="py-2.5 px-2 text-right text-slate-600">{formatarPreco(calcularFrete(40, key)!)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-700 font-body">⚠️ Valores aproximados — o preço exato é definido pelo administrador em cada orçamento antes do envio ao cliente.</p>
            </div>
          </div>
        </ConfigSection>
      </div>
    </div>
  )
}
