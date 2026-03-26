'use strict'

const isValidServer = server => {
  try {
    const url = new URL(`https://${server}`)
    return (
      Boolean(url.hostname) &&
      url.username === '' &&
      url.password === '' &&
      url.pathname === '/' &&
      url.search === '' &&
      url.hash === '' &&
      url.host.toLowerCase() === server.toLowerCase()
    )
  } catch {
    return false
  }
}

const parseMastodonInput = input => {
  if (typeof input !== 'string') return null

  const cleaned = input.startsWith('@') ? input.slice(1) : input
  const parts = cleaned.split('@')
  if (parts.length !== 2) return null

  const [username, server] = parts
  if (!username || !server) return null
  if (!isValidServer(server)) return null

  return {
    username,
    server
  }
}

module.exports = ({ got, isReservedIp }) => {
  const mastodon = async function ({ input }) {
    const parsed = parseMastodonInput(input)
    if (!parsed) return undefined

    const { username, server } = parsed

    if (await isReservedIp(server)) return undefined

    const { body } = await got(
      `https://${server}/api/v1/accounts/lookup?acct=${encodeURIComponent(
        username
      )}`,
      { responseType: 'json' }
    )

    return body?.avatar
  }

  return mastodon
}

module.exports.parseMastodonInput = parseMastodonInput
