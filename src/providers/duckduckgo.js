'use strict'

const getAvatarUrl = host => `https://icons.duckduckgo.com/ip3/${host}.ico`

// DuckDuckGo's icon service is keyed by exact hostname and normalizes
// www <-> apex only for popular domains. Smaller sites are indexed under the
// single host their crawler saw (usually the canonical `www.` redirect target),
// so the other variant 404s. Toggle the prefix to recover it.
const toggleWww = host =>
  host.startsWith('www.') ? host.slice(4) : `www.${host}`

module.exports = ({ reachableUrl }) => {
  const isReachable = async url => {
    try {
      const { statusCode } = await reachableUrl(url)
      return reachableUrl.isReachable({ statusCode })
    } catch {
      return false
    }
  }

  return async function duckduckgo (input) {
    const primary = getAvatarUrl(input)
    if (await isReachable(primary)) return primary

    const alternate = getAvatarUrl(toggleWww(input))
    if (alternate !== primary && (await isReachable(alternate))) {
      return alternate
    }

    return primary
  }
}

module.exports.getAvatarUrl = getAvatarUrl
module.exports.toggleWww = toggleWww
