import { useParams } from 'react-router-dom'
import { getEnvironment, getGene, getOrganism, type GraphLink, type ScienceLink } from '../api/client'
import { useAsync } from '../hooks'
import { Breadcrumb, InfoGrid, PageState } from '../components/DetailShell'
import ScienceLinkBlock from '../components/ScienceLinkBlock'
import RelationList from '../components/RelationList'

type Kind = 'organism' | 'gene' | 'environment'

interface Loaded {
  item: ScienceLink & Record<string, string>
  relations: GraphLink[]
  title: string
  badge: string
  badgeClass: string
  rows: { label: string; value: string }[]
}

const CONFIG: Record<Kind, {
  label: string
  badgeClass: string
  fetch: (id: string) => Promise<{ item: any; relations: GraphLink[] }>
  toView: (item: any) => Omit<Loaded, 'relations'>
}> = {
  organism: {
    label: '作物/生物',
    badgeClass: 'bg-amber-100 text-amber-800',
    fetch: getOrganism,
    toView: (i) => ({
      item: i, title: i.name, badge: i.type, badgeClass: 'bg-amber-100 text-amber-800',
      rows: [{ label: '类型', value: i.type }],
    }),
  },
  gene: {
    label: '基因',
    badgeClass: 'bg-rose-100 text-rose-700',
    fetch: getGene,
    toView: (i) => ({
      item: i, title: i.name, badge: '基因', badgeClass: 'bg-rose-100 text-rose-700',
      rows: [
        { label: '功能', value: i.function },
        { label: '关联生物', value: i.organism },
      ],
    }),
  },
  environment: {
    label: '环境因子',
    badgeClass: 'bg-cyan-100 text-cyan-800',
    fetch: getEnvironment,
    toView: (i) => ({
      item: i, title: i.name, badge: '环境因子', badgeClass: 'bg-cyan-100 text-cyan-800',
      rows: [
        { label: '单位', value: i.unit },
        { label: '影响', value: i.effect },
      ],
    }),
  },
}

export default function EntityDetailPage({ kind }: { kind: Kind }) {
  const { id = '' } = useParams()
  const cfg = CONFIG[kind]
  const { data, loading, error } = useAsync(() => cfg.fetch(id), [kind, id])

  return (
    <PageState loading={loading} error={error}>
      {data && (() => {
        const view = cfg.toView(data.item)
        return (
          <article>
            <Breadcrumb current={view.title} />
            <header className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">{view.title}</h1>
              <span className={`chip ${view.badgeClass}`}>{view.badge}</span>
            </header>

            <div className="mt-4 max-w-3xl">
              <InfoGrid rows={view.rows} />
            </div>

            <div className="mt-4 max-w-2xl">
              <ScienceLinkBlock link={view.item} />
            </div>

            <RelationList relations={data.relations} title="相关关系与证据" />
          </article>
        )
      })()}
    </PageState>
  )
}
