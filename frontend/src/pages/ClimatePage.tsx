import { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { Link } from 'react-router-dom'
import { getClimate } from '../api/client'
import { useAsync } from '../hooks'
import ScienceLinkBlock from '../components/ScienceLinkBlock'
import { SEASON_COLOR } from '../constants'

const DELTAS = [0, 1, 2, 3, 4]

export default function ClimatePage() {
  const [delta, setDelta] = useState(1)
  const climate = useAsync(() => getClimate(delta), [delta])

  const chartOption = climate.data
    ? {
        grid: { left: 90, right: 40, top: 30, bottom: 40 },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: {
          type: 'value',
          name: '物候偏移（天）',
          nameLocation: 'middle',
          nameGap: 28,
          axisLabel: { formatter: '{value} 天' },
        },
        yAxis: {
          type: 'category',
          data: [...climate.data.terms].reverse().map((t) => t.name),
          axisLabel: { fontSize: 10 },
        },
        series: [
          {
            type: 'bar',
            data: [...climate.data.terms].reverse().map((t) => ({
              value: t.shift_days,
              itemStyle: { color: SEASON_COLOR[t.season] },
            })),
            barMaxWidth: 14,
            label: { show: true, position: 'right', formatter: '{c}', fontSize: 10 },
          },
        ],
      }
    : {}

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-gray-800">气候模拟</h1>
        <p className="mt-1 text-sm text-gray-500">
          拖动升温幅度，查看二十四节气物候的<b>示意</b>偏移与可用的生物技术应对方向。
          该模型为演示用的示意估算，并非气候预报，具体数值待核验。
        </p>
      </header>

      <div className="card">
        <label className="block text-sm">
          <span className="mb-2 block text-gray-500">
            升温幅度：<b className="text-emerald-700" data-testid="delta-value">+{delta} ℃</b>
          </span>
          <input
            type="range"
            min={0}
            max={4}
            step={1}
            value={delta}
            onChange={(e) => setDelta(Number(e.target.value))}
            className="w-full accent-emerald-700"
            data-testid="delta-slider"
          />
          <span className="mt-1 flex justify-between text-xs text-gray-400">
            {DELTAS.map((d) => <span key={d}>+{d}℃</span>)}
          </span>
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {DELTAS.map((d) => (
            <button
              key={d}
              className={`btn ${delta === d ? 'border-emerald-700 bg-emerald-50 font-medium text-emerald-800' : ''}`}
              onClick={() => setDelta(d)}
            >
              +{d} ℃
            </button>
          ))}
        </div>
      </div>

      {climate.loading && <p className="py-10 text-center text-sm text-gray-400">计算中…</p>}
      {climate.error && <p className="py-10 text-center text-sm text-rose-600">{climate.error}</p>}

      {climate.data && (
        <>
          <section className="card">
            <h2 className="mb-2 text-base font-semibold text-gray-800">主要影响（示意）</h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
              {climate.data.impacts.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <p className="mt-2 text-xs text-gray-400">{climate.data.model}</p>
          </section>

          <section className="card">
            <h2 className="mb-3 text-base font-semibold text-gray-800">二十四节气物候偏移（示意）</h2>
            <ReactECharts option={chartOption} style={{ height: 720 }} notMerge />
          </section>

          <section className="card">
            <h2 className="mb-3 text-base font-semibold text-gray-800">节气明细</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm" data-testid="climate-table">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-400">
                    <th className="py-2 pr-4">节气</th>
                    <th className="py-2 pr-4">季节</th>
                    <th className="py-2 pr-4">公历日期</th>
                    <th className="py-2 pr-4">偏移</th>
                    <th className="py-2 pr-4">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {climate.data.terms.map((t) => (
                    <tr key={t.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-4">
                        <Link to={`/term/${t.id}`} className="font-medium hover:text-emerald-700 hover:underline">{t.name}</Link>
                      </td>
                      <td className="py-2 pr-4">
                        <span className="chip text-white" style={{ backgroundColor: SEASON_COLOR[t.season] }}>{t.season}</span>
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{t.date}</td>
                      <td className="py-2 pr-4 text-gray-700">{t.shift_days} 天</td>
                      <td className="py-2 pr-4 text-gray-500">{t.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <h2 className="mb-3 text-base font-semibold text-gray-800">应对生物技术方向</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {climate.data.technologies.map((t) => (
                <div key={t.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="text-sm font-medium text-violet-700">
                    <Link to={`/tech/${t.id}`} className="hover:underline">{t.name}</Link>
                  </div>
                  <span className="chip mt-1 bg-slate-100 text-slate-600">{t.category}</span>
                  <p className="mt-1 text-xs text-gray-500">{t.description}</p>
                  <div className="mt-2"><ScienceLinkBlock link={t} compact /></div>
                </div>
              ))}
            </div>
          </section>

          <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
            ⚠️ {climate.data.disclaimer}
          </p>
        </>
      )}
    </div>
  )
}
