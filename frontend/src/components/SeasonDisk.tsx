import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Term } from '../api/client'
import { SEASON_COLOR } from '../constants'

interface Props {
  terms: Term[]
  selectedId?: string
  size?: number
}

/**
 * 二十四节气圆盘：按黄经（自 立春 315° 起）顺时针排列，按季节着色，点击进入详情。
 */
export default function SeasonDisk({ terms, selectedId, size = 520 }: Props) {
  const navigate = useNavigate()

  const ordered = useMemo(() => {
    const norm = (hj: number) => (hj - 315 + 360) % 360
    return [...terms].sort((a, b) => norm(a.huangjing) - norm(b.huangjing))
  }, [terms])

  const cx = size / 2
  const cy = size / 2
  const ringR = size * 0.40
  const nodeR = size * 0.036

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-auto w-full max-w-[560px] select-none xl:max-w-[760px]"
      role="img"
      aria-label="二十四节气圆盘"
      data-testid="season-disk"
    >
      <circle cx={cx} cy={cy} r={ringR} fill="none" stroke="#e5e7eb" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={ringR * 0.62} fill="none" stroke="#f3f4f6" strokeWidth={1} />

      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-gray-500" fontSize={size * 0.03}>
        二十四节气
      </text>
      <text x={cx} y={cy + size * 0.032} textAnchor="middle" className="fill-gray-400" fontSize={size * 0.022}>
        点击查看详情
      </text>

      {ordered.map((t, i) => {
        const angle = (i / ordered.length) * Math.PI * 2 - Math.PI / 2
        const x = cx + ringR * Math.cos(angle)
        const y = cy + ringR * Math.sin(angle)
        const lx = cx + (ringR + size * 0.075) * Math.cos(angle)
        const ly = cy + (ringR + size * 0.075) * Math.sin(angle)
        const active = t.id === selectedId
        const color = SEASON_COLOR[t.season] ?? '#4b5563'
        return (
          <g
            key={t.id}
            className="term-node"
            onClick={() => navigate(`/term/${t.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') navigate(`/term/${t.id}`)
            }}
            aria-label={`${t.name}，${t.season}季，${t.date}`}
          >
            <title>{`${t.name}（${t.season}·${t.date}）`}</title>
            <line x1={cx + ringR * 0.62 * Math.cos(angle)} y1={cy + ringR * 0.62 * Math.sin(angle)} x2={x} y2={y} stroke={color} strokeOpacity={0.25} strokeWidth={1} />
            <circle
              className="term-circle"
              cx={x}
              cy={y}
              r={active ? nodeR * 1.25 : nodeR}
              fill={color}
              fillOpacity={active ? 1 : 0.8}
              stroke="#ffffff"
              strokeWidth={active ? 4 : 2}
            />
            <text
              x={lx}
              y={ly + size * 0.008}
              textAnchor="middle"
              fontSize={size * 0.026}
              fill={color}
              fontWeight={active ? 700 : 500}
            >
              {t.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
