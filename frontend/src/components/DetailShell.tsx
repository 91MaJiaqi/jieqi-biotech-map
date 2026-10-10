import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function Breadcrumb({ to = '/', label = '首页', current }: { to?: string; label?: string; current: string }) {
  return (
    <nav className="mb-3 text-xs text-gray-400">
      <Link to={to} className="hover:text-emerald-700 hover:underline">{label}</Link>
      <span className="mx-1">/</span>
      <span className="text-gray-600">{current}</span>
    </nav>
  )
}

export function InfoGrid({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
      {rows.map((r) => (
        <div key={r.label} className="rounded-lg bg-gray-50 p-3">
          <dt className="text-xs text-gray-400">{r.label}</dt>
          <dd className="mt-0.5 text-sm text-gray-700">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function PageState({ loading, error, children }: { loading: boolean; error: string | null; children: ReactNode }) {
  if (loading) return <p className="py-16 text-center text-sm text-gray-400">加载中…</p>
  if (error) return <p className="py-16 text-center text-sm text-rose-600">{error}</p>
  return <>{children}</>
}
