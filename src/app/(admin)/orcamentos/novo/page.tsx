'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/lib/use-supabase'
import { Header } from '@/components/layout/Header'
import { TIPOS_VEICULO } from '@/types'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
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
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  full?: boolean
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-body font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full px-3.5 py-2.5 text-sm font-body bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 focus:bg-white transition-all'

export default function NovoOrcamentoPage() {
  const supabase = useSupabase()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    cliente_nome: '',
    cliente_whatsapp: '',
    origem: '',
    destino: '',
    descricao: '',
    tipo_veiculo_necessario: '',
    peso_kg: '',
    valor_estimado: '',
    data_frete: '',
    observacoes: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      cliente_nome: form.cliente_nome,
      cliente_whatsapp: form.cliente_whatsapp.replace(/\D/g, ''),
      origem: form.origem,
      destino: form.destino,
      descricao: form.descricao || null,
      tipo_veiculo_necessario: form.tipo_veiculo_necessario || null,
      peso_kg: form.peso_kg ? parseInt(form.peso_kg) : null,
      valor_estimado: form.valor_estimado ? parseFloat(form.valor_estimado.replace(',', '.')) : null,
      data_frete: form.data_frete || null,
      observacoes: form.observacoes || null,
      status: 'pendente',
      motoristas_notificados: 0,
    }

    const { data, error: err } = await supabase.from('orcamentos').insert(payload).select().single()

    if (err) {
      setError('Erro ao salvar orçamento. Verifique os dados e tente novamente.')
      setSaving(false)
      return
    }

    router.push(`/orcamentos/${data.id}`)
  }

  return (
    <div className="animate-fade-in">
      <Header />
      <div className="p-8 max-w-3xl mx-auto space-y-5">
        <Link
          href="/orcamentos"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-body transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para orçamentos
        </Link>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormSection title="Dados do Cliente">
            <Field label="Nome do cliente" required>
              <input
                type="text"
                className={inputClass}
                placeholder="Ex: João da Silva"
                value={form.cliente_nome}
                onChange={(e) => set('cliente_nome', e.target.value)}
                required
              />
            </Field>
            <Field label="WhatsApp do cliente" required>
              <input
                type="tel"
                className={inputClass}
                placeholder="(11) 99999-9999"
                value={form.cliente_whatsapp}
                onChange={(e) => set('cliente_whatsapp', e.target.value)}
                required
              />
            </Field>
          </FormSection>

          <FormSection title="Detalhes do Frete">
            <Field label="Endereço de origem" required full>
              <input
                type="text"
                className={inputClass}
                placeholder="Rua, número, bairro, cidade — Ex: Rua das Flores, 123, Centro, São Paulo/SP"
                value={form.origem}
                onChange={(e) => set('origem', e.target.value)}
                required
              />
            </Field>
            <Field label="Endereço de destino" required full>
              <input
                type="text"
                className={inputClass}
                placeholder="Rua, número, bairro, cidade — Ex: Av. Brasil, 456, Jardim América, Guarulhos/SP"
                value={form.destino}
                onChange={(e) => set('destino', e.target.value)}
                required
              />
            </Field>
            <Field label="Descrição da carga" full>
              <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                placeholder="Descreva o que será transportado..."
                value={form.descricao}
                onChange={(e) => set('descricao', e.target.value)}
              />
            </Field>
            <Field label="Tipo de veículo necessário">
              <select
                className={inputClass}
                value={form.tipo_veiculo_necessario}
                onChange={(e) => set('tipo_veiculo_necessario', e.target.value)}
              >
                <option value="">Qualquer veículo</option>
                {TIPOS_VEICULO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label} ({t.capacidade})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Peso estimado (kg)">
              <input
                type="number"
                className={inputClass}
                placeholder="Ex: 500"
                value={form.peso_kg}
                onChange={(e) => set('peso_kg', e.target.value)}
                min="0"
              />
            </Field>
          </FormSection>

          <FormSection title="Valores e Agendamento">
            <Field label="Valor estimado (R$)">
              <input
                type="text"
                className={inputClass}
                placeholder="Ex: 350,00"
                value={form.valor_estimado}
                onChange={(e) => set('valor_estimado', e.target.value)}
              />
            </Field>
            <Field label="Data do frete">
              <input
                type="date"
                className={inputClass}
                value={form.data_frete}
                onChange={(e) => set('data_frete', e.target.value)}
              />
            </Field>
            <Field label="Observações internas" full>
              <textarea
                className={`${inputClass} resize-none`}
                rows={2}
                placeholder="Notas internas sobre este orçamento..."
                value={form.observacoes}
                onChange={(e) => set('observacoes', e.target.value)}
              />
            </Field>
          </FormSection>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-body">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/orcamentos"
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
              {saving ? 'Salvando...' : 'Salvar Orçamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
