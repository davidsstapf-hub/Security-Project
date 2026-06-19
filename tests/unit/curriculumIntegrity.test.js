import test from 'node:test'
import assert from 'node:assert/strict'
import { allActivities, tiers } from '../../src/content/studyData.js'
import { buildTraceabilityMatrix, curriculumMetadata } from '../../src/content/curriculumMetadata.js'

test('objective verification is an explicit release gate', () => {
  assert.equal(curriculumMetadata.examCode, 'SY0-701')
  assert.equal(curriculumMetadata.objectiveDocumentVersion, '7.0')
  assert.equal(curriculumMetadata.objectiveExamVersion, 'SY0-701 V7')
  assert.ok(curriculumMetadata.objectiveReviewedAt)
  assert.equal(typeof curriculumMetadata.objectiveVersionVerified, 'boolean')
  if (curriculumMetadata.objectiveVersionVerified) assert.ok(curriculumMetadata.verifiedAt)
})

test('official objective 1.3 and 4.5 learning loops are present', () => {
  const declared = allActivities.map((activity) => String(activity.objective))
  assert.equal(declared.some((objective) => objective.includes('1.3')), true)
  assert.equal(declared.some((objective) => objective.includes('4.5')), true)
  assert.equal(curriculumMetadata.objectiveVersionVerified, false)
})

for (const [moduleId, objective] of [['t1-change-management-section','1.3'], ['t4-enterprise-capabilities-section','4.5']]) {
  test(`${objective} ships a complete supplemental learning loop`, () => {
    const module = tiers.flatMap((tier) => tier.modules).find((candidate) => candidate.id === moduleId)
    const [lesson, scenario, cards, check, quiz] = module.activities
    assert.equal(lesson.content.length, 6)
    assert.equal(scenario.type, 'scenario')
    assert.equal(scenario.evidence.length, 3)
    assert.equal(cards.cards.length, 14)
    assert.equal(check.questions.length, 5)
    assert.equal(quiz.questions.length, 10)
    assert.ok(module.activities.every((activity) => activity.objective === objective))
  })
}

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

test('Tier 2 scenarios use distinct evidence and decisions', () => {
  const scenarios = tiers.find((tier) => tier.number === 2).modules
    .flatMap((module) => module.activities)
    .filter((activity) => activity.type === 'scenario')
  assert.equal(scenarios.length, 6)
  assert.equal(new Set(scenarios.map((scenario) => scenario.evidence.join('|'))).size, 6)
  assert.equal(new Set(scenarios.map((scenario) => scenario.actions.map((action) => action.label).join('|'))).size, 6)
  for (const scenario of scenarios) {
    assert.equal(scenario.evidence.length, 3, scenario.id)
    assert.equal(scenario.actions.filter((action) => action.correct).length, 3, scenario.id)
    assert.ok(scenario.explanation.length >= 120, scenario.id)
  }
})

test('Tier 2 network assessments use authored application questions', () => {
  const questions = allActivities
    .filter((activity) => activity.id === 't2-network-check' || activity.id === 't2-network-quiz')
    .flatMap((activity) => activity.questions)
  assert.equal(questions.length, 15)
  assert.ok(questions.every((question) => !question.prompt.includes('which term best matches this description')))
  assert.ok(questions.every((question) => question.prompt.length >= 90))
})

test('all Tier 2 section assessments use authored questions', () => {
  const assessments = tiers.find((tier) => tier.number === 2).modules
    .flatMap((module) => module.activities)
    .filter((activity) => activity.id.endsWith('-check') || activity.id.endsWith('-quiz'))
  const questions = assessments.flatMap((activity) => activity.questions)
  assert.equal(assessments.length, 12)
  assert.equal(questions.length, 90)
  assert.ok(questions.every((question) => !question.prompt.includes('which term best matches this description')))
  assert.equal(new Set(questions.map((question) => question.prompt)).size, 90)
})

test('Tier 2 checkpoint is built entirely from authored application questions', () => {
  const checkpoint = allActivities.find((activity) => activity.id === 't2-checkpoint')
  assert.equal(checkpoint.questions.length, 20)
  assert.equal(new Set(checkpoint.questions.map((question) => question.sectionId)).size, 6)
  assert.ok(checkpoint.questions.every((question) => !question.prompt.includes('which term best matches this description')))
})

test('Tier 3 section assessments contain no generated definition-match questions', () => {
  const assessments = tiers.find((tier) => tier.number === 3).modules
    .flatMap((module) => module.activities)
    .filter((activity) => activity.id.endsWith('-check') || activity.id.endsWith('-quiz'))
  const questions = assessments.flatMap((activity) => activity.questions)
  assert.equal(questions.length, 90)
  assert.equal(questions.filter((question) => question.prompt.includes('which term best matches this description')).length, 0)
  assert.equal(new Set(questions.map((question) => question.prompt)).size, 90)
})

test('Tier 3 architecture-model assessments use authored application questions', () => {
  const questions = allActivities
    .filter((activity) => activity.id === 't3-platforms-check' || activity.id === 't3-platforms-quiz')
    .flatMap((activity) => activity.questions)
  assert.equal(questions.length, 15)
  assert.equal(new Set(questions.map((question) => question.prompt)).size, 15)
  assert.ok(questions.every((question) => !question.prompt.includes('which term best matches this description')))
})

test('Tier 3 responsibility and network-design assessments use authored application questions', () => {
  for (const section of ['responsibility', 'network-design']) {
    const questions = allActivities
      .filter((activity) => activity.id === `t3-${section}-check` || activity.id === `t3-${section}-quiz`)
      .flatMap((activity) => activity.questions)
    assert.equal(questions.length, 15, section)
    assert.equal(new Set(questions.map((question) => question.prompt)).size, 15, section)
    assert.ok(questions.every((question) => !question.prompt.includes('which term best matches this description')), section)
  }
})

test('Tier 3 data, applied-crypto, and resilience assessments use authored application questions', () => {
  for (const section of ['data', 'applied-crypto', 'resilience']) {
    const questions = allActivities
      .filter((activity) => activity.id === `t3-${section}-check` || activity.id === `t3-${section}-quiz`)
      .flatMap((activity) => activity.questions)
    assert.equal(questions.length, 15, section)
    assert.equal(new Set(questions.map((question) => question.prompt)).size, 15, section)
    assert.ok(questions.every((question) => !question.prompt.includes('which term best matches this description')), section)
  }
})

test('Tier 3 checkpoint uses authored questions from all six sections', () => {
  const checkpoint = allActivities.find((activity) => activity.id === 't3-checkpoint')
  assert.equal(checkpoint.questions.length, 20)
  assert.equal(new Set(checkpoint.questions.map((question) => question.sectionId)).size, 6)
  assert.ok(checkpoint.questions.every((question) => !question.prompt.includes('which term best matches this description')))
})

test('Tier 3 scenarios use distinct architecture evidence and decisions', () => {
  const scenarios = tiers.find((tier) => tier.number === 3).modules
    .flatMap((module) => module.activities)
    .filter((activity) => activity.type === 'scenario')
  assert.equal(scenarios.length, 7)
  assert.equal(new Set(scenarios.map((scenario) => scenario.evidence.join('|'))).size, 7)
  assert.equal(new Set(scenarios.map((scenario) => scenario.actions.map((action) => action.label).join('|'))).size, 7)
  for (const scenario of scenarios) {
    assert.equal(scenario.evidence.length, 3, scenario.id)
    assert.equal(scenario.actions.filter((action) => action.correct).length, 3, scenario.id)
    assert.ok(scenario.explanation.length >= 180, scenario.id)
  }
})
