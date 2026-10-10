import { defineConfig, devices } from '@playwright/test'

/**
 * 前端冒烟测试。
 *
 * 前置条件：后端已在 http://127.0.0.1:8000 运行（在 backend/ 下执行
 *   uvicorn app.main:app --port 8000）。
 * 本配置会自动启动 vite 开发服务器（http://127.0.0.1:5173），
 * 其 /api 请求通过 vite 代理转发到后端。
 *
 * 浏览器选择（环境变量 PW_CHANNEL）：
 *   - 未设置        → 使用 Playwright 自带 Chromium（首次需 npx playwright install chromium）
 *   - PW_CHANNEL=msedge  → 复用系统已安装的 Microsoft Edge，无需下载
 *   - PW_CHANNEL=chrome  → 复用系统已安装的 Google Chrome
 */
const channel = (process.env.PW_CHANNEL || undefined) as 'msedge' | 'chrome' | undefined

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: channel ?? 'chromium',
      use: { ...devices['Desktop Chrome'], ...(channel ? { channel } : {}) },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
