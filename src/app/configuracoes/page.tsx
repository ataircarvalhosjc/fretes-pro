'use client'

export const dynamic = 'force-dynamic'

import { Header } from '@/components/layout/Header'
import { Settings, Truck, MessageSquare, DollarSign, ExternalLink } from 'lucide-react'

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

        <ConfigSection title="Tipos de Veículo" icon={Truck}>
          <div className="space-y-2">
            {[
              { label: 'Moto', cap: 'até 30 kg', desc: 'Delivery urbano rápido' },
              { label: 'Utilitário/Furgão', cap: 'até 700 kg', desc: 'Entregas urbanas leves' },
              { label: 'Van / VUC (¾)', cap: 'até 1.500 kg', desc: 'Pequenos fretes e mudanças' },
              { label: 'VUC - Caminhão ¾', cap: 'até 3.000 kg', desc: 'Entregas urbanas médias' },
              { label: 'Toco - Semipesado', cap: 'até 6.000 kg', desc: 'Carga seca, mudanças, baú' },
              { label: 'Truck 6x2', cap: 'até 14.000 kg', desc: 'Longas distâncias, granel' },
              { label: 'Bitruck 4 eixos', cap: 'até 22.000 kg', desc: 'Granéis, tanque' },
              { label: 'Carreta Simples', cap: 'até 25.000 kg', desc: 'Longas distâncias' },
              { label: 'Bitrem 7 eixos', cap: 'até 57.000 kg', desc: 'Grandes cargas' },
            ].map((v) => (
              <div key={v.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-body font-semibold text-slate-700">{v.label}</p>
                  <p className="text-xs font-body text-slate-400">{v.desc}</p>
                </div>
                <span className="text-xs font-body font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg font-tabular">
                  {v.cap}
                </span>
              </div>
            ))}
          </div>
        </ConfigSection>
      </div>
    </div>
  )
}
