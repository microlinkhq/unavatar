'use strict'

const memoize = require('@keyvhq/memoize')
const isEmail = require('is-email-like')
const { stringify } = require('querystring')

const GITHUB_API_URL = 'https://api.github.com'
const SEARCH_COMMITS_PER_PAGE = 20

const getUsernameAvatarUrl = ({ constants, input }) =>
  `https://github.com/${input}.png?${stringify({
    size: constants.AVATAR_SIZE
  })}`

const createSearchUsersByEmail = ({ githubSearchCache, got }) =>
  memoize(
    async email =>
      got(
        `${GITHUB_API_URL}/search/users?q=${encodeURIComponent(email)}&per_page=10`,
        {
          responseType: 'json'
        }
      ).then(({ body }) => body?.items ?? []),
    githubSearchCache,
    { key: email => `search-users:${email.trim().toLowerCase()}` }
  )

const createGetUser = ({ githubSearchCache, got }) =>
  memoize(
    async login =>
      got(`${GITHUB_API_URL}/users/${encodeURIComponent(login)}`, {
        responseType: 'json'
      }).then(({ body }) => body),
    githubSearchCache,
    { key: login => `user:${login.trim().toLowerCase()}` }
  )

const createSearchCommitsByEmail = ({ githubSearchCache, got }) =>
  memoize(
    async email =>
      got(
        `${GITHUB_API_URL}/search/commits?q=${encodeURIComponent(
          `author-email:${email}`
        )}&per_page=${SEARCH_COMMITS_PER_PAGE}`,
        {
          headers: { accept: 'application/vnd.github+json' },
          responseType: 'json'
        }
      ).then(({ body }) => body?.items ?? []),
    githubSearchCache,
    { key: email => `search-commits:${email.trim().toLowerCase()}` }
  )

const findExactPublicProfileMatch = async ({ email, getUser, searchUsersByEmail }) => {
  const candidates = await searchUsersByEmail(email)

  for (const candidate of candidates) {
    const user = await getUser(candidate.login)

    if (user?.email?.toLowerCase() === email.toLowerCase()) {
      return user.avatar_url
    }
  }
}

const findCommitConsensusMatch = async ({ email, searchCommitsByEmail }) => {
  const commits = await searchCommitsByEmail(email)
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

module.exports = ({ constants, githubSearchCache, got }) => {
  const searchUsersByEmail = createSearchUsersByEmail({ githubSearchCache, got })
  const getUser = createGetUser({ githubSearchCache, got })
  const searchCommitsByEmail = createSearchCommitsByEmail({
    githubSearchCache,
    got
  })

  return async function github (input) {
    if (!isEmail(input)) {
      return getUsernameAvatarUrl({ constants, input })
    }

    return (
      (await findExactPublicProfileMatch({
        email: input,
        getUser,
        searchUsersByEmail
      })) ||
      findCommitConsensusMatch({ email: input, searchCommitsByEmail })
    )
  }
}

module.exports.getUsernameAvatarUrl = getUsernameAvatarUrl
module.exports.findExactPublicProfileMatch = findExactPublicProfileMatch
module.exports.findCommitConsensusMatch = findCommitConsensusMatch
