import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import type { Region } from '../api/client'
import { REGION_COORDS } from '../constants'

/** 用 divIcon 代替默认图标，避免打包后图标资源缺失。 */
function pinIcon(color: string, label: string) {
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%)">
      <div style="background:${color};color:#fff;font-size:12px;padding:2px 8px;border-radius:999px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.3)">${label}</div>
      <div style="width:2px;height:10px;background:${color}"></div>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

const COLORS = ['#059669', '#d97706', '#4b5563', '#7c3aed', '#dc2626']

export default function RegionMap({ regions }: { regions: Region[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200" style={{ height: 'clamp(360px, 56vh, 680px)' }} data-testid="region-map">
      <MapContainer
        center={[35.5, 108]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {regions.map((r, i) => {
          const coord = REGION_COORDS[r.id]
          if (!coord) return null
          return (
            <Marker key={r.id} position={coord} icon={pinIcon(COLORS[i % COLORS.length], r.name)}>
              <Popup>
                <div className="max-w-[220px] text-sm">
                  <strong>{r.name}</strong>
                  <p className="my-1 text-gray-600">{r.climate_zone}</p>
                  <p className="text-gray-600">典型作物：{r.crops}</p>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-emerald-700 underline"
                  >
                    {r.url_title}
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
