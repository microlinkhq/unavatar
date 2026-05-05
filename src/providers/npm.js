'use strict'

const { getAvatarUrl: getGitHubAvatarUrl } = require('./github')
const stringify = require('../util/stringify')

const NPM_REGISTRY_URL = 'https://registry.npmjs.org'

const stripAtPrefix = input => input.replace(/^@/, '')

const GITHUB_RE = /github\.com[/:]([^/]+)/

const getGitHubUsername = objects => {
  for (const { package: pkg } of objects) {
    const repo = pkg?.links?.repository
    if (!repo) continue
    const match = GITHUB_RE.exec(repo)
    if (match) return match[1]
  }
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

    const githubUsername = getGitHubUsername(objects)
    if (!githubUsername) return

    return getGitHubAvatarUrl({ constants, input: githubUsername })
  }
