import { Link } from 'react-router-dom'
import { getTerms, getTechs } from '../api/client'
import { useAsync } from '../hooks'
import SeasonDisk from '../components/SeasonDisk'
import SearchBox from '../components/SearchBox'
import { DISCLAIMER, SEASON_BG, SEASON_COLOR } from '../constants'

const SEASONS = ['春', '夏', '秋', '冬']

export default function HomePage() {
  const terms = useAsync(getTerms, [])
  const techs = useAsync(getTechs, [])

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-emerald-900 sm:text-3xl">节气 · 生物技术关系平台</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600">
          以二十四节气为时间轴、以生物技术为工具节点，展示二者在农业领域的
          <strong className="mx-1 text-gray-800">解释、指导、突破、适应、案例</strong>
          五类关系。每条关系都标注来源类型与证据等级，并严格区分
          <strong className="text-gray-800">传统经验</strong>与
          <strong className="text-gray-800">现代科学机制</strong>。
          每个概念卡片与详情页都提供权威科普链接，可点击跳转验证。
        </p>
        <div className="mt-5 max-w-4xl">
          <SearchBox />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="card">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">二十四节气圆盘</h2>
          <p className="mb-3 text-xs text-gray-400">按黄经自「立春 315°」起顺时针排列，点击任一节气查看详情。</p>
          {terms.loading && <p className="text-sm text-gray-400">加载中…</p>}
          {terms.error && <p className="text-sm text-rose-600">{terms.error}</p>}
          {terms.data && <SeasonDisk terms={terms.data.items} />}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-3 text-base font-semibold text-gray-800">按季节浏览</h2>
            <div className="space-y-3">
              {SEASONS.map((s) => {
                const items = terms.data?.items.filter((t) => t.season === s) ?? []
                return (
                  <div key={s}>
                    <span className={`chip ${SEASON_BG[s]}`}>{s}季 · {items.length} 个节气</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {items.map((t) => (
                        <Link
                          key={t.id}
                          to={`/term/${t.id}`}
                          className="rounded-md border px-2 py-0.5 text-xs transition hover:bg-gray-50"
                          style={{ borderColor: SEASON_COLOR[t.season], color: SEASON_COLOR[t.season] }}
                        >
                          {t.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card">
            <h2 className="mb-3 text-base font-semibold text-gray-800">生物技术</h2>
            {techs.loading && <p className="text-sm text-gray-400">加载中…</p>}
            <div className="flex flex-wrap gap-1.5">
              {techs.data?.items.map((t) => (
                <Link
                  key={t.id}
                  to={`/tech/${t.id}`}
                  className="rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs text-violet-700 transition hover:bg-violet-100"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
        ⚠️ {DISCLAIMER}
      </p>
    </div>
  )
}
