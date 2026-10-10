import { useEffect, useState } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/** 简单的数据加载 Hook：避免每个页面重复 loading/error 样板。 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    let alive = true
    setState({ data: null, loading: true, error: null })
    fn()
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null })
      })
      .catch((e: unknown) => {
        if (alive) setState({ data: null, loading: false, error: e instanceof Error ? e.message : '加载失败' })
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
