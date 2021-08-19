'use strict'

const { CACHE_TTL, NODE_ENV } = require('../constant')

const send = require('.')

module.exports =
  NODE_ENV === 'development'
    ? async ({ req, res, fn }) => {
        const data = await fn(req, res)
        return send({ req, res, ...data })
      }
    : require('cacheable-response')({
      ttl: CACHE_TTL,
      staleTtl: 0,
      get: async ({ req, res, fn }) => ({ data: await fn(req, res) }),
      send: ({ req, res, data }) => send({ req, res, ...data })
    })
