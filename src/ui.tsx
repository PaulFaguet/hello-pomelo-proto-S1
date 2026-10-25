import type { ButtonHTMLAttributes, ReactNode } from 'react'

// Petits éléments d'interface partagés par les écrans, aux couleurs de la charte.

type Variant = 'primary' | 'secondary'

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles =
    variant === 'primary'
      ? 'bg-brand text-white hover:bg-brand-dark disabled:bg-brand-light'
      : 'bg-cream text-ink hover:bg-line disabled:text-subtle'
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    />
  )
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-sm text-brand">{error}</p>}
    </div>
  )
}

export const inputClass =
  'rounded-lg border border-line bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-brand aria-invalid:border-brand'

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'brand' }) {
  const styles = tone === 'brand' ? 'bg-brand-soft text-brand' : 'bg-cream text-muted'
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${styles}`}>
      {children}
    </span>
  )
}

// Fenêtre de confirmation pour les actions définitives (ex. clôture).
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string
  children: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-3 text-lg font-semibold">{title}</h3>
        <div className="mb-6 text-sm text-muted">{children}</div>
        <div className="flex justify-end gap-3">
          <Button onClick={onCancel}>Annuler</Button>
          <Button variant="primary" onClick={onConfirm} autoFocus>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
