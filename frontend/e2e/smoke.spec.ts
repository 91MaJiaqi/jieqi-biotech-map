import { expect, test } from '@playwright/test'

test.describe('节气·生物技术关系平台 冒烟测试', () => {
  test('首页：标题、节气圆盘与搜索框可见', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('节气')
    await expect(page.getByTestId('season-disk')).toBeVisible()
    await expect(page.getByTestId('search-box')).toBeVisible()
  })

  test('首页：搜索“小麦”返回知识卡片且卡片含权威科普链接', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('搜索关键词').fill('小麦')
    await page.getByRole('button', { name: '搜索' }).click()
    const results = page.getByTestId('search-results')
    await expect(results).toBeVisible()
    const cards = results.getByTestId('knowledge-card')
    expect(await cards.count()).toBeGreaterThan(0)
    const link = cards.first().getByTestId('science-link').getByRole('link')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noopener/)
  })

  test('节气圆盘可点击进入详情并展示科普链接', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /立春/ }).click()
    await expect(page).toHaveURL(/\/term\/lichun/)
    await expect(page.getByTestId('science-link')).toBeVisible()
    await expect(page.getByText('权威科普')).toBeVisible()
  })

  test('关系图谱可交互（含筛选）', async ({ page }) => {
    await page.goto('/graph')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('关系图谱')
    await expect(page.locator('canvas')).toBeVisible()
    await page.getByTestId('filter-term').selectOption('qiufen')
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('技术详情页展示权威科普链接', async ({ page }) => {
    await page.goto('/tech/gene_editing')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('基因编辑')
    await expect(page.getByTestId('science-link').getByRole('link')).toHaveAttribute('target', '_blank')
  })

  test('作物、基因、环境因子详情页均可访问并含科普链接', async ({ page }) => {
    for (const path of ['/organism/rice', '/gene/vrn1', '/env/temperature']) {
      await page.goto(path)
      await expect(page.getByTestId('science-link')).toBeVisible()
    }
  })

  test('地域页：地图与区域切换', async ({ page }) => {
    await page.goto('/region')
    await expect(page.getByTestId('region-map')).toBeVisible()
    await page.getByTestId('region-tab').first().click()
    await expect(page.getByText('区域对照表')).toBeVisible()
  })

  test('农事建议：切换筛选后输出建议与免责声明', async ({ page }) => {
    await page.goto('/advice')
    await expect(page.getByTestId('advice-suggestions')).toBeVisible()
    await page.getByTestId('advice-term').selectOption('dashu')
    await expect(page.getByTestId('advice-disclaimer')).toContainText('仅供参考')
  })

  test('气候模拟：滑动 +2℃ 后表格出现', async ({ page }) => {
    await page.goto('/climate')
    await page.getByRole('button', { name: '+2 ℃' }).click()
    await expect(page.getByTestId('climate-table')).toBeVisible()
    await expect(page.getByTestId('delta-value')).toHaveText('+2 ℃')
  })

  test('证据说明页包含等级规则与免责声明', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByText('证据等级规则')).toBeVisible()
    await expect(page.getByText('免责声明').first()).toBeVisible()
  })
})
