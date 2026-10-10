import { useState } from 'react'
import { getGraph, getRegions, getTechs, getTerms } from '../api/client'
import { useAsync } from '../hooks'
import RelationGraph from '../components/RelationGraph'
import { RELATION_COLOR } from '../constants'

export default function GraphPage() {
  const [term, setTerm] = useState('')
  const [tech, setTech] = useState('')
  const [region, setRegion] = useState('')

  const terms = useAsync(getTerms, [])
  const techs = useAsync(getTechs, [])
  const regions = useAsync(getRegions, [])
  const graph = useAsync(() => getGraph({ term, tech, region }), [term, tech, region])

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-gray-800">关系图谱</h1>
        <p className="mt-1 text-sm text-gray-500">
          节点包括节气、生物技术、作物/生物、基因、环境因子、地区；边分为解释、指导、突破、适应、案例五类。
          拖拽节点、滚轮缩放，点击节点进入详情。
        </p>
      </header>

      <div className="card grid gap-4 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block text-gray-500">节气</span>
          <select className="input" value={term} onChange={(e) => setTerm(e.target.value)} data-testid="filter-term">
            <option value="">全部节气</option>
            {terms.data?.items.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-gray-500">生物技术</span>
          <select className="input" value={tech} onChange={(e) => setTech(e.target.value)} data-testid="filter-tech">
            <option value="">全部技术</option>
            {techs.data?.items.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-gray-500">地区</span>
          <select className="input" value={region} onChange={(e) => setRegion(e.target.value)} data-testid="filter-region">
            <option value="">全部地区</option>
            {regions.data?.items.map((r) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="card">
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
          <span>节点 {graph.data?.stats.node_count ?? 0} 个</span>
          <span>关系 {graph.data?.stats.link_count ?? 0} 条</span>
          <span className="flex flex-wrap gap-2">
            {Object.entries(RELATION_COLOR).map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-1">
                <i className="inline-block h-2 w-4 rounded" style={{ backgroundColor: v }} />
                {k}
              </span>
            ))}
          </span>
        </div>

        {graph.loading && <p className="py-16 text-center text-sm text-gray-400">图谱加载中…</p>}
        {graph.error && <p className="py-16 text-center text-sm text-rose-600">{graph.error}</p>}
        {graph.data && graph.data.links.length === 0 && (
          <p className="py-16 text-center text-sm text-gray-400">当前筛选条件下没有关系记录，请调整筛选条件。</p>
        )}
        {graph.data && graph.data.links.length > 0 && <RelationGraph data={graph.data} />}
      </div>
    </div>
  )
}
