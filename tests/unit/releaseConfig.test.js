import test from 'node:test'
import assert from 'node:assert/strict'
import { visibleTiersForRelease } from '../../src/config/release.js'
import { createProgressRepository } from '../../src/lib/progressRepository.js'

const sample = [1,2,3,4,5,6].map((number) => ({ id:`tier-${number}`, number }))

test('private beta exposes only the configured tier ceiling', () => {
  assert.deepEqual(
    visibleTiersForRelease(sample, { channel:'beta', maxVisibleTier:2 }).map((tier) => tier.number),
    [1,2],
  )
})

test('development release keeps the full curriculum visible', () => {
  assert.deepEqual(
    visibleTiersForRelease(sample, { channel:'development', maxVisibleTier:Number.POSITIVE_INFINITY }),
    sample,
  )
})

test('beta visibility does not discard progress from hidden tiers', () => {
  const state = new Map()
  const storage = { getItem:(key) => state.get(key) ?? null, setItem:(key,value) => state.set(key,value), removeItem:(key) => state.delete(key) }
  const repository = createProgressRepository(storage)
  repository.save({ version:3,learnerName:'Beta learner',completedOnboarding:true,completedActivityIds:['t1-controls','t3-platforms'],results:{'t3-platforms-quiz':{score:.9}},scenarioResults:{},examAttempts:[],totalStudyMinutes:20,currentActivityId:'t3-platforms',lastStudiedAt:null })
  const loaded = repository.load()
  assert.ok(loaded.completedActivityIds.includes('t3-platforms'))
  assert.equal(loaded.results['t3-platforms-quiz'].score, .9)
})
