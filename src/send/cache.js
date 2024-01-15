'use strict'

const { parse } = require('@lukeed/ms')

const memoize = require('../util/memoize')
const send = require('.')

const { TTL_DEFAULT, TTL_MIN, TTL_MAX } = require('../constant')

const getTtl = memoize(ttl => {
  if (ttl === undefined || ttl === null) return TTL_DEFAULT
  const value = typeof ttl === 'number' ? ttl : parse(ttl)
  if (value === undefined || value < TTL_MIN || value > TTL_MAX) { return TTL_DEFAULT }
  return value
})

module.exports = require('cacheable-response')({
  logger: require('debug-logfmt')('cacheable-response'),
  ttl: TTL_DEFAULT,
  staleTtl: false,
  get: async ({ req, res, fn }) => ({
    ttl: getTtl(req.query.ttl),
    data: await fn(req, res)
  }),
  send: ({ req, res, data }) => send({ req, res, ...data })
})

module.exports.getTtl = getTtl
