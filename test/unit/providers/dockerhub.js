'use strict'

const test = require('ava')

const { getUserUrl } = require('../../../src/providers/dockerhub')

const createDockerHub = got =>
  require('../../../src/providers/dockerhub')({ got })

test('dockerhub builds encoded user API URL', t => {
  t.is(
    getUserUrl('linux/server'),
    'https://hub.docker.com/v2/users/linux%2Fserver/'
  )
})

test('dockerhub resolves gravatar_url from user profile', async t => {
  const dockerhub = createDockerHub(async (url, opts) => {
    t.is(url, 'https://hub.docker.com/v2/users/docker/')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return {
      statusCode: 200,
      body: {
        gravatar_url:
          'https://www.gravatar.com/avatar/56b6e15d486f6407690a6cb56e3fa68e?s=80&r=g&d=mm'
      }
    }
  })

  const result = await dockerhub('docker')

  t.is(
    result,
    'https://www.gravatar.com/avatar/56b6e15d486f6407690a6cb56e3fa68e?s=80&r=g&d=mm'
  )
})

test('dockerhub returns undefined when profile has no avatar', async t => {
  const dockerhub = createDockerHub(async () => ({
    statusCode: 200,
    body: { gravatar_url: '' }
  }))

  const result = await dockerhub('kikobeats')

  t.is(result, undefined)
})

test('dockerhub returns undefined when profile is missing', async t => {
  const dockerhub = createDockerHub(async () => ({
    statusCode: 404,
    body: { detail: 'Not found.' }
  }))

  const result = await dockerhub('missing')

  t.is(result, undefined)
})
