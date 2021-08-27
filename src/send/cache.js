'use strict'

const KeyvMongo = require('@keyvhq/mongo')
const Keyv = require('@keyvhq/core')

const { CACHE_TTL, MONGO_URI } = require('../constant')

const send = require('.')

const store = MONGO_URI ? new KeyvMongo() : new Map()

const cache = new Keyv({ namespace: null, store })

module.exports = require('cacheable-response')({
  cache: cache,
  ttl: CACHE_TTL,
  staleTtl: 0,
  get: async ({ req, res, fn }) => ({ data: await fn(req, res) }),
  send: ({ req, res, data }) => send({ req, res, ...data })
})
