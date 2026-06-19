import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('secplus-learner-progress', JSON.stringify({version:3,learnerName:'Beta learner',completedOnboarding:true,completedActivityIds:['t3-platforms'],results:{'t3-platforms-quiz':{score:.9}},scenarioResults:{},examAttempts:[],totalStudyMinutes:15,currentActivityId:'t3-platforms',lastStudiedAt:null})))
  await page.goto('/')
})

test('beta exposes only Tiers 1-2 and labels readiness accurately', async ({ page }) => {
  await expect(page.getByText('Private beta · Tiers 1–2')).toBeVisible()
  await expect(page.getByText(/beta readiness/i)).toBeAttached()
  const menu = page.getByRole('button',{name:/open navigation/i})
  if (await menu.isVisible()) await menu.click()
  await expect(page.getByRole('button',{name:/guided path/i}).locator('.nav__badge')).toHaveText('2')
  await page.getByRole('button',{name:/guided path/i}).click()
  await expect(page.locator('.tier-node')).toHaveCount(2)
  await expect(page.getByText('Secure Architecture')).toHaveCount(0)
})

test('beta search cannot expose hidden curriculum', async ({ page }) => {
  await page.keyboard.press('Control+k')
  await page.locator('.search input').fill('serverless')
  await expect(page.getByText(/no curriculum matches that filter/i)).toBeVisible()
  await page.locator('.search input').fill('malware')
  await expect(page.locator('.search-results')).toBeVisible()
})

test('beta privacy notice is visible and accessible', async ({ page }) => {
  await expect(page.getByText('Private beta privacy')).toBeVisible()
  await expect(page.getByText(/no account, analytics, advertising/i)).toBeVisible()
  const results = await new AxeBuilder({page}).disableRules(['color-contrast']).analyze()
  expect(results.violations.filter((violation) => ['critical','serious'].includes(violation.impact))).toEqual([])
})
