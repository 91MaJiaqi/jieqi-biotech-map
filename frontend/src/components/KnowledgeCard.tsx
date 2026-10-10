import { Link } from 'react-router-dom'
import type { SearchResult } from '../api/client'
import ScienceLinkBlock from './ScienceLinkBlock'

const PATH: Record<string, (id: string) => string> = {
  term: (id) => `/term/${id}`,
  tech: (id) => `/tech/${id}`,
  organism: (id) => `/organism/${id}`,
  gene: (id) => `/gene/${id}`,
  environment: (id) => `/env/${id}`,
  region: () => `/region`,
}

/** 知识卡片：描述 + 证据来源 + 权威科普链接。 */
export default function KnowledgeCard({ item }: { item: SearchResult }) {
  const to = PATH[item.type]?.(item.id)
  return (
    <div className="card flex flex-col gap-3" data-testid="knowledge-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="chip bg-slate-100 text-slate-600">{item.type_label}</span>
          <h3 className="mt-1 text-base font-semibold text-gray-800">
            {to ? (
              <Link to={to} className="hover:text-emerald-700 hover:underline">
                {item.name}
              </Link>
            ) : (
              item.name
            )}
          </h3>
        </div>
        {to && (
          <Link to={to} className="shrink-0 text-xs text-emerald-700 hover:underline">
            查看详情 →
          </Link>
        )}
      </div>
      <p className="text-sm leading-relaxed text-gray-600">{item.desc}</p>
      <ScienceLinkBlock link={item} compact />
    </div>
  )
}
