'use client'

import { useState } from 'react'
import { TIPOS_VEICULO } from '@/types'

type Step = 'form' | 'success'

export default function CadastroMotoristaPage() {
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    nome: '',
    whatsapp: '',
    tipo_veiculo: 'moto',
    placa: '',
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
    if (!form.nome || !form.whatsapp) {
      setErro('Preencha nome e WhatsApp.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/cadastro-motorista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          whatsapp: form.whatsapp.replace(/\D/g, ''),
          tipo_veiculo: form.tipo_veiculo,
          placa: form.placa || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar')
      setStep('success')
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Cadastro realizado!</h2>
          <p className="text-orange-400 font-semibold text-lg mb-2">FretesPro</p>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Você será notificado pelo WhatsApp assim que surgir um frete disponível para o seu veículo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">

      {/* Ícone */}
      <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      </div>

      {/* Título */}
      <h1 className="text-3xl font-extrabold text-orange-400 tracking-widest uppercase mb-1">
        Seja um Motorista
      </h1>
      <p className="text-gray-400 text-sm mb-8">FretesPro — Receba fretes no WhatsApp</p>

      {/* Card formulário */}
      <div className="w-full max-w-sm bg-[#1a1a1a] rounded-2xl p-6 space-y-4 shadow-2xl border border-white/5">

        {/* Nome */}
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
            Nome completo <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Seu nome"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
            WhatsApp <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="(12) 99999-9999"
              value={form.whatsapp}
              onChange={(e) => set('whatsapp', formatarWhatsApp(e.target.value))}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
        </div>

        {/* Tipo de veículo */}
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
            Tipo de veículo <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 .001M13 16l2-5h4l2 5" />
              </svg>
            </span>
            <select
              value={form.tipo_veiculo}
              onChange={(e) => set('tipo_veiculo', e.target.value)}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition appearance-none"
            >
              {TIPOS_VEICULO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Placa */}
        <div>
          <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5">
            Placa do veículo <span className="text-orange-500">*</span>
          </label>
          <input
            type="text"
            placeholder="ABC-1234"
            value={form.placa}
            onChange={(e) => set('placa', e.target.value.toUpperCase())}
            maxLength={8}
            className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition uppercase tracking-widest"
          />
        </div>

        {erro && (
          <p className="text-red-400 text-xs text-center">{erro}</p>
        )}

        {/* Botão */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm tracking-wide transition-all mt-2"
        >
          {loading ? 'Enviando...' : 'Quero ser motorista'}
        </button>

        <p className="text-center text-xs text-gray-600 pt-1">
          Ao se cadastrar você concorda em receber notificações de frete via WhatsApp.
        </p>
      </div>
    </div>
  )
}
