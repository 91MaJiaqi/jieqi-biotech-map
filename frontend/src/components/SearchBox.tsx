import { useState } from 'react'
import { getSearch, type SearchResult } from '../api/client'
import KnowledgeCard from './KnowledgeCard'

/** 快速搜索：节气 / 技术 / 作物 / 基因 / 环境因子 / 地区。 */
export default function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(term: string) {
    const query = term.trim()
    if (!query) {
      setResults(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getSearch(query)
      setResults(data.results)
    } catch (e) {
      setError(e instanceof Error ? e.message : '检索失败')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-testid="search-box">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void run(q)
        }}
      >
        <input
          className="input"
          placeholder="搜索：冬小麦 / 春化 / 基因编辑 / 华北 / 秋分 …"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => setQ(e.target.value)}
          aria-label="搜索关键词"
        />
        <button className="btn-primary shrink-0" type="submit" disabled={loading}>
          {loading ? '检索中…' : '搜索'}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

      {results !== null && (
        <div className="mt-4">
          <p className="mb-3 text-sm text-gray-500">
            共 {results.length} 条结果{results.length === 0 ? '，换个关键词试试' : ''}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="search-results">
            {results.map((r) => (
              <KnowledgeCard key={`${r.type}-${r.id}`} item={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
