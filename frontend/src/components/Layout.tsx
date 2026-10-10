import { Link, NavLink } from 'react-router-dom'
import { DISCLAIMER } from '../constants'

const NAV = [
  { to: '/', label: '首页' },
  { to: '/graph', label: '关系图谱' },
  { to: '/region', label: '地域差异' },
  { to: '/advice', label: '农事建议' },
  { to: '/climate', label: '气候模拟' },
  { to: '/about', label: '证据说明' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-emerald-800/20 bg-emerald-800 text-white shadow">
        <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>🌾</span>
            <span className="text-base font-semibold tracking-wide">节气·生物技术关系平台</span>
          </Link>
          <nav className="flex flex-wrap gap-1 text-sm" data-testid="main-nav">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 transition ${isActive ? 'bg-white/20 font-medium' : 'hover:bg-white/10'}`
                }
                end={n.to === '/'}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1800px] flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-5 text-xs leading-relaxed text-gray-500 sm:px-6 lg:px-8">
          <p className="mb-1 font-medium text-gray-600">免责声明</p>
          <p>{DISCLAIMER} 所有关系均标注来源类型与证据等级，其中「示例 / 待核验」内容不得用于生产决策。</p>
          <p className="mt-2">数据与科普链接来源：UNESCO、中国非物质文化遗产网、中国气象局、科普中国、中国科学院、农业农村部、中国农业科学院等。</p>
        </div>
      </footer>
    </div>
  )
}
