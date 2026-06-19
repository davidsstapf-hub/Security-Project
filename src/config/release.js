const env = import.meta.env ?? {}

const requestedMaxTier = Number.parseInt(env.VITE_MAX_VISIBLE_TIER ?? '', 10)

export const releaseConfig = {
  channel: env.VITE_RELEASE_CHANNEL === 'beta' ? 'beta' : 'development',
  maxVisibleTier: Number.isInteger(requestedMaxTier) ? requestedMaxTier : Number.POSITIVE_INFINITY,
}

export function visibleTiersForRelease(tiers, config = releaseConfig) {
  return tiers.filter((tier) => tier.number <= config.maxVisibleTier)
}

export const isPrivateBeta = releaseConfig.channel === 'beta'
