import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAdvice, getOrganisms, getRegions, getTerms } from '../api/client'
import { useAsync } from '../hooks'
import EvidenceBadge from '../components/EvidenceBadge'
import ScienceLinkBlock from '../components/ScienceLinkBlock'

export default function AdvicePage() {
  const [params] = useSearchParams()
  const [region, setRegion] = useState(params.get('region') ?? 'north_china')
  const [crop, setCrop] = useState(params.get('crop') ?? 'winter_wheat')
  const [term, setTerm] = useState(params.get('term') ?? 'qiufen')

  useEffect(() => {
    const r = params.get('region')
    if (r) setRegion(r)
  }, [params])

  const regions = useAsync(getRegions, [])
  const organisms = useAsync(getOrganisms, [])
  const terms = useAsync(getTerms, [])
  const advice = useAsync(() => getAdvice({ region, crop, term }), [region, crop, term])

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-gray-800">农事 / 技术建议</h1>
        <p className="mt-1 text-sm text-gray-500">
          选择「地区 + 作物 + 节气」，系统基于关系数据输出建议、风险提示与可用生物技术，
          并将传统经验与现代科学机制分开呈现。
        </p>
      </header>

      <div className="card grid gap-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block text-gray-500">地区</span>
          <select className="input" value={region} onChange={(e) => setRegion(e.target.value)} data-testid="advice-region">
            {regions.data?.items.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-gray-500">作物</span>
          <select className="input" value={crop} onChange={(e) => setCrop(e.target.value)} data-testid="advice-crop">
            {organisms.data?.items.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-gray-500">节气</span>
          <select className="input" value={term} onChange={(e) => setTerm(e.target.value)} data-testid="advice-term">
            {terms.data?.items.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      </div>

      {advice.loading && <p className="py-10 text-center text-sm text-gray-400">生成建议中…</p>}
      {advice.error && <p className="py-10 text-center text-sm text-rose-600">{advice.error}</p>}

      {advice.data && (
        <div className="space-y-5">
          <div className="card">
            <h2 className="mb-2 text-base font-semibold text-gray-800">
              当前查询：{advice.data.query.region ?? '—'} · {advice.data.query.crop ?? '—'} · {advice.data.query.term ?? '—'}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {advice.data.region_info && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-400">地区气候</div>
                  <div className="text-sm text-gray-700">{advice.data.region_info.climate_zone}</div>
                  <div className="mt-1 text-xs text-gray-500">典型作物：{advice.data.region_info.crops}</div>
                </div>
              )}
              {advice.data.term_info && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs text-gray-400">节气物候</div>
                  <div className="text-sm text-gray-700">{advice.data.term_info.phenology}</div>
                  <div className="mt-1 text-xs text-gray-500">{advice.data.term_info.season}季 · {advice.data.term_info.date}</div>
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="mb-1 text-xs font-semibold text-amber-800">传统经验（农谚，弱证据）</div>
                <p className="text-sm text-amber-900">
                  {advice.data.traditional_experience ? `「${advice.data.traditional_experience}」` : '该节气暂无收录农谚。'}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="mb-1 text-xs font-semibold text-emerald-800">现代科学机制（{advice.data.modern_mechanisms.length}）</div>
                {advice.data.modern_mechanisms.length === 0 ? (
                  <p className="text-sm text-emerald-900">暂无现代机制条目。</p>
                ) : (
                  <ul className="space-y-1.5">
                    {advice.data.modern_mechanisms.map((m, i) => (
                      <li key={i} className="text-sm text-emerald-900">
                        <span className="font-medium">{m.title}：</span>{m.desc}
                        <span className="ml-1 text-xs text-emerald-700">（{m.evidence_level}）</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <section className="card">
            <h2 className="mb-3 text-base font-semibold text-gray-800">
              建议（{advice.data.suggestions.length}）
            </h2>
            {advice.data.suggestions.length === 0 ? (
              <p className="text-sm text-gray-400">当前组合暂无匹配建议，可尝试更换节气或作物。</p>
            ) : (
              <ul className="space-y-3" data-testid="advice-suggestions">
                {advice.data.suggestions.map((s) => (
                  <li key={s.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="chip bg-emerald-600 text-white">{s.type}</span>
                      <span className="text-sm font-medium text-gray-800">{s.source_name} → {s.target_name}</span>
                      <EvidenceBadge level={s.evidence_level} />
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">{s.description}</p>
                    <p className="mt-1 text-xs text-gray-400">依据：{s.source_ref}（{s.source_ref_type}）</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <h2 className="mb-3 text-base font-semibold text-gray-800">风险提示（{advice.data.risks.length}）</h2>
            {advice.data.risks.length === 0 ? (
              <p className="text-sm text-gray-400">暂无低证据或适应性风险条目。</p>
            ) : (
              <ul className="space-y-2" data-testid="advice-risks">
                {advice.data.risks.map((r) => (
                  <li key={r.id} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 text-rose-500" aria-hidden>⚠</span>
                    <span>
                      {r.description}
                      <span className="ml-1 text-xs text-gray-400">（证据 {r.evidence_level}，来源类型 {r.source_ref_type}）</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <h2 className="mb-3 text-base font-semibold text-gray-800">可用生物技术（{advice.data.technologies.length}）</h2>
            {advice.data.technologies.length === 0 ? (
              <p className="text-sm text-gray-400">暂无匹配技术。</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {advice.data.technologies.map((t) => (
                  <div key={t.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="text-sm font-medium text-violet-700">{t.name}</div>
                    <p className="mt-0.5 text-xs text-gray-500">{t.type_label}</p>
                    <div className="mt-2">
                      <ScienceLinkBlock link={t} compact />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <p
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800"
            data-testid="advice-disclaimer"
          >
            ⚠️ {advice.data.disclaimer}
          </p>
        </div>
      )}
    </div>
  )
}
