import type { GraphLink } from '../api/client'
import { RELATION_COLOR } from '../constants'
import EvidenceBadge from './EvidenceBadge'

function RelationRow({ rel }: { rel: GraphLink }) {
  const color = RELATION_COLOR[rel.type] ?? '#6b7280'
  return (
    <li className="rounded-lg border border-gray-200 bg-white p-4" data-testid="relation-row">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="chip text-white" style={{ backgroundColor: color }}>
          {rel.type}
        </span>
        <span className="text-sm font-medium text-gray-800">
          {rel.source_name} <span className="text-gray-400">→</span> {rel.target_name}
        </span>
        <EvidenceBadge level={rel.evidence_level} />
        <span className="chip bg-slate-100 text-slate-600">{rel.nature}</span>
      </div>
      <p className="text-sm leading-relaxed text-gray-600">{rel.description}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
        <span>来源类型：{rel.source_ref_type}</span>
        <span>依据：{rel.source_ref}</span>
        {rel.region && <span>地区：{rel.region}</span>}
        {rel.season && <span>季节：{rel.season}</span>}
        <span>置信度：{rel.confidence.toFixed(2)}</span>
      </div>
    </li>
  )
}

export default function RelationList({
  relations,
  title = '关系与证据',
  empty = '暂无关联记录。',
}: {
  relations: GraphLink[]
  title?: string
  empty?: string
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">
        {title} <span className="text-sm font-normal text-gray-400">（{relations.length}）</span>
      </h2>
      {relations.length === 0 ? (
        <p className="text-sm text-gray-400">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {relations.map((r) => (
            <RelationRow key={r.id} rel={r} />
          ))}
        </ul>
      )}
    </section>
  )
}
