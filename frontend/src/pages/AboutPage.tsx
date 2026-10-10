import { getEvidences } from '../api/client'
import { useAsync } from '../hooks'
import { RELATION_COLOR, DISCLAIMER } from '../constants'
import EvidenceBadge from '../components/EvidenceBadge'

const SOURCE_TYPES = [
  ['古籍', '古代农书等文献记载，需核对版本与原文，本项目不引用未经核验的原文。'],
  ['农谚', '民间口传经验，无单一权威出处，统一按「弱」证据处理。'],
  ['论文', '学术研究结论，须给出可核验的出处；本项目对无法核验者标注「待核验」。'],
  ['标准', '国家/行业标准或权威机构的科普定稿内容。'],
  ['专家意见', '领域专家的通行观点，用于机制解释与方向性判断。'],
  ['示例', '项目构造的演示数据，不得用于生产决策。'],
]

const DOMAINS = [
  '科普中国（kepuchina.cn / cloud.kepuchina.cn）',
  '中国科学院及各研究所（cas.cn / cib.cas.cn / ciac.jl.cn）',
  '中国气象局（cma.gov.cn / cco.cma.cn）',
  '中国非物质文化遗产网（ihchina.cn）',
  '农业农村部（moa.gov.cn）',
  '中国农业科学院（caas.cn / cast.caas.cn）',
  'UNESCO 及非遗名录（unesco.org / ich.unesco.org）',
  '人民网科普（kpzg.people.com.cn）、光明网科普（kepu.gmw.cn）、中国科普博览（kepu.net.cn）',
]

export default function AboutPage() {
  const evidences = useAsync(getEvidences, [])

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-gray-800">证据说明与免责声明</h1>
        <p className="mt-1 text-sm text-gray-500">
          本平台刻意区分「传统经验」与「现代科学机制」，并对每条关系标注来源类型与证据等级，
          以便读者判断可信度。
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card border-amber-200 bg-amber-50">
          <h2 className="mb-2 text-base font-semibold text-amber-900">传统经验</h2>
          <p className="text-sm leading-relaxed text-amber-900">
            来源于农谚、古代农书与长期生产实践，是特定地区在长期观察中形成的经验总结。
            它往往有效，但缺乏机制层面的解释，且对地区与品种差异敏感，
            因此统一按较低证据等级处理，仅作参考。
          </p>
        </div>
        <div className="card border-emerald-200 bg-emerald-50">
          <h2 className="mb-2 text-base font-semibold text-emerald-900">现代科学机制</h2>
          <p className="text-sm leading-relaxed text-emerald-900">
            来源于遗传学、生理学、气象学等学科的研究结论，例如春化作用与 VRN 基因、
            光周期、积温与品种区划。它们可被重复验证与量化，证据等级通常较高，
            但仍受品种、地区与环境条件影响。
          </p>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 text-base font-semibold text-gray-800">证据等级规则</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-400">
                <th className="py-2 pr-4">等级</th>
                <th className="py-2 pr-4">含义</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['强', '有权威标准或可直接核验的研究作为依据，机制清晰、结论稳定。'],
                ['中', '有较可靠的来源或专家通行观点，但受地区/品种/年份条件影响。'],
                ['弱', '主要来自民间经验或单一非权威来源，缺乏机制支撑。'],
                ['待验证', '来源不足或为示例数据，尚未核验，禁止用于生产决策。'],
              ].map(([lv, desc]) => (
                <tr key={lv} className="border-b border-gray-100 last:border-0">
                  <td className="py-2 pr-4"><EvidenceBadge level={lv} /></td>
                  <td className="py-2 pr-4 text-gray-600">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 text-base font-semibold text-gray-800">来源类型</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {SOURCE_TYPES.map(([k, v]) => (
            <div key={k} className="rounded-lg bg-gray-50 p-3">
              <dt className="text-sm font-medium text-gray-700">{k}</dt>
              <dd className="mt-0.5 text-xs leading-relaxed text-gray-500">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card">
        <h2 className="mb-3 text-base font-semibold text-gray-800">关系类型</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(RELATION_COLOR).map(([k, v]) => (
            <span key={k} className="chip text-white" style={{ backgroundColor: v }}>{k}</span>
          ))}
        </div>
        <ul className="mt-3 space-y-1 text-xs text-gray-500">
          <li><b>解释</b>：用现代机制解释某一传统经验为何成立。</li>
          <li><b>指导</b>：某节气/环境条件对农事操作的指导意义。</li>
          <li><b>突破</b>：生物技术对传统瓶颈的突破。</li>
          <li><b>适应</b>：针对逆境或气候变化的适应措施。</li>
          <li><b>案例</b>：具体作物或技术的应用示例（含标注为示例的条目）。</li>
        </ul>
      </section>

      <section className="card">
        <h2 className="mb-3 text-base font-semibold text-gray-800">科普链接来源范围</h2>
        <p className="mb-2 text-sm text-gray-600">
          所有科普链接只允许来自以下权威机构域名，程序在导入种子数据时会自动校验：
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
          {DOMAINS.map((d) => <li key={d}>{d}</li>)}
        </ul>
        <p className="mt-2 text-xs text-gray-400">
          部分概念缺少可核验的精确页面时，链接指向该机构的科普栏目首页，并在 docs/04-科普链接来源说明.md 中说明。
        </p>
      </section>

      <section className="card">
        <h2 className="mb-3 text-base font-semibold text-gray-800">已收录证据来源（{evidences.data?.count ?? 0}）</h2>
        {evidences.loading && <p className="text-sm text-gray-400">加载中…</p>}
        <ul className="space-y-2">
          {evidences.data?.items.map((e) => (
            <li key={e.id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{e.title}</span>
                <EvidenceBadge level={e.level} />
                <span className="chip bg-slate-100 text-slate-600">{e.source_type}</span>
              </div>
              {e.note && <p className="mt-1 text-xs text-gray-500">{e.note}</p>}
              <p className="mt-1 break-all text-xs text-gray-400">{e.citation}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-rose-200 bg-rose-50 p-4">
        <h2 className="mb-1 text-base font-semibold text-rose-800">免责声明</h2>
        <p className="text-sm leading-relaxed text-rose-900">
          {DISCLAIMER}
          平台内容用于科普与教学演示，其中标注为「示例 / 待核验」的数据不得作为生产、投资或政策依据。
          平台不采集受版权保护的数据，科普链接均指向原始权威来源。
        </p>
      </section>
    </div>
  )
}
