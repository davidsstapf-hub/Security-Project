import test from 'node:test'
import assert from 'node:assert/strict'
import { allActivities, tiers } from '../../src/content/studyData.js'
import { buildTraceabilityMatrix, curriculumMetadata } from '../../src/content/curriculumMetadata.js'

test('objective verification is an explicit release gate', () => {
  assert.equal(curriculumMetadata.examCode, 'SY0-701')
  assert.equal(typeof curriculumMetadata.objectiveVersionVerified, 'boolean')
  if (curriculumMetadata.objectiveVersionVerified) assert.ok(curriculumMetadata.verifiedAt)
})

test('traceability rows connect objectives to concrete activities', () => {
  const rows = buildTraceabilityMatrix(tiers)
  assert.ok(rows.length >= 20)
  assert.ok(rows.every((row) => row.lessons.length + row.scenarios.length + row.flashcards.length + row.assessments.length > 0))
})

test('every assessment question has valid, unique choices and an explanation', () => {
  for (const activity of allActivities.filter((item) => item.questions)) for (const question of activity.questions) {
    assert.equal(question.options.length, 4, question.id)
    assert.equal(new Set(question.options.map((option) => option.trim().toLowerCase())).size, 4, question.id)
    assert.ok(Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex < 4, question.id)
    assert.ok(question.explanation?.trim().length >= 20, question.id)
    assert.ok(question.prompt?.trim().length >= 20, question.id)
  }
})

test('answer positions are not concentrated in one option', () => {
  const questions = allActivities.flatMap((activity) => activity.questions ?? [])
  const counts = [0,1,2,3].map((position) => questions.filter((question) => question.correctIndex === position).length)
  assert.ok(Math.max(...counts) / Math.min(...counts) < 1.5, JSON.stringify(counts))
})

test('question prompts remain unique within each assessment and ids remain globally unique', () => {
  const questions = allActivities.flatMap((activity) => activity.questions ?? [])
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length)
  for (const activity of allActivities.filter((item) => item.questions)) {
    const normalized = activity.questions.map((question) => question.prompt.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim())
    assert.equal(new Set(normalized).size, normalized.length, activity.id)
  }
})
