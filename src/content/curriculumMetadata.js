export const curriculumMetadata = {
  certification: 'CompTIA Security+',
  examCode: 'SY0-701',
  objectiveSource: 'Official CompTIA Security+ SY0-701 exam objectives PDF',
  objectiveSourceUrl: 'https://www.comptia.org/en-us/certifications/security/',
  objectiveVersionVerified: false,
  verifiedAt: null,
  verificationNote: 'Publication is blocked until the official objectives PDF is reviewed and its version/date recorded.',
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
