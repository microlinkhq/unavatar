'use strict'

const { CACHE_TTL } = require('../constant')

const send = require('.')

module.exports = require('cacheable-response')({
  ttl: CACHE_TTL,
  staleTtl: 0,
  get: async ({ req, res, fn }) => ({ data: await fn(req, res) }),
  send: ({ req, res, data }) => send({ req, res, ...data })
})
