const STORAGE_KEY = 'secplus-learner-progress'
export const CURRENT_PROGRESS_VERSION = 3
export const PROGRESS_EXPORT_TYPE = 'security-plus-progress'

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
    scenarioResults: {},
    examAttempts: [],
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
    scenarioResults: value.scenarioResults && typeof value.scenarioResults === 'object' ? value.scenarioResults : {},
    examAttempts: Array.isArray(value.examAttempts) ? value.examAttempts : [],
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
    export(progress) {
      return JSON.stringify({ type:PROGRESS_EXPORT_TYPE, exportedAt:new Date().toISOString(), progress:migrateProgress(progress) }, null, 2)
    },
    import(serialized) {
      let envelope
      try { envelope = JSON.parse(serialized) } catch { throw new Error('The selected file is not valid JSON.') }
      if (!envelope || envelope.type !== PROGRESS_EXPORT_TYPE || !envelope.progress || typeof envelope.progress !== 'object') throw new Error('This is not a Security+ learner export.')
      if (serialized.length > 2_000_000) throw new Error('The learner export is too large.')
      const progress = migrateProgress(envelope.progress)
      this.save(progress)
      return progress
    },
  }
}

export const progressRepository = createProgressRepository()
