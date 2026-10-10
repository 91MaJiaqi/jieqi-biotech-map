# jieqi-biotech-map（节气·生物技术关系平台）

以**二十四节气**为时间轴、以**生物技术**为工具节点，展示二者在农业领域的
**解释 / 指导 / 突破 / 适应 / 案例** 五类关系。用户可按节气、技术、作物、地区、基因、环境因子查询，
查看每条关系来源与**证据等级**，并通过每个概念自带的**权威科普链接**验证真实性。

> ⚠️ 本平台内容用于科普与教学演示。农业建议**仅供参考，不替代当地农技部门指导**；
> 标注为「示例 / 待核验」的数据不得用于生产决策。

---

## 一、快速开始（本地一键运行）

环境要求：Python 3.11+、Node.js 18+。仓库自带种子数据，首次启动自动建表并导入。

### 1. 启动后端（FastAPI + SQLModel + SQLite）

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

- 接口文档：<http://127.0.0.1:8000/docs>
- 健康检查：<http://127.0.0.1:8000/api/health>
- 数据库文件默认生成在仓库根目录 `jieqi.db`（可用 `DATABASE_URL` 覆盖）

### 2. 启动前端（React + Vite + TypeScript）

```bash
cd frontend
npm install
npm run dev
```

打开 <http://127.0.0.1:5173>。Vite 已配置 `/api` 代理到 `http://127.0.0.1:8000`，无需额外配置跨域。

### 3. 生产构建

```bash
cd frontend
npm run build     # 类型检查 + 打包到 dist/
npm run preview   # 本地预览构建产物
```

---

## 二、Docker 一键启动

```bash
docker compose up --build
```

- 前端（Nginx）：<http://localhost:8080>（`/` 静态页面，`/api` 反代到后端，`/docs` 可访问）
- 后端：<http://localhost:8000>（内部 `http://backend:8000`）

> 若本机未安装 Docker，可跳过本节，使用上面的本地运行方式；两种方式行为一致。
> `docker-compose.yml` 中已预留 PostgreSQL 与 Neo4j 服务（默认注释），详见 [docs/05-部署说明.md](docs/05-部署说明.md)。

---

## 三、测试

### 后端（pytest，23 个用例）

```bash
cd backend
python -m pytest -q
```

覆盖：种子数据校验（链接域名、关系端点、证据等级合法性）、全部 API 状态码与字段、
图谱过滤、检索、农事建议（含免责声明与传统/现代分离）、气候模拟、证据接口、`/docs` 可访问。

### 前端（Playwright 冒烟测试，10 个用例）

测试需要后端在 `8000` 端口运行；Playwright 会自动拉起 vite 开发服务器（`127.0.0.1:5173`）。

```bash
# 终端 A
cd backend  && python -m uvicorn app.main:app --port 8000

# 终端 B —— 默认复用系统已安装的 Microsoft Edge（无需下载浏览器，Windows 推荐）
cd frontend && npm run test:e2e

# 终端 B —— 若本机没有 Edge：改用 Playwright 自带 Chromium
cd frontend && npx playwright install chromium && PLAYWRIGHT_BROWSER=chromium npm run test:e2e
```

> 本次实测使用系统 Edge 通道，10 个用例全部通过。默认通道由 `playwright.config.ts` 决定：
> 未设置 `PLAYWRIGHT_BROWSER=chromium` 时使用 `channel: 'msedge'`。

覆盖：首页渲染与节气圆盘、搜索并校验知识卡片外链属性、圆盘点击进入节气详情、
关系图谱交互与筛选、技术/作物/基因/环境因子详情页科普链接、地域地图与区域切换、
农事建议（含免责声明）、气候模拟（+2℃ 表格）、证据说明页。

---

## 四、功能与页面

| 路由 | 功能 |
| --- | --- |
| `/` | 首页：二十四节气圆盘（按黄经 315° 起顺时针排列、季节着色、可点击）+ 简介 + 快速搜索 + 按季节/技术浏览 |
| `/graph` | 关系图谱：ECharts 力导图，6 类节点 × 5 类关系，支持按节气 / 技术 / 地区筛选，点击节点进入详情 |
| `/term/:id` | 节气详情：黄经、公历日期、物候、气候特征、农谚（标注为弱证据的传统经验）+ 权威科普 + 关系证据 |
| `/tech/:id` | 技术详情：分类、描述、适用场景 + 权威科普 + 关系证据 |
| `/organism/:id`、`/gene/:id`、`/env/:id` | 作物 / 基因 / 环境因子详情，均含权威科普区块 |
| `/region` | 地域差异：Leaflet 地图（华北 / 华南 / 东北 / 西南 / 西北）+ 区域对照表 + 区域相关关系 |
| `/advice` | 农事建议：地区 + 作物 + 节气 → 建议 / 风险提示 / 可用生物技术，并区分传统经验与现代机制 |
| `/climate` | 气候模拟：+0~+4℃ 滑块，二十四节气物候偏移（示意）+ 应对技术方向 |
| `/about` | 证据说明：传统经验 vs 现代科学机制、证据等级规则、来源类型、关系类型、科普链接来源范围、免责声明 |

**每个详情页与知识卡片都渲染「权威科普」区块**，外链统一 `target="_blank" rel="noopener noreferrer"`。

---

## 五、API 一览

| 端点 | 说明 |
| --- | --- |
| `GET /api/terms`、`/api/terms/{id}` | 节气列表 / 详情 |
| `GET /api/techs`、`/api/techs/{id}` | 生物技术列表 / 详情 |
| `GET /api/organisms`、`/api/genes`、`/api/environments` | 作物、基因、环境因子 |
| `GET /api/regions`、`/api/regions/{id}` | 地区 |
| `GET /api/graph?term=&tech=&region=` | 关系图谱（节点 + 边） |
| `GET /api/search?q=` | 跨实体检索 |
| `GET /api/advice?region=&crop=&term=` | 农事 / 技术建议 |
| `GET /api/climate?delta=1` | 气候模拟（0~4℃） |
| `GET /api/evidence/{id}`、`/api/evidences` | 证据详情 / 列表 |
| `GET /api/meta`、`/api/health`、`/api/seed-report` | 元信息、健康检查、种子校验报告 |

所有返回实体对象的接口均包含 `url` 与 `url_title` 字段。

---

## 六、目录结构

```
jieqi-biotech-map/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI 入口（lifespan 建表 + 导入种子）
│   │   ├── models.py        # SQLModel 数据模型（Term/Tech/Organism/Gene/Environment/Region/Relation/Evidence）
│   │   ├── database.py      # 引擎与会话（SQLite 默认，可切 PostgreSQL）
│   │   ├── seed.py          # 种子数据加载与服务端校验（链接域名、端点、证据等级）
│   │   ├── logic.py         # 图谱 / 检索 / 建议 / 气候模拟 业务逻辑
│   │   └── routers/         # catalog.py（编目）、knowledge.py（知识）
│   ├── tests/               # pytest 用例
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/client.ts    # API 客户端与类型
│   │   ├── components/      # 圆盘、图谱、地图、知识卡片、科普区块等
│   │   ├── pages/           # 各页面
│   │   └── constants.ts     # 配色、免责声明、区域坐标
│   ├── e2e/smoke.spec.ts    # Playwright 冒烟测试
│   ├── nginx.conf
│   └── Dockerfile
├── data/seed.json           # 种子数据（24 节气 / 12 技术 / 10 作物 / 5 基因 / 5 环境因子 / 26 关系 / 9 证据）
├── docs/                    # 架构、数据、证据、链接来源、部署、限制说明
├── docker-compose.yml
└── README.md
```

---

## 七、文档

- [docs/01-架构说明.md](docs/01-架构说明.md)
- [docs/02-数据说明.md](docs/02-数据说明.md)
- [docs/03-证据规则.md](docs/03-证据规则.md)
- [docs/04-科普链接来源说明.md](docs/04-科普链接来源说明.md)
- [docs/05-部署说明.md](docs/05-部署说明.md)
- [docs/06-已知限制与假设.md](docs/06-已知限制与假设.md)

---

## 八、数据来源与免责

科普链接仅来自：科普中国、中国科学院及各研究所、中国气象局、中国非物质文化遗产网、农业农村部、
中国农业科学院、UNESCO、人民网科普、光明网科普、中国科普博览。程序在导入种子数据时会自动校验域名，
非白名单链接会导致 `/api/seed-report` 报错。

本平台不采集受版权保护的数据；农谚按民间口传内容标注为「弱」证据；无法核验的内容一律标注「示例 / 待核验」。
