'use client'

import { useState, useEffect, useRef } from 'react'
import { TIPOS_VEICULO } from '@/types'
import { pedirPermissaoNotificacao, ouvirNotificacoesEmPrimeiroPLano } from '@/lib/firebase'
import { TABELA_PRECOS_PUBLICO, calcularFrete, formatarPreco } from '@/lib/tabela-precos'

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
  const [arrived, setArrived] = useState(false)

  useEffect(() => {
    let p = 0
    let pausing = false
    let intervalId: ReturnType<typeof setInterval> | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    function startAnim() {
      p = 0
      pausing = false
      setProgress(0)
      setArrived(false)
      intervalId = setInterval(() => {
        p += 1.2
        setProgress(Math.min(p, 100))
        if (p >= 100 && !pausing) {
          pausing = true
          setArrived(true)
          clearInterval(intervalId!)
          timeoutId = setTimeout(startAnim, 2000)
        }
      }, 20)
    }

    timeoutId = setTimeout(startAnim, 800)
    return () => {
      if (intervalId) clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="relative my-8 px-2">
      {/* City labels */}
      <div className="flex justify-between mb-3 px-1">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Origem</span>
        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${arrived ? 'text-emerald-400' : 'text-white/20'}`}>Destino</span>
      </div>

      <div className="relative flex items-center gap-3">
        {/* Ponto de origem */}
        <div className="shrink-0 relative">
          <div className="w-11 h-11 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-orange-400 border-2 border-[#070b14]" />
        </div>

        {/* Trilha animada */}
        <div className="flex-1 relative h-2 bg-white/[0.06] rounded-full overflow-hidden">
          {/* Trilha preenchida */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 rounded-full transition-none"
            style={{ width: `${progress}%` }}
          />
          {/* Brilho da trilha */}
          <div
            className="absolute inset-y-0 left-0 rounded-full opacity-40"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              backgroundSize: '60% 100%',
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Caminhão */}
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-none"
            style={{ left: `calc(${progress}% - 14px)`, display: progress <= 2 ? 'none' : 'block' }}
          >
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center shadow-xl shadow-orange-500/60 border border-orange-300/30">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 3h15v13H1V3zm15 4h2.5l2.5 3v3h-5V7zM5.5 17a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm11 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Ponto de destino */}
        <div className="shrink-0">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-700 ${arrived ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-white/[0.08] border border-white/10'}`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Distância estimada */}
      <div className="flex justify-center mt-3">
        <span className="text-[10px] text-white/20 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
          Frete rápido e rastreável em tempo real
        </span>
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
  const [notifStatus, setNotifStatus] = useState<'idle' | 'pedindo' | 'ok' | 'negado'>('idle')
  const formRef = useRef<HTMLDivElement>(null)
  const [distanciaKm, setDistanciaKm] = useState<number | null>(null)
  const [valorEstimado, setValorEstimado] = useState<number | null>(null)
  const [calculando, setCalculando] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState<'origem' | 'destino' | null>(null)

  const [form, setForm] = useState({
    cliente_nome: '',
    cliente_whatsapp: '',
    cep_origem: '',
    numero_origem: '',
    endereco_origem: '',
    cidade_origem: '',
    _cidade_nome_origem: '',
    _uf_origem: '',
    cep_destino: '',
    numero_destino: '',
    endereco_destino: '',
    cidade_destino: '',
    _cidade_nome_destino: '',
    _uf_destino: '',
    descricao: '',
    tipo_veiculo_necessario: '',
    peso_kg: '',
    data_frete: '',
    horario_frete: '',
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

  // Geocodifica cidade/UF direto do browser do usuário (Nominatim permite requisições de browsers reais)
  async function geocodificarCidade(cidade: string, uf: string): Promise<[number, number] | null> {
    try {
      const q = encodeURIComponent(`${cidade} ${uf} Brasil`)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=br`,
        { headers: { 'User-Agent': 'FretesIALog/1.0 (browser)' } }
      )
      const data = await res.json()
      if (!data?.[0]) return null
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    } catch {
      return null
    }
  }

  // Haversine — distância em linha reta entre dois pontos (lat/lon)
  function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  async function buscarCep(cep: string, tipo: 'origem' | 'destino') {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setBuscandoCep(tipo)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data.erro) return
      const endereco = [data.logradouro, data.bairro].filter(Boolean).join(', ')
      const cidade = data.localidade
      const uf = data.uf
      const cidadeLabel = `${cidade} - ${uf}`
      const newForm = tipo === 'origem'
        ? { ...form, cep_origem: cep, endereco_origem: endereco, cidade_origem: cidadeLabel, _cidade_nome_origem: cidade, _uf_origem: uf }
        : { ...form, cep_destino: cep, endereco_destino: endereco, cidade_destino: cidadeLabel, _cidade_nome_destino: cidade, _uf_destino: uf }
      setForm(newForm)
      if (newForm.cep_origem && newForm.cep_destino) {
        calcularDistanciaEValor(newForm as typeof form)
      }
    } catch { } finally {
      setBuscandoCep(null)
    }
  }

  async function calcularDistanciaEValor(novoForm: typeof form) {
    if (!novoForm.cep_origem || !novoForm.cep_destino) return
    setCalculando(true)
    setDistanciaKm(null)
    setValorEstimado(null)
    try {
      const cidadeO = novoForm._cidade_nome_origem || novoForm.cidade_origem.split(' - ')[0]
      const ufO = novoForm._uf_origem || novoForm.cidade_origem.split(' - ')[1] || ''
      const cidadeD = novoForm._cidade_nome_destino || novoForm.cidade_destino.split(' - ')[0]
      const ufD = novoForm._uf_destino || novoForm.cidade_destino.split(' - ')[1] || ''

      const [coordO, coordD] = await Promise.all([
        geocodificarCidade(cidadeO, ufO),
        geocodificarCidade(cidadeD, ufD),
      ])

      if (!coordO || !coordD) return

      // Haversine × 1.35 = estimativa de distância por estrada
      const linhaReta = haversineKm(coordO[0], coordO[1], coordD[0], coordD[1])
      const kmEstrada = Math.round(linhaReta * 1.35)

      setDistanciaKm(kmEstrada)
      if (novoForm.tipo_veiculo_necessario) {
        setValorEstimado(calcularFrete(kmEstrada, novoForm.tipo_veiculo_necessario))
      }
    } catch (e) {
      console.error('Erro ao calcular distância:', e)
    } finally {
      setCalculando(false)
    }
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
    if (!form.endereco_origem || !form.cidade_origem || !form.endereco_destino || !form.cidade_destino) {
      setErro('Preencha os CEPs de origem e destino.')
      return
    }
    setLoading(true)
    try {
      const digits = form.data_frete.replace(/\D/g, '')
      const dd = digits.slice(0, 2), mm = digits.slice(2, 4), yy = digits.slice(4)
      const year = yy.length === 2 ? `20${yy}` : yy
      const dataConvertida = digits.length >= 8 ? `${year}-${mm}-${dd}` : null

      const res = await fetch('/api/solicitar-frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nome: form.cliente_nome,
          cliente_whatsapp: form.cliente_whatsapp.replace(/\D/g, ''),
          origem: [form.endereco_origem, form.numero_origem, `CEP ${form.cep_origem}`, form.cidade_origem].filter(Boolean).join(', '),
          destino: [form.endereco_destino, form.numero_destino, `CEP ${form.cep_destino}`, form.cidade_destino].filter(Boolean).join(', '),
          descricao: form.descricao || null,
          tipo_veiculo_necessario: form.tipo_veiculo_necessario || null,
          peso_kg: form.peso_kg ? parseInt(form.peso_kg) : null,
          valor_estimado: valorEstimado || null,
          data_frete: dataConvertida,
          horario_frete: form.horario_frete || null,
          observacoes: form.observacoes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFreteId(data.id)
      setStep('success')
      ouvirNotificacoesEmPrimeiroPLano()
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar solicitação')
    } finally {
      setLoading(false)
    }
  }

  async function ativarNotificacoes() {
    setNotifStatus('pedindo')
    const token = await pedirPermissaoNotificacao()
    if (token && freteId) {
      await fetch('/api/salvar-fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orcamentoId: freteId, fcmToken: token }),
      })
      setNotifStatus('ok')
    } else {
      setNotifStatus('negado')
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
                <p className="text-white text-sm font-bold">{[form.endereco_origem, form.cidade_origem].filter(Boolean).join(', ')} → {[form.endereco_destino, form.cidade_destino].filter(Boolean).join(', ')}</p>
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

          {/* Card de notificação push */}
          {notifStatus === 'idle' && (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="text-white font-bold text-sm">Quer ser notificado?</p>
                  <p className="text-white/40 text-xs">Receba alertas quando seu frete for atualizado</p>
                </div>
              </div>
              <button
                onClick={ativarNotificacoes}
                className="w-full bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold py-3 rounded-2xl transition-all"
              >
                Ativar notificações
              </button>
            </div>
          )}

          {notifStatus === 'pedindo' && (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-5 mb-4 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin shrink-0" />
              <p className="text-white/60 text-sm">Ativando notificações...</p>
            </div>
          )}

          {notifStatus === 'ok' && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 mb-4 flex items-center gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-emerald-400 font-bold text-sm">Notificações ativadas!</p>
                <p className="text-white/40 text-xs">Você receberá alertas sobre seu frete</p>
              </div>
            </div>
          )}

          {notifStatus === 'negado' && (
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-5 mb-4">
              <p className="text-white/40 text-xs text-center">Notificações bloqueadas. Acompanhe pelo link de rastreamento.</p>
            </div>
          )}

          <p className="text-center text-white/20 text-xs">Fretes IA Log • Seu frete, na hora certa</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070b14] relative overflow-hidden">
      <InstallBanner />

      {/* Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed top-40 right-0 w-[300px] h-[300px] bg-amber-500/5 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[300px] bg-orange-600/5 blur-[120px] pointer-events-none" />

      {/* HERO */}
      <div className="relative pt-20 pb-0 px-4 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-8">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-orange-400 text-xs font-bold uppercase tracking-widest">Fretes locais • Rápido e confiável</span>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-orange-500/30 blur-md" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/50 border border-orange-400/30">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 3h15v13H1V3zm15 4h2.5l2.5 3v3h-5V7zM5.5 17a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm11 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
              </svg>
            </div>
          </div>
          <div className="text-left">
            <p className="text-white font-black text-2xl leading-none tracking-wider">FRETES IA</p>
            <p className="text-orange-400 text-[11px] font-bold tracking-[0.4em] uppercase mt-0.5">LOG • PLATAFORMA</p>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-black text-white leading-[1.0] tracking-tight mb-6 max-w-2xl mx-auto">
          Seu frete,{' '}
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-orange-400 to-amber-500">
              na hora certa
            </span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
              <path d="M0 6 Q50 1 100 6 Q150 11 200 6" stroke="url(#ugrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"/>
              <defs>
                <linearGradient id="ugrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fb923c"/>
                  <stop offset="100%" stopColor="#f59e0b"/>
                </linearGradient>
              </defs>
            </svg>
          </span>
        </h1>

        <p className="max-w-sm mx-auto mb-10 text-white/55 text-base sm:text-lg leading-relaxed">
          Conectamos você aos melhores motoristas da região. Confirmação direto no seu WhatsApp.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-10 max-w-sm mx-auto">
          {[
            { n: '100+', label: 'Motoristas' },
            { n: '24h', label: 'Atendimento' },
            { n: '5★', label: 'Avaliação' },
          ].map((s, i) => (
            <div key={s.label} className="flex-1 text-center bg-white/[0.04] border border-white/[0.08] rounded-2xl py-3 px-2 hover:border-orange-500/30 transition-colors">
              <p className="text-xl font-black text-orange-400 leading-none mb-1">{s.n}</p>
              <p className="text-white/35 text-[10px] uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Animated route */}
        <div className="max-w-sm mx-auto">
          <AnimatedRoute />
        </div>

        {/* CTA */}
        <a
          href="#form-solicitar"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-black px-8 py-4 rounded-2xl text-sm tracking-wider uppercase transition-all duration-200 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 mb-4"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 3h15v13H1V3zm15 4h2.5l2.5 3v3h-5V7zM5.5 17a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm11 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/>
          </svg>
          Solicitar frete agora
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>

      {/* TABELA DE PREÇOS */}
      <div className="relative px-4 py-12 max-w-3xl mx-auto">
        <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.4em] mb-2">Tabela de preços</p>
        <h3 className="text-center text-white font-black text-xl mb-2">Valores aproximados</h3>
        <p className="text-center text-white/30 text-xs mb-8">O valor exato é confirmado após análise do pedido</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/20 uppercase tracking-wider border-b border-white/5">
                <th className="text-left py-3 pr-4">Veículo</th>
                <th className="text-right py-3 px-2">Mínimo</th>
                <th className="text-right py-3 px-2">10 km</th>
                <th className="text-right py-3 px-2">20 km</th>
                <th className="text-right py-3 px-2">40 km</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(TABELA_PRECOS_PUBLICO).map(([key, v]) => (
                <tr key={key} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-4 font-bold text-white">{v.label}</td>
                  <td className="py-3 px-2 text-right text-orange-400 font-semibold">{formatarPreco(v.base)}</td>
                  <td className="py-3 px-2 text-right text-white/60">{formatarPreco(calcularFrete(10, key)!)}</td>
                  <td className="py-3 px-2 text-right text-white/60">{formatarPreco(calcularFrete(20, key)!)}</td>
                  <td className="py-3 px-2 text-right text-white/60">{formatarPreco(calcularFrete(40, key)!)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-white/20 text-[10px] mt-4">* Os valores não são fixos e variam conforme o tipo de carga, horário e condições da rota. O valor exato é confirmado após análise do pedido.</p>
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
      <div ref={formRef} id="form-solicitar" className="relative px-4 pb-20 max-w-lg mx-auto">
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
              {/* ORIGEM */}
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">CEP de origem *</label>
                <div className="relative">
                  <input
                    className={inputClass}
                    placeholder="00000-000"
                    maxLength={9}
                    inputMode="numeric"
                    value={form.cep_origem}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 8)
                      if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5)
                      set('cep_origem', v)
                      if (v.replace(/\D/g, '').length === 8) buscarCep(v, 'origem')
                    }}
                  />
                  {buscandoCep === 'origem' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">buscando...</span>}
                </div>
              </div>
              {form.endereco_origem && (
                <div className="bg-white/5 rounded-xl px-4 py-3 text-xs text-white/60">
                  📍 {form.endereco_origem} — {form.cidade_origem}
                </div>
              )}
              {form.endereco_origem && (
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">Número *</label>
                  <input
                    className={inputClass}
                    placeholder="Ex: 123"
                    inputMode="numeric"
                    value={form.numero_origem}
                    onChange={(e) => set('numero_origem', e.target.value)}
                    required
                  />
                </div>
              )}

              {/* DESTINO */}
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">CEP de destino *</label>
                <div className="relative">
                  <input
                    className={inputClass}
                    placeholder="00000-000"
                    maxLength={9}
                    inputMode="numeric"
                    value={form.cep_destino}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 8)
                      if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5)
                      set('cep_destino', v)
                      if (v.replace(/\D/g, '').length === 8) buscarCep(v, 'destino')
                    }}
                  />
                  {buscandoCep === 'destino' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">buscando...</span>}
                </div>
              </div>
              {form.endereco_destino && (
                <div className="bg-white/5 rounded-xl px-4 py-3 text-xs text-white/60">
                  📍 {form.endereco_destino} — {form.cidade_destino}
                </div>
              )}
              {form.endereco_destino && (
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">Número *</label>
                  <input
                    className={inputClass}
                    placeholder="Ex: 456"
                    inputMode="numeric"
                    value={form.numero_destino}
                    onChange={(e) => set('numero_destino', e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-3">O que você vai transportar? *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: '📄', label: 'Documento / Encomenda', sub: 'Até 5 kg', veiculo: 'moto' },
                    { icon: '🛒', label: 'Compras / Caixas', sub: 'Peso leve', veiculo: 'utilitario' },
                    { icon: '📺', label: 'Eletrodoméstico', sub: 'TV, fogão, geladeira...', veiculo: 'utilitario' },
                    { icon: '🛋️', label: 'Móveis', sub: 'Sofá, armário, cama...', veiculo: 'furgao' },
                    { icon: '🏠', label: 'Mudança', sub: 'Vários volumes', veiculo: 'furgao' },
                    { icon: '📦', label: 'Mercadorias', sub: 'Caixas, paletes...', veiculo: 'utilitario' },
                  ].map((cat) => {
                    const selecionado = form.descricao === cat.label
                    return (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => {
                          set('descricao', cat.label)
                          const novoVeiculo = cat.veiculo
                          setForm((prev) => {
                            const newForm = { ...prev, descricao: cat.label, tipo_veiculo_necessario: novoVeiculo }
                            if (distanciaKm) {
                              setValorEstimado(calcularFrete(distanciaKm, novoVeiculo))
                            } else if (newForm.cidade_origem && newForm.cidade_destino) {
                              calcularDistanciaEValor(newForm)
                            }
                            return newForm
                          })
                        }}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all ${selecionado ? 'bg-orange-500/20 border-orange-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'}`}
                      >
                        <span className="text-2xl shrink-0">{cat.icon}</span>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold leading-tight ${selecionado ? 'text-orange-300' : 'text-white'}`}>{cat.label}</p>
                          <p className="text-[10px] text-white/30 mt-0.5">{cat.sub}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* VALOR ESTIMADO */}
              {calculando && (
                <div className="bg-white/5 rounded-xl px-4 py-3 text-xs text-white/40 flex items-center gap-2">
                  <div className="w-3 h-3 border border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Calculando distância e valores...
                </div>
              )}
              {distanciaKm && !calculando && (
                <div className="border-2 border-orange-500/40 bg-gradient-to-b from-orange-500/10 to-orange-500/5 rounded-2xl px-4 py-5">
                  {/* Cabeçalho */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                      <span className="text-orange-400 text-xs font-black uppercase tracking-widest">Selecione o veículo</span>
                    </div>
                    <span className="text-[10px] text-white/50 bg-white/10 px-2 py-1 rounded-lg font-mono">{distanciaKm} km</span>
                  </div>
                  <p className="text-white/40 text-[10px] mb-4 leading-relaxed">
                    Toque para escolher o veículo ideal para sua carga. Após análise, entraremos em contato pelo WhatsApp com o orçamento final.
                  </p>
                  <div className="space-y-2">
                    {Object.entries(TABELA_PRECOS_PUBLICO).map(([key, v]) => {
                      const valor = calcularFrete(distanciaKm, key)
                      const selecionado = form.tipo_veiculo_necessario === key
                      return (
                        <div
                          key={key}
                          onClick={() => {
                            set('tipo_veiculo_necessario', key)
                            setValorEstimado(valor)
                          }}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all border-2 ${
                            selecionado
                              ? 'bg-orange-500/25 border-orange-500 shadow-lg shadow-orange-500/20'
                              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selecionado ? 'border-orange-500 bg-orange-500' : 'border-white/30'}`}>
                              {selecionado && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className={`text-sm font-bold ${selecionado ? 'text-white' : 'text-white/70'}`}>{v.label}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2.5 flex items-start gap-2">
                    <span className="text-orange-400 text-sm shrink-0 mt-0.5">📲</span>
                    <p className="text-[10px] text-orange-400/80 leading-relaxed">
                      <strong>Orçamento personalizado.</strong> Após enviar sua solicitação, nossa equipe analisa os detalhes e envia o valor final pelo WhatsApp em poucos minutos.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">Data do frete</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="DD/MM/AAAA"
                    maxLength={10}
                    inputMode="numeric"
                    value={form.data_frete}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 8)
                      if (v.length >= 5) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4)
                      else if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2)
                      set('data_frete', v)
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">Horário</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="HH:MM"
                    maxLength={5}
                    inputMode="numeric"
                    value={form.horario_frete}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 4)
                      if (v.length >= 3) v = v.slice(0, 2) + ':' + v.slice(2)
                      set('horario_frete', v)
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-widest mb-2">Descreva sua encomenda em detalhes</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  placeholder={`Descreva tudo que será transportado:\n• Quantos volumes / peças?\n• Tamanho e peso aproximado?\n• Tem escada ou elevador?\n• Horário preferido?\n• Alguma dificuldade de acesso?`}
                  rows={5}
                  value={form.observacoes}
                  onChange={(e) => set('observacoes', e.target.value)}
                />
                <p className="text-white/25 text-[10px] mt-1.5">Quanto mais detalhes, mais preciso será o orçamento do transportador.</p>
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
