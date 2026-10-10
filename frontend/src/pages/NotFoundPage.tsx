import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl" aria-hidden>🌱</p>
      <h1 className="mt-4 text-xl font-bold text-gray-800">页面不存在</h1>
      <p className="mt-2 text-sm text-gray-500">请检查链接是否正确，或返回首页继续浏览。</p>
      <Link to="/" className="btn-primary mt-5 inline-block">返回首页</Link>
    </div>
  )
}
