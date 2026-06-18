const STORAGE_KEY = 'secplus-learner-progress'
export const CURRENT_PROGRESS_VERSION = 2

const ACTIVITY_ID_ALIASES = {
  't1-auth': 't1-identity',
  't1-terms': 't1-cia-cards',
}

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
  const isLegacy = !value.version || value.version < 2
  const completedActivityIds = Array.isArray(value.completedActivityIds)
    ? value.completedActivityIds
      .filter((id) => !(isLegacy && (id === 't1-check' || id === 't1-checkpoint')))
      .map((id) => ACTIVITY_ID_ALIASES[id] ?? id)
    : []
  const results = value.results && typeof value.results === 'object'
    ? Object.fromEntries(Object.entries(value.results)
      .filter(([id]) => !(isLegacy && (id === 't1-check' || id === 't1-checkpoint')))
      .map(([id, result]) => [ACTIVITY_ID_ALIASES[id] ?? id, result]))
    : {}
  return {
    ...base,
    ...value,
    version: CURRENT_PROGRESS_VERSION,
    completedActivityIds: [...new Set(completedActivityIds)],
    results,
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
