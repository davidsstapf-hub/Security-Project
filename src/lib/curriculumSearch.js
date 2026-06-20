function searchableActivity(activity) {
  return [activity.title,activity.summary,activity.objective,activity.type,`domain ${activity.domain}`].filter(Boolean).join(' ').toLowerCase()
}

export function filterCurriculum(tiers,query) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return { tiers:[],resultCount:0 }
  let resultCount = 0
  const filtered = tiers.map((tier) => {
    const tierMatch = [tier.title,tier.subtitle,`tier ${tier.number}`].join(' ').toLowerCase().includes(normalized)
    const modules = tier.modules.map((module) => {
      const moduleMatch = [module.title,module.summary].join(' ').toLowerCase().includes(normalized)
      const activities = module.activities.filter((activity) => tierMatch || moduleMatch || searchableActivity(activity).includes(normalized))
      resultCount += activities.length
      return activities.length ? { ...module,activities } : null
    }).filter(Boolean)
    return modules.length ? { ...tier,modules } : null
  }).filter(Boolean)
  return { tiers:filtered,resultCount }
}

export function currentTierForProgress(tiers,progress,getRecommendation) {
  const recommendation = getRecommendation(progress)
  if (recommendation.activity) return tiers.find((tier) => tier.number === recommendation.activity.tierNumber) ?? tiers[0]
  return tiers[tiers.length - 1]
}
