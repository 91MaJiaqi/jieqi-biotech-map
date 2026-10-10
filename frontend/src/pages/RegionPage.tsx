import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getRegion, getRegions } from '../api/client'
import { useAsync } from '../hooks'
import RegionMap from '../components/RegionMap'
import ScienceLinkBlock from '../components/ScienceLinkBlock'
import RelationList from '../components/RelationList'

export default function RegionPage() {
  const regions = useAsync(getRegions, [])
  const [active, setActive] = useState('')
  const activeId = active || regions.data?.items[0]?.id || ''
  const detail = useAsync(() => (activeId ? getRegion(activeId) : Promise.resolve(null)), [activeId])

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-gray-800">地域差异</h1>
        <p className="mt-1 text-sm text-gray-500">
          五个示例区域的气候区与典型作物差异，以及同一节气在不同地区的物候与农事差异。
          地图点位为区域大致中心坐标，仅供示意。
        </p>
      </header>

      {regions.loading && <p className="text-sm text-gray-400">加载中…</p>}
      {regions.error && <p className="text-sm text-rose-600">{regions.error}</p>}

      {regions.data && (
        <>
          <div className="flex flex-wrap gap-2">
            {regions.data.items.map((r) => (
              <button
                key={r.id}
                onClick={() => setActive(r.id)}
                className={`btn ${activeId === r.id ? 'border-emerald-700 bg-emerald-50 font-medium text-emerald-800' : ''}`}
                data-testid="region-tab"
              >
                {r.name}
              </button>
            ))}
          </div>

          <RegionMap regions={regions.data.items} />

          <section className="card overflow-x-auto">
            <h2 className="mb-3 text-base font-semibold text-gray-800">区域对照表</h2>
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-400">
                  <th className="py-2 pr-4">地区</th>
                  <th className="py-2 pr-4">气候区</th>
                  <th className="py-2 pr-4">典型作物</th>
                </tr>
              </thead>
              <tbody>
                {regions.data.items.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 pr-4 font-medium text-gray-700">{r.name}</td>
                    <td className="py-2 pr-4 text-gray-600">{r.climate_zone}</td>
                    <td className="py-2 pr-4 text-gray-600">{r.crops}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {detail.data && (
            <section className="card">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800">{detail.data.item.name}</h2>
                <span className="chip bg-gray-100 text-gray-600">{detail.data.item.climate_zone}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">典型作物：{detail.data.item.crops}</p>
              <div className="mt-3 max-w-4xl">
                <ScienceLinkBlock link={detail.data.item} />
              </div>
              <Link to={`/advice?region=${detail.data.item.id}`} className="btn-primary mt-3 inline-block">
                查看该地区农事建议 →
              </Link>
              <RelationList relations={detail.data.relations} title={`${detail.data.item.name}相关关系`} />
            </section>
          )}
        </>
      )}
    </div>
  )
}
