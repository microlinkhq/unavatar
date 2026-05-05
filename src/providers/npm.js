'use strict'

const { getAvatarUrl: getGitHubAvatarUrl } = require('./github')
const stringify = require('../util/stringify')

const NPM_REGISTRY_URL = 'https://registry.npmjs.org'
const GITLAB_API_URL = 'https://gitlab.com/api/v4'

const stripAtPrefix = input => input.replace(/^@/, '')

const GITHUB_RE = /github\.com[/:]([^/]+)/
const GITLAB_RE = /gitlab\.com[/:]([^/]+)/

const getRepoUsername = objects => {
  let gitlabFallback

  for (const { package: pkg } of objects) {
    const repo = pkg?.links?.repository
    if (!repo) continue

    const githubMatch = GITHUB_RE.exec(repo)
    if (githubMatch) return { platform: 'github', username: githubMatch[1] }

    if (!gitlabFallback) {
      const gitlabMatch = GITLAB_RE.exec(repo)
      if (gitlabMatch) { gitlabFallback = { platform: 'gitlab', username: gitlabMatch[1] } }
    }
  }

  return gitlabFallback
}

const getGitLabAvatarUrl = async ({ got, username }) => {
  const { body } = await got(
    `${GITLAB_API_URL}/users?username=${encodeURIComponent(username)}`,
    { responseType: 'json' }
  )
  return body?.[0]?.avatar_url
}

module.exports = ({ constants, got }) =>
  async function npm (input) {
    const username = stripAtPrefix(input)
    const url = `${NPM_REGISTRY_URL}/-/v1/search?${stringify({
      text: `maintainer:${username}`,
      size: 5
    })}`

    const { body } = await got(url, { responseType: 'json' })
    const objects = (body?.objects ?? []).filter(
      o => o.package?.publisher?.username === username
    )

    const match = getRepoUsername(objects)
    if (!match) return

    if (match.platform === 'github') {
      return getGitHubAvatarUrl({ constants, input: match.username })
    }

    return getGitLabAvatarUrl({ got, username: match.username })
  }
