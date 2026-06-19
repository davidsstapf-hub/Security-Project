export const curriculumMetadata = {
  certification: 'CompTIA Security+',
  examCode: 'SY0-701',
  objectiveSource: 'Official CompTIA Security+ SY0-701 exam objectives PDF',
  objectiveSourceUrl: 'https://www.comptia.org/en-us/certifications/security/',
  objectiveDocumentVersion: '7.0',
  objectiveExamVersion: 'SY0-701 V7',
  objectiveDocumentDate: '2023-01',
  objectiveReviewedAt: '2026-06-18',
  objectiveVersionVerified: false,
  verifiedAt: null,
  verificationNote: 'Official V7 objectives reviewed; publication remains blocked while objective 1.3 and 4.5 coverage gaps are resolved and detailed bullet-level traceability is completed.',
  contentSchemaVersion: 2,
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
