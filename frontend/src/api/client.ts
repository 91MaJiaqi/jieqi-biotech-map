/** 后端 API 客户端与共享类型定义。 */

const BASE = '/api'

export interface ScienceLink {
  url: string
  url_title: string
}

export interface Term extends ScienceLink {
  id: string
  name: string
  huangjing: number
  date: string
  season: string
  phenology: string
  climate: string
  proverb?: string | null
}

export interface Tech extends ScienceLink {
  id: string
  name: string
  category: string
  description: string
  scenarios: string
}

export interface Organism extends ScienceLink {
  id: string
  name: string
  type: string
}

export interface Gene extends ScienceLink {
  id: string
  name: string
  function: string
  organism: string
}

export interface EnvironmentFactor extends ScienceLink {
  id: string
  name: string
  unit: string
  effect: string
}

export interface Region extends ScienceLink {
  id: string
  name: string
  climate_zone: string
  crops: string
}

export type NodeKind = 'term' | 'tech' | 'organism' | 'gene' | 'environment' | 'region'

export interface GraphNode extends ScienceLink {
  id: string
  name: string
  type: NodeKind
  type_label: string
}

export interface GraphLink {
  id: number
  source: string
  target: string
  source_name: string
  target_name: string
  source_type: string
  target_type: string
  type: string
  description: string
  nature: string
  evidence_level: string
  source_ref_type: string
  source_ref: string
  region?: string | null
  season?: string | null
  confidence: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
  stats: {
    node_count: number
    link_count: number
    relation_types: string[]
    filters: { term?: string | null; tech?: string | null; region?: string | null }
  }
  node_types: { type: string; label: string }[]
}

export interface SearchResult extends ScienceLink {
  id: string
  type: NodeKind
  type_label: string
  name: string
  desc: string
}

export interface AdviceResponse {
  query: { region?: string | null; crop?: string | null; term?: string | null }
  region_info: Region | null
  term_info: (Term & { url: string; url_title: string }) | null
  traditional_experience?: string | null
  modern_mechanisms: { title: string; desc: string; evidence_level: string; source_ref: string }[]
  suggestions: GraphLink[]
  risks: GraphLink[]
  technologies: GraphNode[]
  disclaimer: string
}

export interface ClimateTerm extends ScienceLink {
  id: string
  name: string
  season: string
  date: string
  huangjing: number
  shift_days: number
  direction: string
  note: string
}

export interface ClimateResponse {
  delta: number
  unit: string
  model: string
  impacts: string[]
  terms: ClimateTerm[]
  technologies: { id: string; name: string; category: string; description: string; url: string; url_title: string }[]
  disclaimer: string
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const qs = new URLSearchParams()
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
    }
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : ''
  const res = await fetch(`${BASE}${path}${suffix}`)
  if (!res.ok) {
    throw new Error(`请求失败 ${res.status}: ${path}${suffix}`)
  }
  return (await res.json()) as T
}

export const getTerms = () => apiGet<{ count: number; items: Term[] }>('/terms')
export const getTerm = (id: string) => apiGet<{ item: Term; relations: GraphLink[] }>(`/terms/${id}`)
export const getTechs = () => apiGet<{ count: number; items: Tech[] }>('/techs')
export const getTech = (id: string) => apiGet<{ item: Tech; relations: GraphLink[] }>(`/techs/${id}`)
export const getOrganisms = () => apiGet<{ count: number; items: Organism[] }>('/organisms')
export const getOrganism = (id: string) => apiGet<{ item: Organism; relations: GraphLink[] }>(`/organisms/${id}`)
export const getGenes = () => apiGet<{ count: number; items: Gene[] }>('/genes')
export const getGene = (id: string) => apiGet<{ item: Gene; relations: GraphLink[] }>(`/genes/${id}`)
export const getEnvironments = () => apiGet<{ count: number; items: EnvironmentFactor[] }>('/environments')
export const getEnvironment = (id: string) => apiGet<{ item: EnvironmentFactor; relations: GraphLink[] }>(`/environments/${id}`)
export const getRegions = () => apiGet<{ count: number; items: Region[] }>('/regions')
export const getRegion = (id: string) => apiGet<{ item: Region; relations: GraphLink[] }>(`/regions/${id}`)
export const getGraph = (params: { term?: string; tech?: string; region?: string } = {}) =>
  apiGet<GraphData>('/graph', params)
export const getSearch = (q: string) => apiGet<{ query: string; count: number; results: SearchResult[] }>('/search', { q })
export const getAdvice = (params: { region?: string; crop?: string; term?: string }) =>
  apiGet<AdviceResponse>('/advice', params)
export const getClimate = (delta: number) => apiGet<ClimateResponse>('/climate', { delta })
export const getEvidences = () =>
  apiGet<{ count: number; items: { id: string; title: string; source_type: string; citation: string; level: string; note?: string }[] }>('/evidences')
