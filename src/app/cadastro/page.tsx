'use client'

import { useState } from 'react'
import { TIPOS_VEICULO, ESTADOS_BR, CATEGORIAS_CNH } from '@/types'

type Step = 'form' | 'success'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition'

const selectClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition appearance-none'

export default function CadastroMotoristaPage() {
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    cpf: '',
    tipo_veiculo: '',
    placa: '',
    categoria_cnh: '',
    cidade: '',
    estado: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErro('')
  }

  function formatarWhatsApp(value: string) {
    const nums = value.replace(/\D/g, '').slice(0, 11)
    if (nums.length <= 2) return nums
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome || !form.whatsapp || !form.tipo_veiculo) {
      setErro('Preencha nome, WhatsApp e tipo de veículo.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/cadastro-motorista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar')
      setStep('success')
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar cadastro')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Cadastro realizado!</h2>
          <p className="text-gray-500 text-lg mb-2">
            Bem-vindo à <span className="text-orange-500 font-semibold">FretesPro</span>!
          </p>
          <p className="text-gray-400 text-sm">
            Você será notificado pelo WhatsApp assim que surgir um frete disponível para o seu veículo.
          </p>
          <div className="mt-8 bg-orange-50 rounded-2xl p-5 text-left">
            <p className="text-sm text-orange-700 font-medium mb-1">📲 Próximo passo</p>
            <p className="text-sm text-gray-600">
              Salve nosso número no seu WhatsApp para não perder nenhuma oportunidade de frete!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D1424] via-[#0D1424] to-[#1a2540]">
      {/* HERO */}
      <div className="px-4 pt-12 pb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-wide">FRETES<span className="text-orange-400">PRO</span></span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
          Receba fretes direto<br />
          <span className="text-orange-400">no seu WhatsApp</span>
        </h1>
        <p className="text-gray-400 text-base max-w-sm mx-auto">
          Cadastre-se gratuitamente e seja notificado assim que surgir um frete ideal para o seu veículo.
        </p>

        {/* BENEFÍCIOS */}
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mt-8">
          {[
            { icon: '💰', label: 'Sem taxa' },
            { icon: '📲', label: 'Via WhatsApp' },
            { icon: '🚛', label: 'Fretes diários' },
          ].map((b) => (
            <div key={b.label} className="bg-white/5 rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">{b.icon}</div>
              <p className="text-white text-xs font-medium">{b.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FORMULÁRIO */}
      <div className="bg-white rounded-t-3xl px-4 pt-8 pb-16 min-h-[60vh]">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Cadastre-se agora</h2>
        <p className="text-sm text-gray-400 mb-6">É rápido, gratuito e sem burocracia.</p>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">

          {/* Dados pessoais */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dados pessoais</label>
            <div className="space-y-3">
              <input
                className={inputClass}
                placeholder="Nome completo *"
                value={form.nome}
                onChange={(e) => set('nome', e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="WhatsApp * ex: (11) 99999-9999"
                value={form.whatsapp}
                onChange={(e) => set('whatsapp', formatarWhatsApp(e.target.value))}
                inputMode="tel"
              />
              <input
                className={inputClass}
                placeholder="E-mail (opcional)"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
              <input
                className={inputClass}
                placeholder="CPF (opcional)"
                value={form.cpf}
                onChange={(e) => set('cpf', e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Veículo */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Seu veículo</label>
            <div className="space-y-3">
              <div className="relative">
                <select
                  className={selectClass}
                  value={form.tipo_veiculo}
                  onChange={(e) => set('tipo_veiculo', e.target.value)}
                >
                  <option value="">Tipo de veículo *</option>
                  {TIPOS_VEICULO.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} — {t.capacidade}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
              </div>

              <input
                className={inputClass}
                placeholder="Placa do veículo (opcional)"
                value={form.placa}
                onChange={(e) => set('placa', e.target.value.toUpperCase())}
                maxLength={8}
              />

              <div className="relative">
                <select
                  className={selectClass}
                  value={form.categoria_cnh}
                  onChange={(e) => set('categoria_cnh', e.target.value)}
                >
                  <option value="">Categoria da CNH (opcional)</option>
                  {CATEGORIAS_CNH.map((c) => (
                    <option key={c} value={c}>CNH {c}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
              </div>
            </div>
          </div>

          {/* Localização */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Localização</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                className={inputClass}
                placeholder="Cidade"
                value={form.cidade}
                onChange={(e) => set('cidade', e.target.value)}
              />
              <div className="relative">
                <select
                  className={selectClass}
                  value={form.estado}
                  onChange={(e) => set('estado', e.target.value)}
                >
                  <option value="">Estado</option>
                  {ESTADOS_BR.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
              </div>
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-base transition-all shadow-lg shadow-orange-200 mt-2"
          >
            {loading ? 'Enviando...' : '🚛 Quero receber fretes!'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Ao se cadastrar você concorda em receber notificações de frete via WhatsApp.
          </p>
        </form>
      </div>
    </div>
  )
}
