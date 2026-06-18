const STORAGE_KEY = 'secplus-learner-progress'
export const CURRENT_PROGRESS_VERSION = 1

export function createDefaultProgress() {
  return {
    version: CURRENT_PROGRESS_VERSION,
    learnerName: 'David',
    completedOnboarding: false,
    completedActivityIds: [],
    results: {},
    totalStudyMinutes: 0,
    currentActivityId: 't1-controls',
    lastStudiedAt: null,
  }
}

export function migrateProgress(value) {
  if (!value || typeof value !== 'object') return createDefaultProgress()
  const base = createDefaultProgress()
  return {
    ...base,
    ...value,
    version: CURRENT_PROGRESS_VERSION,
    completedActivityIds: Array.isArray(value.completedActivityIds) ? [...new Set(value.completedActivityIds)] : [],
    results: value.results && typeof value.results === 'object' ? value.results : {},
  }
}

export function createProgressRepository(storage = globalThis.localStorage) {
  return {
    load() {
      try {
        const raw = storage?.getItem(STORAGE_KEY)
        return raw ? migrateProgress(JSON.parse(raw)) : createDefaultProgress()
      } catch {
        return createDefaultProgress()
      }
    },
    save(progress) {
      const migrated = migrateProgress(progress)
      storage?.setItem(STORAGE_KEY, JSON.stringify(migrated))
      return migrated
    },
    clear() {
      storage?.removeItem(STORAGE_KEY)
    },
  }
}

export const progressRepository = createProgressRepository()
