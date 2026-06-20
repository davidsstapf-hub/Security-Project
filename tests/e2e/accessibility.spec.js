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

test('dashboard circuitry stays behind the guided journey', async ({ page }) => {
  const circuit = page.locator('.circuit-field')
  const target = page.locator('.guided-layout')
  await expect(target).toBeVisible()
  const layers = await page.evaluate(() => {
    const circuitStyle=getComputedStyle(document.querySelector('.circuit-field'))
    const targetStyle=getComputedStyle(document.querySelector('.guided-layout'))
    return {circuit:Number(circuitStyle.zIndex),target:Number.isNaN(Number(targetStyle.zIndex))?1:Number(targetStyle.zIndex),circuitOpacity:Number(circuitStyle.opacity)}
  })
  expect(layers.circuit).toBeLessThan(layers.target)
  expect(layers.circuitOpacity).toBeLessThanOrEqual(.35)
  await expect(circuit).toBeAttached()
})

test('Overview gives new learners a clear start card', async ({ page }) => {
  await expect(page.getByRole('heading',{name:/start at zero and follow the trail/i})).toBeVisible()
  await page.getByRole('button',{name:/open next activity/i}).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.activity-title h1')).toContainText(/security controls/i)
})

test('guided path remains usable at each viewport', async ({ page }) => {
  const menu = page.getByRole('button',{name:/open navigation/i})
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('button',{name:/learning path/i}).click()
  await expect(page.getByRole('heading',{name:/see the whole mountain/i})).toBeVisible()
  await expect(page.locator('body')).not.toHaveCSS('overflow-x','scroll')
})

test('global Continue learning opens the next recommended activity', async ({ page }) => {
  await page.locator('.topbar').getByRole('button',{name:/continue learning/i}).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByLabel(/activity location/i)).toContainText(/Activity 1 of 171/i)
  await expect(page.getByLabel(/activity location/i)).toContainText(/Lesson/i)
  await expect(page.locator('.activity-title h1')).toContainText(/security controls/i)
})

test('activity offers Field HQ and advances after completion', async ({ page }) => {
  const menu = page.getByRole('button',{name:/open navigation/i})
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('button',{name:/learning path/i}).click()
  await page.locator('.tier-node').first().click()
  await page.locator('.activity-row').first().click()
  await expect(page.getByRole('button',{name:/field hq home/i})).toBeVisible()
  const firstTitle = await page.locator('.activity-title h1').textContent()
  await page.locator('.activity-complete').click()
  await expect(page.getByText(/saved\. nice work/i)).toBeVisible()
  await expect(page.getByText(/up next:/i)).toBeVisible()
  await expect(page.locator('.activity-title h1')).not.toHaveText(firstTitle)
})

test('sidebar shield returns to Overview home', async ({ page }) => {
  const menu = page.getByRole('button',{name:/open navigation/i})
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('button',{name:/learning path/i}).click()
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('button',{name:/return to overview home/i}).click()
  await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible()
})

test('Tier 6 launches the 80-question practice exam', async ({ page }) => {
  const menu = page.getByRole('button',{name:/open navigation/i})
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('button',{name:/learning path/i}).click()
  await page.locator('.tier-node').last().click()
  await expect(page.getByRole('heading',{name:'Practice Exam',exact:true})).toBeVisible()
  await page.locator('.activity-row').first().click()
  await expect(page.getByRole('heading',{name:/how do you want to train/i})).toBeVisible()
  await page.getByRole('button',{name:/exam mode/i}).click()
  await expect(page.getByText(/Question 1 of 80/i)).toBeVisible()
  await page.locator('.answer').first().click()
  await expect(page.getByRole('button',{name:/show answer/i})).toHaveCount(0)
  await expect(page.locator('.explanation')).toHaveCount(0)
})

test('Tier 6 Practice Mode reveals answers before continuing', async ({ page }) => {
  const menu = page.getByRole('button',{name:/open navigation/i})
  if (await menu.isVisible()) await menu.click()
  await page.getByRole('button',{name:/learning path/i}).click()
  await page.locator('.tier-node').last().click()
  await page.locator('.activity-row').first().click()
  await page.getByRole('button',{name:/practice mode/i}).click()
  await page.locator('.answer').first().click()
  await page.getByRole('button',{name:/show answer/i}).click()
  await expect(page.locator('.explanation')).toBeVisible()
  await expect(page.getByRole('button',{name:/next/i})).toBeEnabled()
})

test('keyboard curriculum filter finds and clears results', async ({ page }) => {
  await page.keyboard.press('Control+K')
  const search=page.getByRole('textbox',{name:/filter guided curriculum/i})
  await expect(search).toBeFocused()
  await search.fill('malware')
  await expect(page.getByText(/activities found across/i)).toBeVisible()
  await expect(page.locator('.search-results')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('heading',{name:/see the whole mountain/i})).toBeVisible()
})

test('curriculum filter provides recoverable empty state', async ({ page }) => {
  await page.keyboard.press('Control+K')
  await page.getByRole('textbox',{name:/filter guided curriculum/i}).fill('no-such-topic-xyz')
  await expect(page.getByRole('heading',{name:/no curriculum matches/i})).toBeVisible()
  await page.getByRole('button',{name:/show full path/i}).click()
  await expect(page.getByRole('heading',{name:/see the whole mountain/i})).toBeVisible()
})

test('activity dialog receives focus and restores it on exit', async ({ page }) => {
  const menu=page.getByRole('button',{name:/open navigation/i});if(await menu.isVisible())await menu.click()
  await page.getByRole('button',{name:/learning path/i}).click()
  await page.locator('.tier-node').first().click()
  const trigger=page.locator('.activity-row').first()
  await trigger.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('button',{name:'Exit',exact:true})).toBeFocused()
  await page.getByRole('button',{name:'Exit',exact:true}).click()
  await expect(trigger).toBeFocused()
})

test('Flash Cards sidebar page launches the cumulative shuffled deck', async ({ page }) => {
  const menu=page.getByRole('button',{name:/open navigation/i});if(await menu.isVisible())await menu.click()
  await page.getByRole('button',{name:'Flash Cards',exact:true}).click()
  await expect(page.getByRole('heading',{name:/shuffle the whole security\+ deck/i})).toBeVisible()
  await expect(page.getByText(/cards from all sections/i)).toBeVisible()
  await page.getByRole('button',{name:/start shuffled deck/i}).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText(/Term 1 of 449/i)).toBeVisible()
  await expect(page.getByText(/448 remaining/i)).toBeVisible()
  await expect(page.getByText(/Space \/ Enter to flip/i)).toBeVisible()
  const card = page.locator('.flashcard')
  await card.focus()
  await page.keyboard.press('Space')
  await expect(card).toHaveAttribute('aria-pressed','true')
  await expect(page.getByText(/Definition shown/i)).toBeVisible()
  await page.getByRole('button',{name:/restart deck/i}).click()
  await expect(page.getByText(/Term 1 of 449/i)).toBeVisible()
  await page.getByRole('button',{name:/shuffle again/i}).click()
  await expect(page.getByText(/Term 1 of 449/i)).toBeVisible()
})

test('value sidebar pages show market and app proof points', async ({ page }) => {
  const menu=page.getByRole('button',{name:/open navigation/i});if(await menu.isVisible())await menu.click()
  await page.getByRole('button',{name:/why the security\+\?/i}).click()
  await expect(page.getByRole('heading',{name:/cybersecurity keeps growing/i})).toBeVisible()
  await expect(page.getByText('$124,910')).toBeVisible()
  await expect(page.getByText(/projected growth/i)).toBeVisible()

  if(await menu.isVisible())await menu.click()
  await page.getByRole('button',{name:/why choose this app\?/i}).click()
  await expect(page.getByRole('heading',{name:/security\+ prep without the maze/i})).toBeVisible()
  await expect(page.getByText(/assessment questions with explanations/i)).toBeVisible()
  await expect(page.getByText(/flashcards in the cumulative deck/i)).toBeVisible()
})
