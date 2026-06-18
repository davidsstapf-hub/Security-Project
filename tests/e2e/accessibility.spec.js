import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('secplus-learner-progress', JSON.stringify({version:3,learnerName:'Test learner',completedOnboarding:true,completedActivityIds:[],results:{},scenarioResults:{},examAttempts:[],totalStudyMinutes:0,currentActivityId:'t1-controls',lastStudiedAt:null})))
  await page.goto('/')
})

test('main navigation has no serious accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({page}).disableRules(['color-contrast']).analyze()
  expect(results.violations.filter((violation) => ['critical','serious'].includes(violation.impact))).toEqual([])
})

test('guided path remains usable at each viewport', async ({ page }) => {
  const menu = page.getByRole('button',{name:/open navigation/i})
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('button',{name:/guided path/i}).click()
  await expect(page.getByRole('heading',{name:/see the whole mountain/i})).toBeVisible()
  await expect(page.locator('body')).not.toHaveCSS('overflow-x','scroll')
})

test('activity offers Field HQ and advances after completion', async ({ page }) => {
  const menu = page.getByRole('button',{name:/open navigation/i})
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('button',{name:/guided path/i}).click()
  await page.locator('.tier-node').first().click()
  await page.locator('.activity-row').first().click()
  await expect(page.getByRole('button',{name:/field hq home/i})).toBeVisible()
  const firstTitle = await page.locator('.activity-title h1').textContent()
  await page.locator('.activity-complete').click()
  await expect(page.locator('.activity-title h1')).not.toHaveText(firstTitle)
})

test('sidebar shield returns to Overview home', async ({ page }) => {
  const menu = page.getByRole('button',{name:/open navigation/i})
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('button',{name:/guided path/i}).click()
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('button',{name:/return to overview home/i}).click()
  await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible()
})
