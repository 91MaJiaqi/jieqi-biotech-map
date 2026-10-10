import { useParams } from 'react-router-dom'
import { getTech } from '../api/client'
import { useAsync } from '../hooks'
import { Breadcrumb, InfoGrid, PageState } from '../components/DetailShell'
import ScienceLinkBlock from '../components/ScienceLinkBlock'
import RelationList from '../components/RelationList'

export default function TechDetailPage() {
  const { id = '' } = useParams()
  const { data, loading, error } = useAsync(() => getTech(id), [id])

  return (
    <PageState loading={loading} error={error}>
      {data && (
        <article>
          <Breadcrumb current={data.item.name} />
          <header className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">{data.item.name}</h1>
            <span className="chip bg-violet-100 text-violet-700">{data.item.category}</span>
          </header>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600">{data.item.description}</p>

          <div className="mt-4 max-w-3xl">
            <InfoGrid
              rows={[
                { label: '技术分类', value: data.item.category },
                { label: '适用场景', value: data.item.scenarios },
              ]}
            />
          </div>

          <div className="mt-4 max-w-2xl">
            <ScienceLinkBlock link={data.item} />
          </div>

          <RelationList relations={data.relations} title="与该技术相关的关系与证据" />
        </article>
      )}
    </PageState>
  )
}
