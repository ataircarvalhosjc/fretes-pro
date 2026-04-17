'use client'

import { useState, useEffect, useRef } from 'react'
import { TIPOS_VEICULO } from '@/types'

type Step = 1 | 2 | 'success'

function InstallBanner() {
  const [prompt, setPrompt] = useState<Event | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (installed || !prompt) return null

  async function install() {
    const p = prompt as any
    p.prompt()
    const { outcome } = await p.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-[#1a2235] border border-orange-500/30 rounded-2xl p-4 shadow-2xl shadow-orange-500/10 flex items-center gap-3 animate-slide-up">
      <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1 3h15v13H1V3zm15 4h2.5l2.5 3v3h-5V7zM5.5 17a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm11 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold">Instalar Fretes IA Log</p>
        <p className="text-white/40 text-xs">Adicione à tela inicial do seu celular</p>
      </div>
      <button onClick={install} className="bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shrink-0">
        Instalar
      </button>
    </div>
  )
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-orange-500 focus:bg-white/8 transition-all duration-200'

const selectClass =
  'w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-all duration-200 appearance-none'

function AnimatedRoute() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      let p = 0
      const interval = setInterval(() => {
        p += 2
        setProgress(p)
        if (p >= 100) clearInterval(interval)
      }, 30)
    }, 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative flex items-center gap-3 my-8">
      {/* Origem */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Origem</span>
      </div>

      {/* Linha animada */}
      <div className="flex-1 relative h-1 bg-white/5 rounded-full overflow-hidden mx-2">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        {/* Caminhão animado */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-100"
          style={{ left: `calc(${progress}% - 12px)` }}
        >
          <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/50 -translate-y-1/2">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 3h15v13H1V3zm15 4h2.5l2.5 3v3h-5V7zM5.5 17a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm11 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Destino */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${progress === 100 ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-white/10'}`}>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${progress === 100 ? 'text-emerald-400' : 'text-white/30'}`}>Destino</span>
      </div>
    </div>
  )
}

function StepIndicator({ step }: { step: Step }) {
  const current = step === 'success' ? 3 : step
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            current > s ? 'bg-orange-500 text-white' :
            current === s ? 'bg-orange-500 text-white ring-4 ring-orange-500/20' :
            'bg-white/10 text-white/40'
          }`}>
            {current > s ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : s}
          </div>
          {s < 2 && <div className={`w-12 h-0.5 transition-all duration-300 ${current > s ? 'bg-orange-500' : 'bg-white/10'}`} />}
        </div>
      ))}
      <div className="ml-2 text-xs text-white/40">
        {step === 1 && 'Seus dados'}
        {step === 2 && 'Detalhes do frete'}
      </div>
    </div>
  )
}

export default function SolicitarFretePage() {
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [freteId, setFreteId] = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    cliente_nome: '',
    cliente_whatsapp: '',
    origem: '',
    destino: '',
    descricao: '',
    tipo_veiculo_necessario: '',
    peso_kg: '',
    data_frete: '',
    observacoes: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErro('')
  }

  function formatWpp(value: string) {
    const n = value.replace(/\D/g, '').slice(0, 11)
    if (n.length <= 2) return n
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
  }

  function nextStep() {
    if (!form.cliente_nome || !form.cliente_whatsapp) {
      setErro('Preencha nome e WhatsApp.')
      return
    }
    setErro('')
    setStep(2)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.origem || !form.destino) {
      setErro('Preencha origem e destino.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/solicitar-frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cliente_whatsapp: form.cliente_whatsapp.replace(/\D/g, ''),
          peso_kg: form.peso_kg ? parseInt(form.peso_kg) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFreteId(data.id)
      setStep('success')
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar solicitação')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    const linkRastreio = `${typeof window !== 'undefined' ? window.location.origin : ''}/rastrear/${freteId}`

    function copiarLink() {
      navigator.clipboard.writeText(linkRastreio)
    }

    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-emerald-500/10 blur-[80px] pointer-events-none" />
        <div className="relative max-w-sm mx-auto w-full">

          {/* Ícone sucesso */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Pedido enviado!</h2>
            <p className="text-white/40 text-sm mt-1">Entraremos em contato em breve.</p>
          </div>

          {/* Resumo */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-5 mb-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
              <span className="text-xl">📍</span>
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Rota</p>
                <p className="text-white text-sm font-bold">{form.origem} → {form.destino}</p>
              </div>
            </div>
            {form.descricao && (
              <div className="flex items-center gap-3 pt-3">
                <span className="text-xl">📦</span>
                <div>
                  <p className="text-white/30 text-[10px] uppercase tracking-wider">Carga</p>
                  <p className="text-white text-sm font-bold">{form.descricao}</p>
                </div>
              </div>
            )}
          </div>

          {/* Link de rastreamento */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-3xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔍</span>
              <p className="text-orange-400 font-black text-sm uppercase tracking-wider">Rastreie seu frete</p>
            </div>
            <p className="text-white/40 text-xs mb-3">Salve este link para acompanhar o status em tempo real:</p>
            <div className="bg-black/30 rounded-xl px-3 py-2.5 flex items-center gap-2 mb-3">
              <p className="text-white/60 text-xs flex-1 truncate font-mono">{linkRastreio}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copiarLink}
                className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                📋 Copiar link
              </button>
              <a
                href={linkRastreio}
                className="bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                🚛 Rastrear agora
              </a>
            </div>
          </div>

          <p className="text-center text-white/20 text-xs">Fretes IA Log • Seu frete, na hora certa</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070b14] relative overflow-hidden">
      <InstallBanner />


      {/* Glow top */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/10 blur-[100px] pointer-events-none" />

      {/* HERO */}
      <div className="relative pt-24 pb-0 px-4 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Fretes locais • Rápido e confiável</span>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/40">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 3h15v13H1V3zm15 4h2.5l2.5 3v3h-5V7zM5.5 17a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm11 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
            </svg>
          </div>
          <div className="text-left">
            <p className="text-white font-black text-xl leading-none tracking-wider">FRETES IA</p>
            <p className="text-orange-400 text-xs font-bold tracking-[0.3em] uppercase">LOG</p>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight mb-12 max-w-2xl mx-auto">
          Seu frete,{' '}
          <span className="relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              na hora certa
            </span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
              <path d="M0 6 Q50 1 100 6 Q150 11 200 6" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
            </svg>
          </span>
        </h1>

        <div className="max-w-md mx-auto mb-8 space-y-4">
          <p className="text-white/40 text-base sm:text-lg">
            Conectamos você aos melhores motoristas da região.
          </p>
          <p className="text-white/40 text-base sm:text-lg">
            Solicite agora e receba confirmação pelo WhatsApp.
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 mb-10">
          {[
            { n: '100+', label: 'Motoristas' },
            { n: '24h', label: 'Atendimento' },
            { n: '5★', label: 'Avaliação' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-orange-400">{s.n}</p>
              <p className="text-white/30 text-xs uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Animated route */}
        <div className="max-w-xs mx-auto">
          <AnimatedRoute />
        </div>
      </div>

      {/* COMO FUNCIONA */}
      <div className="relative px-4 py-12 max-w-3xl mx-auto">
        <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.4em] mb-8">Como funciona</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: '01', icon: '📋', title: 'Solicite', desc: 'Preencha os dados do seu frete em menos de 2 minutos' },
            { n: '02', icon: '✅', title: 'Confirmamos', desc: 'Nossa equipe aprova e seleciona o motorista ideal' },
            { n: '03', icon: '🚛', title: 'Entregamos', desc: 'O motorista recebe e você acompanha pelo WhatsApp' },
          ].map((item) => (
            <div key={item.n} className="relative bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 text-center hover:border-orange-500/30 transition-all duration-300 group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#070b14] px-2">
                <span className="text-orange-500/40 text-xs font-black">{item.n}</span>
              </div>
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
              <p className="text-white font-bold text-sm mb-1">{item.title}</p>
              <p className="text-white/30 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FORMULÁRIO */}
      <div ref={formRef} className="relative px-4 pb-20 max-w-lg mx-auto">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl">

          <div className="mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {step === 1 ? 'Quem é você?' : 'Detalhes do frete'}
            </h2>
            <p className="text-white/30 text-sm mt-1">
              {step === 1 ? 'Precisamos do seu contato para confirmar o frete.' : 'Nos conte o que precisa transportar.'}
            </p>
          </div>

          <StepIndicator step={step} />

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">Nome completo *</label>
                <input
                  className={inputClass}
                  placeholder="Seu nome"
                  value={form.cliente_nome}
                  onChange={(e) => set('cliente_nome', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">WhatsApp *</label>
                <input
                  className={inputClass}
                  placeholder="(11) 99999-9999"
                  value={form.cliente_whatsapp}
                  onChange={(e) => set('cliente_whatsapp', formatWpp(e.target.value))}
                  inputMode="tel"
                />
                <p className="text-white/20 text-xs mt-1.5">Você receberá a confirmação aqui</p>
              </div>

              {erro && <p className="text-red-400 text-xs bg-red-500/10 rounded-xl px-4 py-3">{erro}</p>}

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-orange-500 hover:bg-orange-400 text-white font-black py-4 rounded-2xl text-sm tracking-wider uppercase transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 mt-2"
              >
                Continuar →
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">Origem *</label>
                  <input
                    className={inputClass}
                    placeholder="Bairro ou cidade"
                    value={form.origem}
                    onChange={(e) => set('origem', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">Destino *</label>
                  <input
                    className={inputClass}
                    placeholder="Bairro ou cidade"
                    value={form.destino}
                    onChange={(e) => set('destino', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">O que será transportado?</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  placeholder="Descreva a carga (móveis, equipamentos, mercadorias...)"
                  rows={3}
                  value={form.descricao}
                  onChange={(e) => set('descricao', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">Tipo de veículo</label>
                  <div className="relative">
                    <select
                      className={selectClass}
                      value={form.tipo_veiculo_necessario}
                      onChange={(e) => set('tipo_veiculo_necessario', e.target.value)}
                    >
                      <option value="">Qualquer</option>
                      {TIPOS_VEICULO.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">▾</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">Peso estimado (kg)</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="Ex: 500"
                    value={form.peso_kg}
                    onChange={(e) => set('peso_kg', e.target.value)}
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">Data do frete</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.data_frete}
                  onChange={(e) => set('data_frete', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">Observações</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  placeholder="Algo que precisamos saber? (horário, acesso, etc.)"
                  rows={2}
                  value={form.observacoes}
                  onChange={(e) => set('observacoes', e.target.value)}
                />
              </div>

              {erro && <p className="text-red-400 text-xs bg-red-500/10 rounded-xl px-4 py-3">{erro}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-4 rounded-2xl text-sm text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  ← Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-black py-4 rounded-2xl text-sm tracking-wider uppercase transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  ) : '🚛'}
                  {loading ? 'Enviando...' : 'Solicitar frete'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-6 mt-8">
          {['🔒 100% seguro', '⚡ Resposta rápida', '📲 Confirmação no WhatsApp'].map((t) => (
            <span key={t} className="text-white/20 text-xs">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
