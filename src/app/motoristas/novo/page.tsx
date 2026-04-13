'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/lib/use-supabase'
import { Header } from '@/components/layout/Header'
import { TIPOS_VEICULO, CATEGORIAS_CNH, TIPOS_CARROCERIA, ESTADOS_BR } from '@/types'
import { ArrowLeft, Save, User, FileText, Truck, Settings } from 'lucide-react'

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

export default function NovoMotoristaPage() {
  const supabase = useSupabase()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
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
      ativo: true,
    }

    const { data, error: err } = await supabase.from('motoristas').insert(payload).select().single()

    if (err) {
      setError('Erro ao salvar motorista. Verifique os dados e tente novamente.')
      setSaving(false)
      return
    }

    router.push(`/motoristas/${data.id}`)
  }

  return (
    <div className="animate-fade-in">
      <Header />
      <div className="p-8 max-w-3xl mx-auto space-y-5">
        <Link
          href="/motoristas"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-body transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para motoristas
        </Link>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal data */}
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
            <Field label="WhatsApp" required hint="Formato: 5511999999999">
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
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </Field>
          </FormSection>

          {/* Documentation */}
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
                  <option key={cat} value={cat}>
                    Categoria {cat}
                  </option>
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

          {/* Vehicle data */}
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
                  <option key={t} value={t}>
                    {t}
                  </option>
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

          {/* Operational config */}
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
                <span className="text-sm font-body text-slate-700">
                  Sim, aceita carga fracionada
                </span>
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
                <span className="text-sm font-body text-slate-700">
                  Sim, aceita carga refrigerada
                </span>
              </label>
            </Field>
          </FormSection>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-body">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/motoristas"
              className="px-5 py-2.5 text-sm font-body font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-body font-semibold transition-colors shadow-sm shadow-orange-500/20"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Salvando...' : 'Cadastrar Motorista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
