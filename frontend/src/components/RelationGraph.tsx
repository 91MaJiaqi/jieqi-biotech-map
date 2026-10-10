import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useNavigate } from 'react-router-dom'
import type { GraphData, NodeKind } from '../api/client'
import { NODE_COLOR, RELATION_COLOR } from '../constants'

export const NODE_PATH: Record<NodeKind, (id: string) => string> = {
  term: (id) => `/term/${id}`,
  tech: (id) => `/tech/${id}`,
  organism: (id) => `/organism/${id}`,
  gene: (id) => `/gene/${id}`,
  environment: (id) => `/env/${id}`,
  region: () => `/region`,
}

export default function RelationGraph({ data, height = 620 }: { data: GraphData; height?: number }) {
  const navigate = useNavigate()

  const option = useMemo(() => {
    const kindOrder: NodeKind[] = ['term', 'tech', 'organism', 'gene', 'environment', 'region']
    const categories = kindOrder.map((k) => ({
      name: data.node_types.find((n) => n.type === k)?.label ?? k,
      itemStyle: { color: NODE_COLOR[k] },
    }))
    const catIndex = (t: string) => Math.max(0, kindOrder.indexOf(t as NodeKind))

    return {
      tooltip: {
        confine: true,
        formatter: (p: any) => {
          if (p.dataType === 'edge') {
            const d = p.data
            return `<b>${d.source_name} → ${d.target_name}</b><br/>关系：${d.value}<br/>属性：${d.nature}<br/>证据：${d.evidence_level}（${d.source_ref_type}）<br/>来源：${d.source_ref}`
          }
          return `<b>${p.data.name}</b><br/>类别：${p.data.type_label}`
        },
      },
      legend: [{ data: categories.map((c) => c.name), bottom: 0, textStyle: { fontSize: 12 }, itemGap: 14 }],
      animationDuration: 600,
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          categories,
          focusNodeAdjacency: true,
          label: { show: true, position: 'right', fontSize: 11, formatter: '{b}' },
          force: { repulsion: 340, edgeLength: [70, 165], gravity: 0.08 },
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: 7,
          lineStyle: { opacity: 0.75, width: 1.4 },
          emphasis: { focus: 'adjacency', lineStyle: { width: 3 } },
          data: data.nodes.map((n) => ({
            id: n.id,
            name: n.name,
            type_label: n.type_label,
            kind: n.type,
            category: catIndex(n.type),
            symbolSize: n.type === 'term' ? 26 : n.type === 'tech' ? 22 : 18,
            itemStyle: { color: NODE_COLOR[n.type] },
          })),
          links: data.links.map((l) => ({
            source: l.source,
            target: l.target,
            value: l.type,
            source_name: l.source_name,
            target_name: l.target_name,
            nature: l.nature,
            evidence_level: l.evidence_level,
            source_ref_type: l.source_ref_type,
            source_ref: l.source_ref,
            lineStyle: { color: RELATION_COLOR[l.type] ?? '#9ca3af' },
          })),
        },
      ],
    }
  }, [data])

  const onEvents = useMemo(
    () => ({
      click: (p: any) => {
        if (p.dataType === 'node' && p.data?.kind) {
          const kind = p.data.kind as NodeKind
          const path = NODE_PATH[kind]?.(p.data.id)
          if (path) navigate(path)
        }
      },
    }),
    [navigate],
  )

  return <ReactECharts option={option} style={{ height }} onEvents={onEvents} notMerge />
}
