'use strict'

const memoize = require('@keyvhq/memoize')
const { stringify } = require('querystring')
const isEmail = require('is-email-like')

const GITHUB_API_URL = 'https://api.github.com'
const SEARCH_USERS_PER_PAGE = 10
const SEARCH_COMMITS_PER_PAGE = 20
const COMMIT_SEARCH_ACCEPT_HEADER = 'application/vnd.github+json'

const normalizeValue = value =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''
const getSearchItems = body => body?.items ?? []
const getUniqueLogins = candidates =>
  [...new Set(candidates.map(({ login }) => login).filter(Boolean))]

const fetchJsonBody = async ({ got, url, options }) => {
  const { body } = await got(url, {
    responseType: 'json',
    ...options
  })

  return body
}

const isResolvableAccount = (user, accountType) =>
  user?.type === accountType &&
  typeof user.login === 'string' &&
  typeof user.avatar_url === 'string'

const isResolvablePerson = user => isResolvableAccount(user, 'User')
const isResolvableOrganization = user =>
  isResolvableAccount(user, 'Organization')

const pickLinkedUser = item => {
  if (isResolvablePerson(item.author)) return item.author
  if (isResolvablePerson(item.committer)) return item.committer
}

const getUsernameAvatarUrl = ({ constants, input }) =>
  `https://github.com/${input}.png?${stringify({
    size: constants.AVATAR_SIZE
  })}`

const createSearchUsersByEmail = ({ got }) =>
  async email => {
    const body = await fetchJsonBody({
      got,
      url: `${GITHUB_API_URL}/search/users?q=${encodeURIComponent(
        email
      )}&per_page=${SEARCH_USERS_PER_PAGE}`
    })
    return getSearchItems(body)
  }

const createGetUser = ({ githubSearchCache, got }) =>
  memoize(
    login =>
      fetchJsonBody({
        got,
        url: `${GITHUB_API_URL}/users/${encodeURIComponent(login)}`
      }),
    githubSearchCache,
    { key: login => `user:${normalizeValue(login)}` }
  )

const createSearchCommitsByEmail = ({ got }) =>
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

    return getSearchItems(body)
  }

const findExactPublicProfileMatches = async ({
  email,
  getUser,
  searchUsersByEmail
}) => {
  // `searchUsersByEmail` returns lightweight candidate accounts (search items),
  // so we use each login to fetch full profiles.
  const candidates = await searchUsersByEmail(email)

  const candidateLogins = getUniqueLogins(candidates)

  // Candidate items don't include the public email field, so we hydrate each
  // login in parallel with /users/:login to validate exact matches.
  const profiles = await Promise.all(
    candidateLogins.map(login => getUser(login))
  )

  let userAvatarUrl
  let organizationAvatarUrl

  for (const profile of profiles) {
    if (normalizeValue(profile?.email) !== email) continue

    // Keep first exact match per account type. Caller prioritizes user avatar
    // and only falls back to organization when no user signal is found.
    if (!userAvatarUrl && isResolvablePerson(profile)) {
      userAvatarUrl = profile.avatar_url
    }

    if (!organizationAvatarUrl && isResolvableOrganization(profile)) {
      organizationAvatarUrl = profile.avatar_url
    }

    if (userAvatarUrl && organizationAvatarUrl) break
  }

  return { userAvatarUrl, organizationAvatarUrl }
}

const findCommitConsensusMatch = async ({ email, searchCommitsByEmail }) => {
  const commits = await searchCommitsByEmail(email)
  if (commits.length === 0) return

  const counts = new Map()

  for (const item of commits) {
    // Commit search can reference org/bot identities; pickLinkedUser enforces
    // that only real user identities are considered in this fallback.
    const linkedUser = pickLinkedUser(item)
    if (!linkedUser) continue

    const entry = counts.get(linkedUser.login) ?? {
      avatarUrl: linkedUser.avatar_url,
      count: 0
    }

    entry.count += 1
    counts.set(linkedUser.login, entry)
  }
  if (counts.size === 0) return

  let winner
  for (const entry of counts.values()) {
    if (!winner || entry.count > winner.count) winner = entry
  }

  // Return the dominant user across matched commits.
  return winner?.avatarUrl
}

module.exports = ({ constants, githubSearchCache, got }) => {
  const searchUsersByEmail = createSearchUsersByEmail({ got })
  const getUser = createGetUser({ githubSearchCache, got })
  const searchCommitsByEmail = createSearchCommitsByEmail({ got })

  return async function github (input) {
    if (!isEmail(input)) return getUsernameAvatarUrl({ constants, input })
    const email = normalizeValue(input)

    // Strategy: exact public user email -> user commit consensus ->
    // exact organization email.
    const { userAvatarUrl, organizationAvatarUrl } =
      await findExactPublicProfileMatches({
        email,
        getUser,
        searchUsersByEmail
      })

    if (userAvatarUrl) return userAvatarUrl

    const userCommitMatch = await findCommitConsensusMatch({
      email,
      searchCommitsByEmail
    })
    if (userCommitMatch) return userCommitMatch

    return organizationAvatarUrl
  }
}

module.exports.getUsernameAvatarUrl = getUsernameAvatarUrl
module.exports.findExactPublicProfileMatches = findExactPublicProfileMatches
module.exports.findCommitConsensusMatch = findCommitConsensusMatch
