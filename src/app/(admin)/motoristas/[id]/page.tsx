'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/lib/use-supabase'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Header } from '@/components/layout/Header'
import type { Motorista } from '@/types'
import { TIPOS_VEICULO, CATEGORIAS_CNH, TIPOS_CARROCERIA, ESTADOS_BR } from '@/types'
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Truck,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckSquare,
  Snowflake,
  Package,
  Loader2,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const inputClass =
  'w-full px-3.5 py-2 text-sm font-body bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 focus:bg-white transition-all'

function InfoRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === null || value === undefined || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value)
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-body font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-body text-slate-700 text-right max-w-[60%]">{display}</span>
    </div>
  )
}

export default function MotoristaDetailPage() {
  const supabase = useSupabase()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [motorista, setMotorista] = useState<Motorista | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Motorista>>({})

  useEffect(() => {
    fetchMotorista()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, supabase])

  async function fetchMotorista() {
    setLoading(true)
    const { data } = await supabase.from('motoristas').select('*').eq('id', id).single()
    setMotorista(data)
    setEditForm(data ?? {})
    setLoading(false)
  }

  function startEdit() {
    setEditForm(motorista ?? {})
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setEditForm(motorista ?? {})
  }

  function set(field: string, value: string | boolean) {
    setEditForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('motoristas')
      .update({
        nome: editForm.nome,
        cpf: editForm.cpf || null,
        data_nascimento: editForm.data_nascimento || null,
        whatsapp: (editForm.whatsapp ?? '').replace(/\D/g, ''),
        email: editForm.email || null,
        cidade: editForm.cidade || null,
        estado: editForm.estado || null,
        numero_cnh: editForm.numero_cnh || null,
        categoria_cnh: editForm.categoria_cnh || null,
        validade_cnh: editForm.validade_cnh || null,
        rntrc: editForm.rntrc || null,
        tipo_veiculo: editForm.tipo_veiculo,
        placa: editForm.placa ? editForm.placa.toUpperCase() : null,
        ano_veiculo: editForm.ano_veiculo || null,
        tipo_carroceria: editForm.tipo_carroceria || null,
        capacidade_kg: editForm.capacidade_kg || null,
        aceita_fracionado: editForm.aceita_fracionado,
        aceita_refrigerado: editForm.aceita_refrigerado,
        disponibilidade: editForm.disponibilidade,
        ativo: editForm.ativo,
      })
      .eq('id', id)

    if (!error) {
      await fetchMotorista()
      setEditing(false)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(`Deseja remover o motorista "${motorista?.nome}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    await supabase.from('motoristas').delete().eq('id', id)
    router.push('/motoristas')
  }

  async function toggleDisponibilidade(disp: string) {
    await supabase.from('motoristas').update({ disponibilidade: disp }).eq('id', id)
    setMotorista((prev) => prev ? { ...prev, disponibilidade: disp as any } : prev)
  }

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (!motorista) {
    return (
      <div>
        <Header />
        <div className="p-8 text-center">
          <p className="text-slate-500 font-body">Motorista não encontrado.</p>
          <Link href="/motoristas" className="text-orange-500 text-sm font-body mt-2 inline-block">← Voltar</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Header />
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/motoristas"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-body transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Remover motorista"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={startEdit}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-body font-semibold text-slate-700 bg-white border border-gray-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-body font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-body font-semibold transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Profile card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-display font-bold text-orange-500">
                  {motorista.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <h1 className="font-display font-bold text-xl text-slate-900 tracking-wide">
                {motorista.nome}
              </h1>
              <p className="text-sm text-slate-500 font-body capitalize mt-1">{motorista.tipo_veiculo}</p>
              <div className="mt-3">
                <StatusBadge status={motorista.disponibilidade} />
              </div>

              {/* Quick status toggle */}
              <div className="mt-5 pt-4 border-t border-gray-50">
                <p className="text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Alterar disponibilidade
                </p>
                <div className="flex flex-col gap-1.5">
                  {(['ativo', 'inativo', 'ferias'] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleDisponibilidade(d)}
                      className={`py-1.5 rounded-lg text-xs font-body font-semibold capitalize transition-all ${
                        motorista.disponibilidade === d
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {d === 'ferias' ? 'Férias' : d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="mt-5 pt-4 border-t border-gray-50 space-y-3 text-left">
                {motorista.whatsapp && (
                  <a
                    href={`https://wa.me/${motorista.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm font-body text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    {motorista.whatsapp}
                  </a>
                )}
                {motorista.email && (
                  <div className="flex items-center gap-2.5 text-sm font-body text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {motorista.email}
                  </div>
                )}
                {(motorista.cidade || motorista.estado) && (
                  <div className="flex items-center gap-2.5 text-sm font-body text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {[motorista.cidade, motorista.estado].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Capabilities */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Capacidades
              </p>
              <div className="space-y-2">
                <div className={`flex items-center gap-2.5 text-sm font-body ${motorista.aceita_fracionado ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <Package className="w-4 h-4" />
                  {motorista.aceita_fracionado ? 'Aceita fracionado' : 'Não aceita fracionado'}
                </div>
                <div className={`flex items-center gap-2.5 text-sm font-body ${motorista.aceita_refrigerado ? 'text-blue-600' : 'text-slate-400'}`}>
                  <Snowflake className="w-4 h-4" />
                  {motorista.aceita_refrigerado ? 'Aceita refrigerado' : 'Não aceita refrigerado'}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
              <p className="text-xs font-body text-slate-400">
                Cadastrado em{' '}
                {format(new Date(motorista.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Detail / Edit panel */}
          <div className="lg:col-span-2 space-y-5">
            {!editing ? (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <h2 className="font-display font-bold text-base text-slate-700 tracking-wide uppercase">
                      Documentação
                    </h2>
                  </div>
                  <InfoRow label="CPF" value={motorista.cpf} />
                  <InfoRow
                    label="Data de nascimento"
                    value={
                      motorista.data_nascimento
                        ? format(new Date(motorista.data_nascimento + 'T12:00:00'), 'dd/MM/yyyy')
                        : null
                    }
                  />
                  <InfoRow label="Número da CNH" value={motorista.numero_cnh} />
                  <InfoRow label="Categoria CNH" value={motorista.categoria_cnh ? `Categoria ${motorista.categoria_cnh}` : null} />
                  <InfoRow
                    label="Validade CNH"
                    value={
                      motorista.validade_cnh
                        ? format(new Date(motorista.validade_cnh + 'T12:00:00'), 'dd/MM/yyyy')
                        : null
                    }
                  />
                  <InfoRow label="RNTRC / ANTT" value={motorista.rntrc} />
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Truck className="w-4 h-4 text-slate-400" />
                    <h2 className="font-display font-bold text-base text-slate-700 tracking-wide uppercase">
                      Veículo
                    </h2>
                  </div>
                  <InfoRow label="Tipo" value={motorista.tipo_veiculo} />
                  <InfoRow label="Carroceria" value={motorista.tipo_carroceria} />
                  <InfoRow label="Placa" value={motorista.placa} />
                  <InfoRow label="Ano" value={motorista.ano_veiculo} />
                  <InfoRow
                    label="Capacidade"
                    value={motorista.capacidade_kg ? `${motorista.capacidade_kg.toLocaleString('pt-BR')} kg` : null}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Edit form */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                  <h2 className="font-display font-bold text-base text-slate-700 tracking-wide uppercase mb-2">
                    Editar Dados
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Nome *</label>
                      <input type="text" className={inputClass} value={editForm.nome ?? ''} onChange={(e) => set('nome', e.target.value)} required />
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-1.5">CPF</label>
                      <input type="text" className={inputClass} value={editForm.cpf ?? ''} onChange={(e) => set('cpf', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-1.5">WhatsApp *</label>
                      <input type="tel" className={inputClass} value={editForm.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-1.5">E-mail</label>
                      <input type="email" className={inputClass} value={editForm.email ?? ''} onChange={(e) => set('email', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Cidade</label>
                      <input type="text" className={inputClass} value={editForm.cidade ?? ''} onChange={(e) => set('cidade', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Estado</label>
                      <select className={inputClass} value={editForm.estado ?? ''} onChange={(e) => set('estado', e.target.value)}>
                        <option value="">Selecione...</option>
                        {ESTADOS_BR.map((uf) => (<option key={uf} value={uf}>{uf}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Categoria CNH</label>
                      <select className={inputClass} value={editForm.categoria_cnh ?? ''} onChange={(e) => set('categoria_cnh', e.target.value)}>
                        <option value="">Selecione...</option>
                        {CATEGORIAS_CNH.map((c) => (<option key={c} value={c}>Categoria {c}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-1.5">RNTRC / ANTT</label>
                      <input type="text" className={inputClass} value={editForm.rntrc ?? ''} onChange={(e) => set('rntrc', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Tipo de veículo *</label>
                      <select className={inputClass} value={editForm.tipo_veiculo ?? ''} onChange={(e) => set('tipo_veiculo', e.target.value)}>
                        <option value="">Selecione...</option>
                        {TIPOS_VEICULO.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Placa</label>
                      <input type="text" className={`${inputClass} uppercase`} value={editForm.placa ?? ''} onChange={(e) => set('placa', e.target.value.toUpperCase())} />
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Carroceria</label>
                      <select className={inputClass} value={editForm.tipo_carroceria ?? ''} onChange={(e) => set('tipo_carroceria', e.target.value)}>
                        <option value="">Selecione...</option>
                        {TIPOS_CARROCERIA.map((t) => (<option key={t} value={t}>{t}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-body font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Capacidade (kg)</label>
                      <input type="number" className={inputClass} value={editForm.capacidade_kg ?? ''} onChange={(e) => set('capacidade_kg', e.target.value)} />
                    </div>
                    <div className="sm:col-span-2 flex gap-6">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-500" checked={editForm.aceita_fracionado ?? false} onChange={(e) => set('aceita_fracionado', e.target.checked)} />
                        <span className="text-sm font-body text-slate-700">Aceita fracionado</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-500" checked={editForm.aceita_refrigerado ?? false} onChange={(e) => set('aceita_refrigerado', e.target.checked)} />
                        <span className="text-sm font-body text-slate-700">Aceita refrigerado</span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
