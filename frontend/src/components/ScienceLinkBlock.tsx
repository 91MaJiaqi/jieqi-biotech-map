import type { ScienceLink } from '../api/client'

/**
 * 权威科普区块：详情页与知识卡片统一渲染。
 * 外链一律 target="_blank" rel="noopener noreferrer"。
 */
export default function ScienceLinkBlock({ link, compact = false }: { link: ScienceLink; compact?: boolean }) {
  return (
    <div
      className={`rounded-lg border border-emerald-200 bg-emerald-50 ${compact ? 'px-3 py-2' : 'p-4'}`}
      data-testid="science-link"
    >
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-emerald-800">
        <span aria-hidden>🔖</span>
        <span>权威科普</span>
      </div>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-sm text-emerald-700 underline decoration-emerald-400 underline-offset-2 hover:text-emerald-900"
      >
        {link.url_title}
      </a>
      <div className="mt-1 break-all text-xs text-emerald-600/80">{link.url}</div>
    </div>
  )
}
