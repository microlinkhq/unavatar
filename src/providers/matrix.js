'use strict'

const { isValidServer } = require('./mastodon')

const DEFAULT_SERVER = 'matrix.org'
const WELL_KNOWN_PATH = '/.well-known/matrix/client'
const PROFILE_PATH = '/_matrix/client/v3/profile'
const MEDIA_DOWNLOAD_PATH = '/_matrix/media/v3/download'
const MXC_RE = /^mxc:\/\/([a-zA-Z0-9[][\w.:[\]-]*)\/([\w-]+)$/

const parseInput = input => {
  if (typeof input !== 'string') return

  const cleaned = input.startsWith('@') ? input.slice(1) : input
  const separatorIndex = cleaned.indexOf(':')
  const localpart =
    separatorIndex === -1 ? cleaned : cleaned.slice(0, separatorIndex)
  const server =
    separatorIndex === -1 ? DEFAULT_SERVER : cleaned.slice(separatorIndex + 1)

  if (!localpart || localpart.includes('@')) return

  if (!isValidServer(server)) return

  return {
    userId: `@${localpart}:${server}`,
    server,
    hostname: new URL(`https://${server}`).hostname
  }
}

const parseHomeserverUrl = baseUrl => {
  try {
    const url = new URL(baseUrl)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return
    return url.origin + url.pathname.replace(/\/+$/, '')
  } catch {}
}

const getProfileUrl = (homeserverUrl, userId) =>
  `${homeserverUrl}${PROFILE_PATH}/${encodeURIComponent(userId)}/avatar_url`

const getMediaUrl = (homeserverUrl, mxcUrl) => {
  const match = typeof mxcUrl === 'string' && MXC_RE.exec(mxcUrl)
  if (!match) return
  const [, origin, mediaId] = match
  return `${homeserverUrl}${MEDIA_DOWNLOAD_PATH}/${origin}/${mediaId}`
}

module.exports = ({ got, isReservedIp }) => {
  const getHomeserverUrl = async server => {
    const fallback = `https://${server}`
    const body = await got(`${fallback}${WELL_KNOWN_PATH}`, {
      responseType: 'json',
      throwHttpErrors: false
    })
      .then(response => response.body)
      .catch(() => undefined)

    const homeserverUrl = parseHomeserverUrl(body?.['m.homeserver']?.base_url)
    if (!homeserverUrl) return fallback
    if (await isReservedIp(new URL(homeserverUrl).hostname)) return
    return homeserverUrl
  }

  const matrix = async function (input) {
    const parsed = parseInput(input)
    if (!parsed) return

    const { userId, server, hostname } = parsed

    if (await isReservedIp(hostname)) return

    const homeserverUrl = await getHomeserverUrl(server)
    if (!homeserverUrl) return

    const { body, statusCode } = await got(
      getProfileUrl(homeserverUrl, userId),
      { responseType: 'json', throwHttpErrors: false }
    )

    if (statusCode >= 400) return

    return getMediaUrl(homeserverUrl, body?.avatar_url)
  }

  return matrix
}

module.exports.parseInput = parseInput
module.exports.getMediaUrl = getMediaUrl
