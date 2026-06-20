export const curriculumMetadata = {
  certification: 'CompTIA Security+',
  examCode: 'SY0-701',
  objectiveSource: 'Official CompTIA Security+ SY0-701 exam objectives PDF',
  objectiveSourceUrl: 'https://www.comptia.org/en-us/certifications/security/',
  objectiveDocumentVersion: '7.0',
  objectiveExamVersion: 'SY0-701 V7',
  objectiveDocumentDate: '2023-01',
  objectiveReviewedAt: '2026-06-18',
  objectiveVersionVerified: true,
  verifiedAt: '2026-06-19',
  verificationNote: 'Official SY0-701 V7 document version and all numbered objectives 1.1–5.6 were compared with substantive curriculum activities. Objective 1.3 and 4.5 learning loops were added. Human bullet-by-bullet signoff remains a release acceptance task.',
  contentSchemaVersion: 3,
}

export const officialObjectiveCodes = [
  '1.1','1.2','1.3','1.4',
  '2.1','2.2','2.3','2.4','2.5',
  '3.1','3.2','3.3','3.4',
  '4.1','4.2','4.3','4.4','4.5','4.6','4.7','4.8','4.9',
  '5.1','5.2','5.3','5.4','5.5','5.6',
]

export function objectiveHasCurriculumCoverage(code, tiers) {
  return tiers.flatMap((tier) => tier.modules).flatMap((module) => module.activities)
    .some((activity) => String(activity.objective).split(/[–-]/).some((part) => part.trim() === code) || String(activity.objective).includes(code))
}

export function buildTraceabilityMatrix(tiers) {
  const rows = new Map()
  for (const tier of tiers) for (const module of tier.modules) for (const activity of module.activities) {
    const key = String(activity.objective)
    const row = rows.get(key) ?? { objective:key,domains:new Set(),tiers:new Set(),lessons:[],scenarios:[],flashcards:[],assessments:[] }
    row.domains.add(activity.domain); row.tiers.add(tier.number)
    if (activity.type === 'lesson') row.lessons.push(activity.id)
    else if (activity.type === 'scenario') row.scenarios.push(activity.id)
    else if (activity.type === 'flashcards') row.flashcards.push(activity.id)
    else row.assessments.push(activity.id)
    rows.set(key,row)
  }
  return [...rows.values()].map((row) => ({...row,domains:[...row.domains],tiers:[...row.tiers]})).sort((a,b)=>a.objective.localeCompare(b.objective,undefined,{numeric:true}))
}
