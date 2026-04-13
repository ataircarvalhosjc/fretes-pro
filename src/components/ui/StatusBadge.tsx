import { clsx } from 'clsx'

const statusConfig: Record<string, { label: string; className: string; dotClass: string }> = {
  // Orçamento statuses
  pendente: {
    label: 'Pendente',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  enviado: {
    label: 'Enviado',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  em_negociacao: {
    label: 'Em Negociação',
    className: 'bg-violet-50 text-violet-700 border-violet-200',
    dotClass: 'bg-violet-500',
  },
  concluido: {
    label: 'Concluído',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
  },
  // Motorista statuses
  ativo: {
    label: 'Ativo',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  inativo: {
    label: 'Inativo',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    dotClass: 'bg-slate-400',
  },
  ferias: {
    label: 'Férias',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
    dotClass: 'bg-sky-400',
  },
}

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-gray-50 text-gray-600 border-gray-200',
    dotClass: 'bg-gray-400',
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-body font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className,
        className
      )}
    >
      <span className={clsx('rounded-full shrink-0', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2', config.dotClass)} />
      {config.label}
    </span>
  )
}
