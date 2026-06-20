import test from 'node:test'
import assert from 'node:assert/strict'
import { tiers } from '../../src/content/studyData.js'
import { filterCurriculum,currentTierForProgress } from '../../src/lib/curriculumSearch.js'
import { createDefaultProgress } from '../../src/lib/progressRepository.js'
import { getRecommendation,requiredActivitiesForTier } from '../../src/lib/learningLogic.js'

test('curriculum search preserves matching tier and module hierarchy', () => {
  const result = filterCurriculum(tiers,'malware')
  assert.ok(result.resultCount > 0)
  assert.ok(result.tiers.every((tier) => tier.modules.every((module) => module.activities.length > 0)))
  assert.ok(result.tiers.flatMap((tier) => tier.modules).flatMap((module) => module.activities).some((activity) => `${activity.title} ${activity.summary}`.toLowerCase().includes('malware')))
})

test('curriculum search supports objective and type labels and empty results', () => {
  assert.ok(filterCurriculum(tiers,'3.4').resultCount > 0)
  assert.ok(filterCurriculum(tiers,'flashcards').resultCount > 0)
  assert.equal(filterCurriculum(tiers,'no-such-security-topic').resultCount,0)
})

test('current tier follows the next unfinished required activity', () => {
  const progress = createDefaultProgress()
  assert.equal(currentTierForProgress(tiers,progress,getRecommendation).number,1)
  progress.completedActivityIds = requiredActivitiesForTier(tiers[0]).map((activity) => activity.id)
  assert.equal(currentTierForProgress(tiers,progress,getRecommendation).number,2)
})
