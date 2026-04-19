'use client'

import { useState, useEffect } from 'react'
import { TIPOS_VEICULO, CATEGORIAS_CNH, TIPOS_CARROCERIA, ESTADOS_BR } from '@/types'
import { pedirPermissaoNotificacao } from '@/lib/firebase'

export default function CadastroMotoristaPage() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [motoristaId, setMotoristaId] = useState('')
  const [notifStatus, setNotifStatus] = useState<'idle' | 'pedindo' | 'ok' | 'negado'>('idle')
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function instalarApp() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallPrompt(null)
  }

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    whatsapp: '',
    email: '',
    cidade: '',
    estado: '',
    numero_cnh: '',
    categoria_cnh: '',
    validade_cnh: '',
    rntrc: '',
    tipo_veiculo: '',
    placa: '',
    ano_veiculo: '',
    tipo_carroceria: '',
    capacidade_kg: '',
    aceita_fracionado: false,
    aceita_refrigerado: false,
    disponibilidade: 'ativo',
  })

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
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
      setError('Preencha nome, WhatsApp e tipo de veículo.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/cadastro-motorista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          cpf: form.cpf || null,
          data_nascimento: form.data_nascimento
            ? form.data_nascimento.split('/').reverse().join('-')
            : null,
          whatsapp: form.whatsapp.replace(/\D/g, ''),
          email: form.email || null,
          cidade: form.cidade || null,
          estado: form.estado || null,
          numero_cnh: form.numero_cnh || null,
          categoria_cnh: form.categoria_cnh || null,
          validade_cnh: form.validade_cnh ? form.validade_cnh.split('/').reverse().join('-') : null,
          rntrc: form.rntrc || null,
          tipo_veiculo: form.tipo_veiculo,
          placa: form.placa ? form.placa.toUpperCase() : null,
          ano_veiculo: form.ano_veiculo ? parseInt(form.ano_veiculo) : null,
          tipo_carroceria: form.tipo_carroceria || null,
          capacidade_kg: form.capacidade_kg ? parseInt(form.capacidade_kg) : null,
          aceita_fracionado: form.aceita_fracionado,
          aceita_refrigerado: form.aceita_refrigerado,
          disponibilidade: form.disponibilidade,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar')
      setMotoristaId(data.id)
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar cadastro')
    } finally {
      setSaving(false)
    }
  }

  const input = 'w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition'
  const select = 'w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition appearance-none'

  async function ativarNotificacoes() {
    setNotifStatus('pedindo')
    const token = await pedirPermissaoNotificacao()
    if (token && motoristaId) {
      await fetch('/api/salvar-fcm-motorista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motoristaId, fcmToken: token }),
      })
      setNotifStatus('ok')
    } else {
      setNotifStatus('negado')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-20 h-20 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Cadastro realizado!</h2>
          <p className="text-orange-400 font-semibold text-lg mb-2">Fretes IA Log</p>
          <p className="text-gray-400 text-sm mb-8">
            Você será avisado pelo WhatsApp quando surgir um frete para o seu veículo.
          </p>

          {/* Opt-in push notification */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔔</span>
              <div>
                <p className="text-white font-bold text-sm">Ative as notificações!</p>
                <p className="text-gray-500 text-xs">Receba fretes em tempo real com 1 toque para aceitar ou recusar</p>
              </div>
            </div>

            {notifStatus === 'idle' && (
              <button
                onClick={ativarNotificacoes}
                className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl text-sm transition-all"
              >
                Ativar notificações de frete
              </button>
            )}

            {notifStatus === 'pedindo' && (
              <div className="flex items-center justify-center gap-2 py-3">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-400 text-sm">Aguardando permissão...</span>
              </div>
            )}

            {notifStatus === 'ok' && (
              <div className="flex items-center gap-2 text-emerald-400 py-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-bold text-sm">Notificações ativadas!</p>
                  <p className="text-emerald-600 text-xs">Você receberá alertas de novos fretes neste dispositivo</p>
                </div>
              </div>
            )}

            {notifStatus === 'negado' && (
              <p className="text-gray-600 text-xs text-center py-2">
                Permissão negada. Acompanhe os fretes pelo WhatsApp.
              </p>
            )}
          </div>

          {/* Banner instalar PWA */}
          {!installed && installPrompt && (
            <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5 text-left">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📲</span>
                <div>
                  <p className="text-white font-bold text-sm">Instale o app no celular!</p>
                  <p className="text-gray-500 text-xs">Receba notificações mesmo com o navegador fechado</p>
                </div>
              </div>
              <button
                onClick={instalarApp}
                className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl text-sm transition-all"
              >
                Adicionar à tela inicial
              </button>
            </div>
          )}

          {installed && (
            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-xl">✅</span>
              <p className="text-emerald-400 text-sm font-bold">App instalado com sucesso!</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center py-12 px-4">

      {/* Ícone + Título */}
      <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      </div>
      <h1 className="text-3xl font-extrabold text-orange-400 tracking-widest uppercase mb-1">Seja um Motorista</h1>
      <p className="text-gray-500 text-sm mb-10">Fretes IA Log — Receba fretes direto no seu WhatsApp</p>

      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">

        {/* DADOS PESSOAIS */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-orange-400 font-bold text-sm uppercase tracking-widest">Dados Pessoais</span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Nome completo <span className="text-orange-500">*</span></label>
              <input className={input} placeholder="Nome como no documento" value={form.nome} onChange={(e) => set('nome', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">CPF</label>
              <input className={input} placeholder="000.000.000-00" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Data de nascimento</label>
              <input
                type="text"
                className={input}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                inputMode="numeric"
                value={form.data_nascimento}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 8)
                  if (v.length >= 5) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4)
                  else if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2)
                  set('data_nascimento', v)
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">WhatsApp <span className="text-orange-500">*</span></label>
              <input className={input} placeholder="(11) 99999-9999" value={form.whatsapp} onChange={(e) => set('whatsapp', formatarWhatsApp(e.target.value))} inputMode="tel" required />
              <p className="text-xs text-gray-600 mt-1">Formato: (11) 99999-9999</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">E-mail</label>
              <input type="email" className={input} placeholder="email@exemplo.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Cidade</label>
              <input className={input} placeholder="Ex: São Paulo" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Estado</label>
              <select className={select} value={form.estado} onChange={(e) => set('estado', e.target.value)}>
                <option value="">Selecione...</option>
                {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* DOCUMENTAÇÃO */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-orange-400 font-bold text-sm uppercase tracking-widest">Documentação</span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Número da CNH</label>
              <input className={input} placeholder="Número da habilitação" value={form.numero_cnh} onChange={(e) => set('numero_cnh', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Categoria da CNH</label>
              <select className={select} value={form.categoria_cnh} onChange={(e) => set('categoria_cnh', e.target.value)}>
                <option value="">Selecione...</option>
                {CATEGORIAS_CNH.map((c) => <option key={c} value={c}>Categoria {c}</option>)}
              </select>
              <p className="text-xs text-gray-600 mt-1">B=utilitários / C,D,E=pesados</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Validade da CNH</label>
              <input
                type="text"
                className={input}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                inputMode="numeric"
                value={form.validade_cnh}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 8)
                  if (v.length >= 5) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4)
                  else if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2)
                  set('validade_cnh', v)
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">RNTRC / ANTT</label>
              <input className={input} placeholder="Número do RNTRC" value={form.rntrc} onChange={(e) => set('rntrc', e.target.value)} />
              <p className="text-xs text-gray-600 mt-1">Obrigatório por lei para frete remunerado</p>
            </div>
          </div>
        </div>

        {/* DADOS DO VEÍCULO */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 .001M13 16l2-5h4l2 5" />
              </svg>
            </div>
            <span className="text-orange-400 font-bold text-sm uppercase tracking-widest">Dados do Veículo</span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Tipo de veículo <span className="text-orange-500">*</span></label>
              <select className={select} value={form.tipo_veiculo} onChange={(e) => set('tipo_veiculo', e.target.value)} required>
                <option value="">Selecione...</option>
                {TIPOS_VEICULO.map((t) => <option key={t.value} value={t.value}>{t.label} — {t.capacidade}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Tipo de carroceria</label>
              <select className={select} value={form.tipo_carroceria} onChange={(e) => set('tipo_carroceria', e.target.value)}>
                <option value="">Selecione...</option>
                {TIPOS_CARROCERIA.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Placa</label>
              <input className={`${input} uppercase tracking-widest`} placeholder="ABC-1234" value={form.placa} onChange={(e) => set('placa', e.target.value.toUpperCase())} maxLength={8} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Ano do veículo</label>
              <input type="number" className={input} placeholder="Ex: 2020" value={form.ano_veiculo} onChange={(e) => set('ano_veiculo', e.target.value)} min={1980} max={new Date().getFullYear() + 1} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">Capacidade de carga (kg)</label>
              <input type="number" className={input} placeholder="Em kg" value={form.capacidade_kg} onChange={(e) => set('capacidade_kg', e.target.value)} min={0} />
            </div>
          </div>
        </div>

        {/* CONFIGURAÇÕES OPERACIONAIS */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-orange-400 font-bold text-sm uppercase tracking-widest">Configurações Operacionais</span>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Disponibilidade</label>
              <div className="flex gap-3">
                {(['ativo', 'inativo', 'ferias'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set('disponibilidade', d)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize border transition-all ${
                      form.disponibilidade === d
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-[#2a2a2a] text-gray-400 border-white/10 hover:border-orange-500/50'
                    }`}
                  >
                    {d === 'ferias' ? 'Férias' : d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-orange-500 bg-[#2a2a2a] focus:ring-orange-500 focus:ring-offset-0" checked={form.aceita_fracionado} onChange={(e) => set('aceita_fracionado', e.target.checked)} />
                <span className="text-sm text-gray-300">Aceita carga fracionada</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-orange-500 bg-[#2a2a2a] focus:ring-orange-500 focus:ring-offset-0" checked={form.aceita_refrigerado} onChange={(e) => set('aceita_refrigerado', e.target.checked)} />
                <span className="text-sm text-gray-300">Aceita carga refrigerada</span>
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-all"
        >
          {saving ? 'Enviando...' : 'Quero ser motorista'}
        </button>

        <p className="text-center text-xs text-gray-600 pb-8">
          Ao se cadastrar você concorda em receber notificações de frete via WhatsApp.
        </p>

      </form>
    </div>
  )
}
