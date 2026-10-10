import { EVIDENCE_COLOR } from '../constants'

export default function EvidenceBadge({ level }: { level: string }) {
  const cls = EVIDENCE_COLOR[level] ?? 'bg-gray-400 text-white'
  return (
    <span className={`chip ${cls}`} title={`证据等级：${level}`} data-testid="evidence-badge">
      证据·{level}
    </span>
  )
}
