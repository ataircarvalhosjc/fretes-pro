'use client'

import { useState } from 'react'
import { TIPOS_VEICULO, CATEGORIAS_CNH, TIPOS_CARROCERIA, ESTADOS_BR } from '@/types'
import { User, FileText, Truck, Settings, Save } from 'lucide-react'

const inputClass =
  'w-full px-3.5 py-2.5 text-sm font-body bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 focus:bg-white transition-all'

const checkboxClass =
  'w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 focus:ring-offset-0'

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-orange-500" />
        </div>
        <h2 className="font-display font-bold text-base text-slate-700 tracking-wide uppercase">
          {title}
        </h2>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function Field({
  label,
  required,
  children,
  full,
  hint,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  full?: boolean
  hint?: string
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-body font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 font-body mt-1">{hint}</p>}
    </div>
  )
}

export default function CadastroMotoristaPage() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/cadastro-motorista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          cpf: form.cpf || null,
          data_nascimento: form.data_nascimento || null,
          whatsapp: form.whatsapp.replace(/\D/g, ''),
          email: form.email || null,
          cidade: form.cidade || null,
          estado: form.estado || null,
          numero_cnh: form.numero_cnh || null,
          categoria_cnh: form.categoria_cnh || null,
          validade_cnh: form.validade_cnh || null,
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
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar cadastro')
    } finally {
      setSaving(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* HEADER */}
      <div className="bg-[#0D1424] px-4 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">
              FRETES<span className="text-orange-400">PRO</span>
            </p>
            <p className="text-gray-400 text-xs mt-0.5">Cadastro de Motorista</p>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="bg-[#0D1424] px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Receba fretes direto no seu <span className="text-orange-400">WhatsApp</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-lg">
            Preencha seus dados abaixo e seja notificado assim que surgir um frete ideal para o seu veículo. Gratuito e sem burocracia.
          </p>
          <div className="flex gap-4 mt-5">
            {[
              { icon: '💰', label: 'Sem taxa' },
              { icon: '📲', label: 'Via WhatsApp' },
              { icon: '🚛', label: 'Fretes diários' },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                <span className="text-base">{b.icon}</span>
                <span className="text-white text-xs font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">

            <FormSection title="Dados Pessoais" icon={User}>
              <Field label="Nome completo" required>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Nome como no documento"
                  value={form.nome}
                  onChange={(e) => set('nome', e.target.value)}
                  required
                />
              </Field>
              <Field label="CPF">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => set('cpf', e.target.value)}
                />
              </Field>
              <Field label="Data de nascimento">
                <input
                  type="date"
                  className={inputClass}
                  value={form.data_nascimento}
                  onChange={(e) => set('data_nascimento', e.target.value)}
                />
              </Field>
              <Field label="WhatsApp" required hint="Formato: (11) 99999-9999">
                <input
                  type="tel"
                  className={inputClass}
                  placeholder="(11) 99999-9999"
                  value={form.whatsapp}
                  onChange={(e) => set('whatsapp', e.target.value)}
                  required
                />
              </Field>
              <Field label="E-mail">
                <input
                  type="email"
                  className={inputClass}
                  placeholder="email@exemplo.com (opcional)"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </Field>
              <div />
              <Field label="Cidade">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Ex: São Paulo"
                  value={form.cidade}
                  onChange={(e) => set('cidade', e.target.value)}
                />
              </Field>
              <Field label="Estado">
                <select
                  className={inputClass}
                  value={form.estado}
                  onChange={(e) => set('estado', e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {ESTADOS_BR.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </Field>
            </FormSection>

            <FormSection title="Documentação" icon={FileText}>
              <Field label="Número da CNH">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Número da habilitação"
                  value={form.numero_cnh}
                  onChange={(e) => set('numero_cnh', e.target.value)}
                />
              </Field>
              <Field label="Categoria da CNH" hint="B=utilitários / C,D,E=pesados">
                <select
                  className={inputClass}
                  value={form.categoria_cnh}
                  onChange={(e) => set('categoria_cnh', e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {CATEGORIAS_CNH.map((cat) => (
                    <option key={cat} value={cat}>Categoria {cat}</option>
                  ))}
                </select>
              </Field>
              <Field label="Validade da CNH">
                <input
                  type="date"
                  className={inputClass}
                  value={form.validade_cnh}
                  onChange={(e) => set('validade_cnh', e.target.value)}
                />
              </Field>
              <Field label="RNTRC / ANTT" hint="Obrigatório por lei para frete remunerado">
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Número do RNTRC"
                  value={form.rntrc}
                  onChange={(e) => set('rntrc', e.target.value)}
                />
              </Field>
            </FormSection>

            <FormSection title="Dados do Veículo" icon={Truck}>
              <Field label="Tipo de veículo" required>
                <select
                  className={inputClass}
                  value={form.tipo_veiculo}
                  onChange={(e) => set('tipo_veiculo', e.target.value)}
                  required
                >
                  <option value="">Selecione o veículo...</option>
                  {TIPOS_VEICULO.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} — {t.capacidade}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tipo de carroceria">
                <select
                  className={inputClass}
                  value={form.tipo_carroceria}
                  onChange={(e) => set('tipo_carroceria', e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {TIPOS_CARROCERIA.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Placa">
                <input
                  type="text"
                  className={`${inputClass} uppercase`}
                  placeholder="ABC-1234 ou ABC1D23"
                  value={form.placa}
                  onChange={(e) => set('placa', e.target.value.toUpperCase())}
                  maxLength={8}
                />
              </Field>
              <Field label="Ano do veículo">
                <input
                  type="number"
                  className={inputClass}
                  placeholder="Ex: 2020"
                  value={form.ano_veiculo}
                  onChange={(e) => set('ano_veiculo', e.target.value)}
                  min={1980}
                  max={new Date().getFullYear() + 1}
                />
              </Field>
              <Field label="Capacidade de carga (kg)">
                <input
                  type="number"
                  className={inputClass}
                  placeholder="Em kg"
                  value={form.capacidade_kg}
                  onChange={(e) => set('capacidade_kg', e.target.value)}
                  min={0}
                />
              </Field>
            </FormSection>

            <FormSection title="Configurações Operacionais" icon={Settings}>
              <Field label="Disponibilidade" full>
                <div className="flex gap-3">
                  {(['ativo', 'inativo', 'ferias'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => set('disponibilidade', d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-body font-semibold capitalize border transition-all ${
                        form.disponibilidade === d
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {d === 'ferias' ? 'Férias' : d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Aceita carga fracionada?">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    checked={form.aceita_fracionado}
                    onChange={(e) => set('aceita_fracionado', e.target.checked)}
                  />
                  <span className="text-sm font-body text-slate-700">Sim, aceita carga fracionada</span>
                </label>
              </Field>
              <Field label="Aceita carga refrigerada?">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    checked={form.aceita_refrigerado}
                    onChange={(e) => set('aceita_refrigerado', e.target.checked)}
                  />
                  <span className="text-sm font-body text-slate-700">Sim, aceita carga refrigerada</span>
                </label>
              </Field>
            </FormSection>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-body">
                {error}
              </div>
            )}

            <div className="flex justify-end pt-2 pb-8">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-8 py-3 rounded-xl text-sm font-body font-semibold transition-colors shadow-sm shadow-orange-500/20"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Enviando...' : 'Cadastrar e receber fretes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
