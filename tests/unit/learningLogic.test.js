import test from 'node:test'
import assert from 'node:assert/strict'
import { allActivities, tiers } from '../../src/content/studyData.js'
import { getNextActivity, getOverallProgress, getReadiness, getTierProgress, requiredActivitiesForTier } from '../../src/lib/learningLogic.js'
import { createDefaultProgress, createProgressRepository, migrateProgress } from '../../src/lib/progressRepository.js'

test('a new learner starts at the first Tier 1 lesson', () => {
  const progress = createDefaultProgress()
  assert.equal(getNextActivity(progress).id, 't1-controls')
  assert.equal(getTierProgress(tiers[0], progress), 0)
})

test('tier progress is based only on required activities', () => {
  const required = requiredActivitiesForTier(tiers[0])
  const progress = { ...createDefaultProgress(), completedActivityIds: required.slice(0, 2).map((activity) => activity.id) }
  assert.equal(getTierProgress(tiers[0], progress), Math.round(2 / required.length * 100))
})

test('the recommendation advances to the next unfinished activity', () => {
  const progress = { ...createDefaultProgress(), completedActivityIds: ['t1-controls', 't1-controls-scenario'] }
  assert.equal(getNextActivity(progress).id, 't1-controls-cards')
})

test('readiness remains separate from overall activity completion', () => {
  const progress = { ...createDefaultProgress(), completedActivityIds: ['t1-controls'], results: { 't1-controls': { score: 1 } } }
  assert.ok(getReadiness(progress) > 0)
  assert.ok(getOverallProgress(progress) > 0)
  assert.notEqual(getReadiness(progress), getOverallProgress(progress))
})

test('migration repairs malformed progress and deduplicates activities', () => {
  const migrated = migrateProgress({ version: 0, completedActivityIds: ['t1-controls', 't1-controls'], results: null })
  assert.deepEqual(migrated.completedActivityIds, ['t1-controls'])
  assert.deepEqual(migrated.results, {})
  assert.equal(migrated.version, 1)
})

test('repository saves and reloads a versioned local profile', () => {
  const memory = new Map()
  const storage = { getItem: (key) => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: (key) => memory.delete(key) }
  const repository = createProgressRepository(storage)
  repository.save({ ...createDefaultProgress(), completedOnboarding: true, totalStudyMinutes: 7 })
  const loaded = repository.load()
  assert.equal(loaded.completedOnboarding, true)
  assert.equal(loaded.totalStudyMinutes, 7)
})

test('Security Controls ships as a complete learning loop', () => {
  const byId = Object.fromEntries(allActivities.map((activity) => [activity.id, activity]))
  assert.equal(byId['t1-controls'].content.length, 6)
  assert.equal(byId['t1-controls-scenario'].content.length, 8)
  assert.equal(byId['t1-controls-scenario'].media.src, '/images/mfa-clinic-security.png')
  assert.equal(byId['t1-controls-cards'].cards.length, 14)
  assert.equal(byId['t1-controls-check'].questions.length, 5)
  assert.equal(byId['t1-controls-quiz'].questions.length, 10)
})

test('CIA Triad ships as a complete learning loop', () => {
  const byId = Object.fromEntries(allActivities.map((activity) => [activity.id, activity]))
  assert.equal(byId['t1-cia'].content.length, 6)
  assert.equal(byId['t1-cia-cards'].cards.length, 14)
  assert.equal(byId['t1-cia-check'].questions.length, 5)
  assert.equal(byId['t1-cia-quiz'].questions.length, 10)
})

test('activity and question identifiers remain unique', () => {
  const activityIds = allActivities.map((activity) => activity.id)
  const questionIds = allActivities.flatMap((activity) => activity.questions?.map((question) => question.id) ?? [])
  assert.equal(new Set(activityIds).size, activityIds.length)
  assert.equal(new Set(questionIds).size, questionIds.length)
})
