'use strict'

const memoize = require('@keyvhq/memoize')
const { stringify } = require('querystring')
const isEmail = require('is-email-like')

const GITHUB_API_URL = 'https://api.github.com'
const SEARCH_USERS_PER_PAGE = 10
const SEARCH_COMMITS_PER_PAGE = 20
const COMMIT_SEARCH_ACCEPT_HEADER = 'application/vnd.github+json'

const normalizeCacheKey = value => value.trim().toLowerCase()
const createLookupCacheKey = prefix => value =>
  `${prefix}:${normalizeCacheKey(value)}`

const fetchJsonBody = async ({ got, url, options }) => {
  const { body } = await got(url, {
    responseType: 'json',
    ...options
  })

  return body
}

const isResolvablePerson = user =>
  user?.type === 'User' &&
  typeof user.login === 'string' &&
  typeof user.avatar_url === 'string'

const pickLinkedUser = item => {
  if (isResolvablePerson(item.author)) return item.author
  if (isResolvablePerson(item.committer)) return item.committer
}

const getUsernameAvatarUrl = ({ constants, input }) =>
  `https://github.com/${input}.png?${stringify({
    size: constants.AVATAR_SIZE
  })}`

const createSearchUsersByEmail = ({ githubSearchCache, got }) =>
  memoize(
    async email => {
      const body = await fetchJsonBody({
        got,
        url: `${GITHUB_API_URL}/search/users?q=${encodeURIComponent(
          email
        )}&per_page=${SEARCH_USERS_PER_PAGE}`
      })

      return body?.items ?? []
    },
    githubSearchCache,
    { key: createLookupCacheKey('search-users') }
  )

const createGetUser = ({ githubSearchCache, got }) =>
  memoize(
    login =>
      fetchJsonBody({
        got,
        url: `${GITHUB_API_URL}/users/${encodeURIComponent(login)}`
      }),
    githubSearchCache,
    { key: createLookupCacheKey('user') }
  )

const createSearchCommitsByEmail = ({ githubSearchCache, got }) =>
  memoize(
    async email => {
      const body = await fetchJsonBody({
        got,
        url: `${GITHUB_API_URL}/search/commits?q=${encodeURIComponent(
          `author-email:${email}`
        )}&per_page=${SEARCH_COMMITS_PER_PAGE}`,
        options: {
          headers: { accept: COMMIT_SEARCH_ACCEPT_HEADER }
        }
      })

      return body?.items ?? []
    },
    githubSearchCache,
    { key: createLookupCacheKey('search-commits') }
  )

const findExactPublicProfileMatch = async ({
  email,
  getUser,
  searchUsersByEmail
}) => {
  const candidates = await searchUsersByEmail(email)
  const normalizedEmail = email.toLowerCase()

  for (const candidate of candidates) {
    const user = await getUser(candidate.login)

    if (
      isResolvablePerson(user) &&
      user.email?.toLowerCase() === normalizedEmail
    ) {
      return user.avatar_url
    }
  }
}

const findCommitConsensusMatch = async ({ email, searchCommitsByEmail }) => {
  const commits = await searchCommitsByEmail(email)
  const counts = new Map()

  for (const item of commits) {
    const linkedUser = pickLinkedUser(item)
    if (!linkedUser) continue

    const entry = counts.get(linkedUser.login) ?? {
      avatarUrl: linkedUser.avatar_url,
      count: 0
    }

    entry.count += 1
    counts.set(linkedUser.login, entry)
  }

  let winner
  for (const entry of counts.values()) {
    if (!winner || entry.count > winner.count) winner = entry
  }

  return winner?.avatarUrl
}

module.exports = ({ constants, githubSearchCache, got }) => {
  const searchUsersByEmail = createSearchUsersByEmail({
    githubSearchCache,
    got
  })
  const getUser = createGetUser({ githubSearchCache, got })
  const searchCommitsByEmail = createSearchCommitsByEmail({
    githubSearchCache,
    got
  })

  return async function github (input) {
    if (!isEmail(input)) return getUsernameAvatarUrl({ constants, input })

    const exactMatch = await findExactPublicProfileMatch({
      email: input,
      getUser,
      searchUsersByEmail
    })

    if (exactMatch) return exactMatch

    return findCommitConsensusMatch({ email: input, searchCommitsByEmail })
  }
}

module.exports.getUsernameAvatarUrl = getUsernameAvatarUrl
module.exports.findExactPublicProfileMatch = findExactPublicProfileMatch
module.exports.findCommitConsensusMatch = findCommitConsensusMatch
