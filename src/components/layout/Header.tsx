'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Plus, ChevronRight } from 'lucide-react'

const pageConfig: Record<string, {
  title: string
  description: string
  action?: { label: string; href: string }
}> = {
  '/': {
    title: 'Dashboard',
    description: 'Visão geral da operação',
    action: { label: 'Novo Orçamento', href: '/orcamentos/novo' },
  },
  '/orcamentos': {
    title: 'Orçamentos',
    description: 'Gerencie os pedidos de frete',
    action: { label: 'Novo Orçamento', href: '/orcamentos/novo' },
  },
  '/orcamentos/novo': {
    title: 'Novo Orçamento',
    description: 'Cadastre um novo pedido de frete',
  },
  '/motoristas': {
    title: 'Motoristas',
    description: 'Cadastro de motoristas parceiros',
    action: { label: 'Novo Motorista', href: '/motoristas/novo' },
  },
  '/motoristas/novo': {
    title: 'Novo Motorista',
    description: 'Cadastre um novo motorista parceiro',
  },
  '/configuracoes': {
    title: 'Configurações',
    description: 'Ajustes do sistema',
  },
}

function getConfig(pathname: string) {
  if (pageConfig[pathname]) return pageConfig[pathname]
  if (pathname.startsWith('/orcamentos/') && pathname.endsWith('/editar'))
    return { title: 'Editar Orçamento', description: 'Atualize os dados do orçamento' }
  if (pathname.startsWith('/orcamentos/'))
    return { title: 'Detalhe do Orçamento', description: 'Visualize e aprove o orçamento' }
  if (pathname.startsWith('/motoristas/') && pathname.endsWith('/editar'))
    return { title: 'Editar Motorista', description: 'Atualize os dados do motorista' }
  if (pathname.startsWith('/motoristas/'))
    return { title: 'Perfil do Motorista', description: 'Dados completos do motorista' }
  return { title: 'Fretes IA Log', description: '' }
}

export function Header() {
  const pathname = usePathname()
  const config = getConfig(pathname)

  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, i, arr) => ({
      label: segment === 'novo' ? 'Novo' : segment === 'orcamentos' ? 'Orçamentos' : segment === 'motoristas' ? 'Motoristas' : segment,
      href: '/' + arr.slice(0, i + 1).join('/'),
    }))

  return (
    <header className="px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between">
      <div>
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-1 font-body">
            <Link href="/" className="hover:text-orange-500 transition-colors">Início</Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3" />
                {i === breadcrumbs.length - 1 ? (
                  <span className="text-slate-600 font-medium capitalize">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-orange-500 transition-colors capitalize">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
        )}
        <h1 className="font-display font-bold text-2xl text-slate-900 tracking-wide uppercase leading-none">
          {config.title}
        </h1>
        {config.description && (
          <p className="text-sm text-slate-400 font-body mt-0.5">{config.description}</p>
        )}
      </div>

      {config.action && (
        <Link
          href={config.action.href}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-body font-semibold transition-colors shadow-sm shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          {config.action.label}
        </Link>
      )}
    </header>
  )
}
