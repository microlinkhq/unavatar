'use strict'

const test = require('ava')
const Keyv = require('@keyvhq/core')

const { AVATAR_SIZE } = require('../../../src/constant')

const createGithub = got =>
  require('../../../src/providers/github')({
    constants: { AVATAR_SIZE },
    githubSearchCache: new Keyv({
      namespace: 'github-search-test',
      store: new Map()
    }),
    got
  })

test('github resolves exact public profile email match', async t => {
  const github = createGithub(async (url, opts) => {
    t.is(opts.responseType, 'json')

    if (url.includes('/search/users?')) {
      return {
        body: {
          items: [{ login: 'Kikobeats' }]
        }
      }
    }

    if (url.endsWith('/users/Kikobeats')) {
      return {
        body: {
          login: 'Kikobeats',
          type: 'User',
          email: 'josefrancisco.verdu@gmail.com',
          avatar_url: 'https://avatars.githubusercontent.com/u/2096101?v=4'
        }
      }
    }

    throw new Error(`Unexpected URL: ${url}`)
  })

  const result = await github('josefrancisco.verdu@gmail.com')

  t.is(result, 'https://avatars.githubusercontent.com/u/2096101?v=4')
})

test('github falls back to commit search for email input', async t => {
  const github = createGithub(async (url, opts) => {
    t.is(opts.responseType, 'json')

    if (url.includes('/search/users?')) {
      return { body: { items: [] } }
    }

    if (url.includes('/search/commits?')) {
      t.is(opts.headers.accept, 'application/vnd.github+json')

      return {
        body: {
          items: [
            {
              author: {
                login: 'Kikobeats',
                type: 'User',
                avatar_url: 'https://avatars.githubusercontent.com/u/2096101?v=4'
              }
            },
            {
              author: {
                login: 'Kikobeats',
                type: 'User',
                avatar_url: 'https://avatars.githubusercontent.com/u/2096101?v=4'
              }
            },
            {
              author: {
                login: 'someone-else',
                type: 'User',
                avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4'
              }
            }
          ]
        }
      }
    }

    throw new Error(`Unexpected URL: ${url}`)
  })

  const result = await github('josefrancisco.verdu@gmail.com')

  t.is(result, 'https://avatars.githubusercontent.com/u/2096101?v=4')
})

test('github returns undefined when email cannot be resolved', async t => {
  const github = createGithub(async (url, opts) => {
    t.is(opts.responseType, 'json')

    if (url.includes('/search/users?')) {
      return { body: { items: [] } }
    }

    if (url.includes('/search/commits?')) {
      return { body: { items: [] } }
    }

    throw new Error(`Unexpected URL: ${url}`)
  })

  const result = await github('josefrancisco.verdu@gmail.com')

  t.is(result, undefined)
})

test('github memoizes user profile lookups by login', async t => {
  let searchUsersCalls = 0
  let getUserCalls = 0

  const github = createGithub(async url => {
    if (url.includes('/search/users?')) {
      searchUsersCalls++
      return { body: { items: [{ login: 'Kikobeats' }] } }
    }

    if (url.endsWith('/users/Kikobeats')) {
      getUserCalls++
      return {
        body: {
          login: 'Kikobeats',
          type: 'User',
          email: 'josefrancisco.verdu@gmail.com',
          avatar_url: 'https://avatars.githubusercontent.com/u/2096101?v=4'
        }
      }
    }

    throw new Error(`Unexpected URL: ${url}`)
  })

  const first = await github('josefrancisco.verdu@gmail.com')
  const second = await github('josefrancisco.verdu@gmail.com')

  t.is(first, 'https://avatars.githubusercontent.com/u/2096101?v=4')
  t.is(second, 'https://avatars.githubusercontent.com/u/2096101?v=4')
  t.is(searchUsersCalls, 2)
  t.is(getUserCalls, 1)
})

test('github commit fallback ignores organizations and keeps user avatar', async t => {
  const github = createGithub(async (url, opts) => {
    t.is(opts.responseType, 'json')

    if (url.includes('/search/users?')) {
      return { body: { items: [] } }
    }

    if (url.includes('/search/commits?')) {
      return {
        body: {
          items: [
            {
              author: {
                login: 'sindresorhus',
                type: 'Organization',
                avatar_url: 'https://avatars.githubusercontent.com/u/13122722?v=4'
              },
              committer: {
                login: 'sindresorhus',
                type: 'User',
                avatar_url: 'https://avatars.githubusercontent.com/u/170270?s=400&v=4'
              }
            }
          ]
        }
      }
    }

    throw new Error(`Unexpected URL: ${url}`)
  })

  const result = await github('sindresorhus@gmail.com')

  t.is(result, 'https://avatars.githubusercontent.com/u/170270?s=400&v=4')
})

test('github exact email match ignores organizations and falls back to user commit', async t => {
  const github = createGithub(async (url, opts) => {
    t.is(opts.responseType, 'json')

    if (url.includes('/search/users?')) {
      return {
        body: {
          items: [{ login: 'sindresorhus' }]
        }
      }
    }

    if (url.endsWith('/users/sindresorhus')) {
      return {
        body: {
          login: 'sindresorhus',
          type: 'Organization',
          email: 'sindresorhus@gmail.com',
          avatar_url: 'https://avatars.githubusercontent.com/u/13122722?v=4'
        }
      }
    }

    if (url.includes('/search/commits?')) {
      return {
        body: {
          items: [
            {
              author: {
                login: 'sindresorhus',
                type: 'Organization',
                avatar_url: 'https://avatars.githubusercontent.com/u/13122722?v=4'
              },
              committer: {
                login: 'sindresorhus',
                type: 'User',
                avatar_url: 'https://avatars.githubusercontent.com/u/170270?s=400&v=4'
              }
            }
          ]
        }
      }
    }

    throw new Error(`Unexpected URL: ${url}`)
  })

  const result = await github('sindresorhus@gmail.com')

  t.is(result, 'https://avatars.githubusercontent.com/u/170270?s=400&v=4')
})

test('github resolves organization email when user resolution fails', async t => {
  const github = createGithub(async (url, opts) => {
    t.is(opts.responseType, 'json')

    if (url.includes('/search/users?')) {
      return {
        body: {
          items: [{ login: 'microlinkhq' }]
        }
      }
    }

    if (url.endsWith('/users/microlinkhq')) {
      return {
        body: {
          login: 'microlinkhq',
          type: 'Organization',
          email: 'hello@microlink.io',
          avatar_url: 'https://avatars.githubusercontent.com/u/13122722?v=4'
        }
      }
    }

    if (url.includes('/search/commits?')) {
      return { body: { items: [] } }
    }

    throw new Error(`Unexpected URL: ${url}`)
  })

  const result = await github('hello@microlink.io')

  t.is(result, 'https://avatars.githubusercontent.com/u/13122722?v=4')
})
