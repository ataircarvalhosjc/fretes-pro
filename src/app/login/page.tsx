'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Truck, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [recuperando, setRecuperando] = useState(false)
  const [msgRecuperacao, setMsgRecuperacao] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  async function handleRecuperarSenha() {
    if (!email) {
      setErro('Digite seu e-mail acima para recuperar a senha.')
      return
    }
    setRecuperando(true)
    setErro('')
    setMsgRecuperacao('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setRecuperando(false)
    if (error) {
      setErro('Erro ao enviar e-mail. Tente novamente.')
    } else {
      setMsgRecuperacao('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1424] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
            <Truck className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display font-bold text-white text-2xl tracking-widest uppercase">
            Fretes IA<span className="text-orange-400"> Log</span>
          </h1>
          <p className="text-slate-500 text-sm font-body mt-1">Painel de controle</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a2235] rounded-2xl border border-white/5 p-6 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-5 font-body">Entrar</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-body">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0D1424] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500 transition font-body"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-body">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full bg-[#0D1424] border border-white/10 rounded-xl pl-9 pr-10 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-orange-500 transition font-body"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleRecuperarSenha}
                disabled={recuperando}
                className="text-xs text-orange-400 hover:text-orange-300 transition font-body"
              >
                {recuperando ? 'Enviando...' : 'Esqueci minha senha'}
              </button>
            </div>

            {erro && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 font-body">
                {erro}
              </div>
            )}

            {msgRecuperacao && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm text-green-400 font-body">
                {msgRecuperacao}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm tracking-wide transition-all mt-2 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
