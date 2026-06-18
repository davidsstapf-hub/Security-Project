import { allActivities, domains, tiers } from '../content/studyData.js'

export function requiredActivitiesForTier(tier) {
  return tier.modules.flatMap((module) => module.activities).filter((activity) => activity.required)
}

export function getTierProgress(tier, progress) {
  const required = requiredActivitiesForTier(tier)
  if (!required.length) return 0
  const completed = required.filter((activity) => progress.completedActivityIds.includes(activity.id)).length
  return Math.round((completed / required.length) * 100)
}

export function getNextActivity(progress) {
  return allActivities.find((activity) => activity.required && !progress.completedActivityIds.includes(activity.id)) ?? null
}

export function getDomainCoverage(progress) {
  return domains.map((domain) => {
    const activities = allActivities.filter((activity) => activity.domain === domain.id)
    const completed = activities.filter((activity) => progress.completedActivityIds.includes(activity.id)).length
    return { ...domain, progress: activities.length ? Math.round((completed / activities.length) * 100) : 0 }
  })
}

export function getReadiness(progress) {
  const coverage = getDomainCoverage(progress)
  const weightedCoverage = coverage.reduce((sum, domain) => sum + (domain.progress * domain.weight) / 100, 0)
  const scoredResults = Object.values(progress.results).filter((result) => typeof result.score === 'number')
  const quizAccuracy = scoredResults.length ? scoredResults.reduce((sum, result) => sum + result.score, 0) / scoredResults.length : 0
  return Math.round((weightedCoverage * 0.7) + (quizAccuracy * 100 * 0.3))
}

export function getOverallProgress(progress) {
  const required = tiers.flatMap(requiredActivitiesForTier)
  return required.length ? Math.round((required.filter((activity) => progress.completedActivityIds.includes(activity.id)).length / required.length) * 100) : 0
}
