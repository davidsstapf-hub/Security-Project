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

test('Tier 6 contains 80 source-grounded multiple-choice questions with weighted domains', () => {
  const exam = allActivities.find((activity) => activity.id === 't6-practice-exam')
  assert.equal(exam.type, 'exam')
  assert.equal(exam.questions.length, 80)
  assert.equal(exam.config.allowModeSelection,true)
  assert.deepEqual(Object.fromEntries([1,2,3,4,5].map((domain) => [domain,exam.questions.filter((question) => question.domain === domain).length])), {1:10,2:18,3:14,4:22,5:16})
  assert.ok(exam.questions.every((question) => question.source?.title && /^https:\/\//.test(question.source.url)))
})

test('Tier 6 distractors are substantive and answer positions remain balanced', () => {
  const exam = allActivities.find((activity) => activity.id === 't6-practice-exam')
  for (const question of exam.questions) {
    assert.equal(question.options.length,4,question.id)
    assert.equal(new Set(question.options.map((option) => option.toLowerCase())).size,4,question.id)
    assert.ok(question.options.every((option) => option.trim().length >= 3),question.id)
    const lengths = question.options.map((option) => option.length).sort((a,b) => a-b)
    assert.ok(lengths[3] <= Math.max(24,lengths[1]*3),`${question.id} has an obvious length outlier`)
  }
  const counts = [0,1,2,3].map((position) => exam.questions.filter((question) => question.correctIndex === position).length)
  assert.ok(Math.max(...counts)-Math.min(...counts) <= 8,JSON.stringify(counts))
})
