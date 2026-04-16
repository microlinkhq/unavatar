'use strict'

const isEmail = require('is-email-like')
const { stringify } = require('querystring')

const GITHUB_API_URL = 'https://api.github.com'
const SEARCH_COMMITS_PER_PAGE = 20

const getUsernameAvatarUrl = ({ constants, input }) =>
  `https://github.com/${input}.png?${stringify({
    size: constants.AVATAR_SIZE
  })}`

const searchUsersByEmail = ({ got, email }) =>
  got(`${GITHUB_API_URL}/search/users?q=${encodeURIComponent(email)}&per_page=10`, {
    responseType: 'json'
  }).then(({ body }) => body?.items ?? [])

const getUser = ({ got, login }) =>
  got(`${GITHUB_API_URL}/users/${encodeURIComponent(login)}`, {
    responseType: 'json'
  }).then(({ body }) => body)

const searchCommitsByEmail = ({ got, email }) =>
  got(
    `${GITHUB_API_URL}/search/commits?q=${encodeURIComponent(
      `author-email:${email}`
    )}&per_page=${SEARCH_COMMITS_PER_PAGE}`,
    {
      headers: { accept: 'application/vnd.github+json' },
      responseType: 'json'
    }
  ).then(({ body }) => body?.items ?? [])

const findExactPublicProfileMatch = async ({ got, email }) => {
  const candidates = await searchUsersByEmail({ got, email })

  for (const candidate of candidates) {
    const user = await getUser({ got, login: candidate.login })

    if (user?.email?.toLowerCase() === email.toLowerCase()) {
      return user.avatar_url
    }
  }
}

const findCommitConsensusMatch = async ({ got, email }) => {
  const commits = await searchCommitsByEmail({ got, email })
  const counts = new Map()

  for (const item of commits) {
    const linkedUser = item.author || item.committer
    if (!linkedUser?.login || !linkedUser?.avatar_url) continue

    const entry = counts.get(linkedUser.login) ?? {
      avatarUrl: linkedUser.avatar_url,
      count: 0
    }

    entry.count += 1
    counts.set(linkedUser.login, entry)
  }

  if (counts.size === 0) return

  const [winner] = [...counts.values()].sort((left, right) => {
    return right.count - left.count
  })

  return winner.avatarUrl
}

module.exports = ({ constants, got }) =>
  async function github (input) {
    if (!isEmail(input)) {
      return getUsernameAvatarUrl({ constants, input })
    }

    return (
      (await findExactPublicProfileMatch({ got, email: input })) ||
      findCommitConsensusMatch({ got, email: input })
    )
  }

module.exports.getUsernameAvatarUrl = getUsernameAvatarUrl
module.exports.findExactPublicProfileMatch = findExactPublicProfileMatch
module.exports.findCommitConsensusMatch = findCommitConsensusMatch
