'use strict'

const parseMastodonInput = input => {
  const cleaned = input.replace(/^@/, '')
  const atIndex = cleaned.indexOf('@')
  if (atIndex === -1) return null

  return {
    username: cleaned.slice(0, atIndex),
    server: cleaned.slice(atIndex + 1)
  }
}

module.exports = ({ got }) => {
  const mastodon = async function ({ input }) {
    const parsed = parseMastodonInput(input)
    if (!parsed) return undefined

    const { username, server } = parsed
    const { body } = await got(
      `https://${server}/api/v1/accounts/lookup?acct=${encodeURIComponent(
        username
      )}`,
      { responseType: 'json' }
    )

    return body?.avatar
  }

  mastodon.parseMastodonInput = parseMastodonInput
  return mastodon
}
