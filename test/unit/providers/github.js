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
                avatar_url: 'https://avatars.githubusercontent.com/u/2096101?v=4'
              }
            },
            {
              author: {
                login: 'Kikobeats',
                avatar_url: 'https://avatars.githubusercontent.com/u/2096101?v=4'
              }
            },
            {
              author: {
                login: 'someone-else',
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

test('github memoizes email lookups across repeated calls', async t => {
  let gotCalls = 0
  const github = createGithub(async url => {
    gotCalls++

    if (url.includes('/search/users?')) {
      return { body: { items: [] } }
    }

    if (url.includes('/search/commits?')) {
      return {
        body: {
          items: [
            {
              author: {
                login: 'Kikobeats',
                avatar_url: 'https://avatars.githubusercontent.com/u/2096101?v=4'
              }
            }
          ]
        }
      }
    }

    throw new Error(`Unexpected URL: ${url}`)
  })

  const first = await github('josefrancisco.verdu@gmail.com')
  const second = await github('josefrancisco.verdu@gmail.com')

  t.is(first, 'https://avatars.githubusercontent.com/u/2096101?v=4')
  t.is(second, 'https://avatars.githubusercontent.com/u/2096101?v=4')
  t.is(gotCalls, 2)
})
