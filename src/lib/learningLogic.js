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
  return getRecommendation(progress).activity
}

export function getRecommendation(progress) {
  const unfinished = allActivities.find((activity) => activity.required && !progress.completedActivityIds.includes(activity.id))
  if (unfinished) return { activity: unfinished, reason: 'continue', review: false }

  const weakResult = Object.entries(progress.results)
    .filter(([, result]) => typeof result.score === 'number' && result.score < 0.8)
    .sort(([, a], [, b]) => a.score - b.score)[0]

  if (!weakResult) return { activity: null, reason: 'complete', review: false }
  const weakActivity = allActivities.find((activity) => activity.id === weakResult[0])
  if (!weakActivity) return { activity: null, reason: 'complete', review: false }
  const reviewActivity = allActivities.find((activity) => activity.moduleId === weakActivity.moduleId && activity.type === 'flashcards')
    ?? allActivities.find((activity) => activity.moduleId === weakActivity.moduleId && activity.type === 'lesson')
    ?? weakActivity
  return { activity: reviewActivity, reason: 'weak-score', review: true, sourceActivityId: weakActivity.id, score: weakResult[1].score }
}

export function getModuleProgress(module, progress) {
  const required = module.activities.filter((activity) => activity.required)
  if (!required.length) return 0
  return Math.round(required.filter((activity) => progress.completedActivityIds.includes(activity.id)).length / required.length * 100)
}

export function moduleNeedsReview(module, progress) {
  return module.activities.some((activity) => {
    const score = progress.results[activity.id]?.score
    return ['quiz','checkpoint','scenario','exam'].includes(activity.type) && typeof score === 'number' && score < 0.8
  })
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
