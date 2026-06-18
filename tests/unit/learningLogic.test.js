import test from 'node:test'
import assert from 'node:assert/strict'
import { allActivities, tiers } from '../../src/content/studyData.js'
import { getModuleProgress, getNextActivity, getOverallProgress, getReadiness, getRecommendation, getTierProgress, moduleNeedsReview, requiredActivitiesForTier } from '../../src/lib/learningLogic.js'
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
  assert.equal(migrated.version, 2)
})

test('version 1 progress maps renamed activities and reopens the expanded checkpoint', () => {
  const migrated = migrateProgress({ version: 1, completedActivityIds: ['t1-auth', 't1-terms', 't1-checkpoint'], results: { 't1-auth': { score: null }, 't1-checkpoint': { score: 1 } } })
  assert.deepEqual(migrated.completedActivityIds, ['t1-identity', 't1-cia-cards'])
  assert.deepEqual(Object.keys(migrated.results), ['t1-identity'])
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

const sectionExpectations = [
  ['t1-identity', 't1-identity-scenario', 't1-identity-cards', 14, 't1-identity-check', 't1-identity-quiz'],
  ['t1-privilege', 't1-privilege-scenario', 't1-privilege-cards', 14, 't1-privilege-check', 't1-privilege-quiz'],
  ['t1-threats', 't1-threats-scenario', 't1-threats-cards', 14, 't1-threats-check', 't1-threats-quiz'],
  ['t1-crypto', 't1-crypto-scenario', 't1-crypto-cards', 15, 't1-crypto-check', 't1-crypto-quiz'],
]

for (const [lessonId, scenarioId, cardsId, cardCount, checkId, quizId] of sectionExpectations) {
  test(`${lessonId} ships as a complete learning loop`, () => {
    const byId = Object.fromEntries(allActivities.map((activity) => [activity.id, activity]))
    assert.equal(byId[lessonId].content.length, 6)
    assert.ok(byId[scenarioId].content.length >= 4)
    assert.equal(byId[cardsId].cards.length, cardCount)
    assert.equal(byId[checkId].questions.length, 5)
    assert.equal(byId[quizId].questions.length, 10)
  })
}

test('Tier 1 checkpoint contains 20 mixed questions', () => {
  const checkpoint = allActivities.find((activity) => activity.id === 't1-checkpoint')
  assert.equal(checkpoint.questions.length, 20)
  assert.ok(new Set(checkpoint.questions.map((question) => question.objective)).size >= 4)
})

test('unfinished work takes priority over weak completed work', () => {
  const progress = { ...createDefaultProgress(), results: { 't1-controls-quiz': { score: 0.4 } } }
  const recommendation = getRecommendation(progress)
  assert.equal(recommendation.activity.id, 't1-controls')
  assert.equal(recommendation.review, false)
})

test('weak quiz results recommend section review after required work is complete', () => {
  const progress = { ...createDefaultProgress(), completedActivityIds: allActivities.filter((activity) => activity.required).map((activity) => activity.id), results: { 't1-identity-quiz': { score: 0.6 } } }
  const recommendation = getRecommendation(progress)
  assert.equal(recommendation.activity.id, 't1-identity-cards')
  assert.equal(recommendation.review, true)
})

test('module progress and review state are calculated independently', () => {
  const module = tiers[0].modules.find((candidate) => candidate.id === 't1-identity-section')
  const progress = { ...createDefaultProgress(), completedActivityIds: module.activities.slice(0, 2).map((activity) => activity.id), results: { 't1-identity-check': { score: 0.6 } } }
  assert.equal(getModuleProgress(module, progress), 40)
  assert.equal(moduleNeedsReview(module, progress), true)
})

test('activity and question identifiers remain unique', () => {
  const activityIds = allActivities.map((activity) => activity.id)
  const questionIds = allActivities.flatMap((activity) => activity.questions?.map((question) => question.id) ?? [])
  assert.equal(new Set(activityIds).size, activityIds.length)
  assert.equal(new Set(questionIds).size, questionIds.length)
})
