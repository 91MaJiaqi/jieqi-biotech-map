/** 前端共享常量：季节配色、证据等级、关系类型、地区坐标。 */

export const DISCLAIMER = '以上内容仅供参考，不替代当地农技部门指导。'

export const SEASON_COLOR: Record<string, string> = {
  春: '#3f9c5a',
  夏: '#d97706',
  秋: '#b45309',
  冬: '#2563eb',
}

export const SEASON_BG: Record<string, string> = {
  春: 'bg-emerald-100 text-emerald-800',
  夏: 'bg-amber-100 text-amber-800',
  秋: 'bg-orange-100 text-orange-800',
  冬: 'bg-blue-100 text-blue-800',
}

export const EVIDENCE_COLOR: Record<string, string> = {
  强: 'bg-emerald-600 text-white',
  中: 'bg-amber-500 text-white',
  弱: 'bg-gray-400 text-white',
  待验证: 'bg-rose-500 text-white',
}

export const RELATION_COLOR: Record<string, string> = {
  解释: '#2563eb',
  指导: '#16a34a',
  突破: '#9333ea',
  适应: '#d97706',
  案例: '#dc2626',
}

export const NODE_COLOR: Record<string, string> = {
  term: '#059669',
  tech: '#7c3aed',
  organism: '#d97706',
  gene: '#dc2626',
  environment: '#0891b2',
  region: '#4b5563',
}

/** 五个示例区域的大致中心坐标（用于 Leaflet 地图）。 */
export const REGION_COORDS: Record<string, [number, number]> = {
  north_china: [37.5, 115.5],
  south_china: [23.1, 113.3],
  northeast: [45.0, 126.5],
  southwest: [27.5, 104.0],
  northwest: [39.5, 98.5],
}
