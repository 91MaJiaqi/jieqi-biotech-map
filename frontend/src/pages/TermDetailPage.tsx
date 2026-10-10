import { useParams } from 'react-router-dom'
import { getTerm } from '../api/client'
import { useAsync } from '../hooks'
import { Breadcrumb, InfoGrid, PageState } from '../components/DetailShell'
import ScienceLinkBlock from '../components/ScienceLinkBlock'
import RelationList from '../components/RelationList'
import { SEASON_BG, SEASON_COLOR } from '../constants'

export default function TermDetailPage() {
  const { id = '' } = useParams()
  const { data, loading, error } = useAsync(() => getTerm(id), [id])

  return (
    <PageState loading={loading} error={error}>
      {data && (
        <article>
          <Breadcrumb current={data.item.name} />
          <header className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">{data.item.name}</h1>
            <span className={`chip ${SEASON_BG[data.item.season]}`}>{data.item.season}季</span>
            <span className="chip bg-gray-100 text-gray-600">{data.item.date}</span>
            <span className="chip text-white" style={{ backgroundColor: SEASON_COLOR[data.item.season] }}>
              黄经 {data.item.huangjing}°
            </span>
          </header>

          <div className="mt-4">
            <InfoGrid
              rows={[
                { label: '公历日期', value: data.item.date },
                { label: '季节', value: `${data.item.season}季` },
                { label: '物候', value: data.item.phenology },
                { label: '气候特征', value: data.item.climate },
              ]}
            />
          </div>

          {data.item.proverb && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="mb-1 text-xs font-semibold text-amber-800">传统经验 · 农谚（证据等级：弱，待核验）</div>
              <p className="text-sm text-amber-900">「{data.item.proverb}」</p>
              <p className="mt-1 text-xs text-amber-700">
                农谚属民间口传经验，本项目统一按弱证据处理，仅作传统经验参考，不作为科学依据。
              </p>
            </div>
          )}

          <div className="mt-4 max-w-4xl">
            <ScienceLinkBlock link={data.item} />
          </div>

          <RelationList relations={data.relations} title="与节气相关的关系与证据" />
        </article>
      )}
    </PageState>
  )
}
