'use strict'

const { default: listen } = require('async-listen')
const { createServer } = require('http')

const redis = require('../src/util/redis/metered-billing')

const close = server => new Promise(resolve => server.close(resolve))

const runServer = async t => {
  const server = createServer(require('../src'))
  const serverUrl = await listen(server)
  t.teardown(() => close(server))
  return serverUrl
}

const createOpenKeySetup = ({ prefix = '' } = {}) => {
  const redisKeys = []

  const create = async metadata => {
    const openkey = require('openkey')({ redis, prefix })

    const planId = await openkey.uid({ redis, size: 4 })
    redisKeys.push(`${prefix}plan:${planId}`)

    const plan = await openkey.plans.create({
      id: planId,
      name: 'paid customers',
      limit: 100,
      period: '28d'
    })

    const key = await openkey.keys.create({
      plan: plan.id,
      metadata
    })

    return key.value
  }

  const cleanup = async () => {
    const stream = redis.scanStream({ match: `${prefix}*` })
    const keysToDelete = []
    for await (const keys of stream) {
      keysToDelete.push(...keys)
    }
    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete)
    }
    redisKeys.length = 0
  }

  return { create, cleanup }
}

module.exports = { runServer, createOpenKeySetup }
