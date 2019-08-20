'use strict'

const cacheableResponse = require('cacheable-response')
const { forEach } = require('lodash')
const express = require('express')
const path = require('path')
const { Router } = express

const { CACHE_TTL, NODE_ENV, LOG_LEVEL } = require('./constant')
const createGetAvatarUrl = require('./avatar-url')
const { providers } = require('./providers')
const send = require('./send')

const ssrCache = (() => {
  if (NODE_ENV === 'development') {
    return async ({ req, res, fn }) => {
      const data = await fn(req, res)
      return send({ req, res, ...data })
    }
  }

  return cacheableResponse({
    ttl: CACHE_TTL,
    get: async ({ req, res, fn }) => ({
      data: await fn(req, res)
    }),
    send: ({ req, res, data }) => send({ req, res, ...data })
  })
})()

const router = Router()

router.use(require('helmet')())
router.use(require('compression')())
router.use(require('cors')())
router.use(require('morgan')(LOG_LEVEL))
router.use(express.static(path.resolve('public')))

router.get('/robots.txt', (req, res) => res.status(204).send())
router.get('/favicon.ico', (req, res) => res.status(204).send())

const getAvatar = createGetAvatarUrl()

router.get('/:key', (req, res) => ssrCache({ req, res, fn: getAvatar }))

forEach(providers, (fn, provider) => {
  const getAvatarByProvider = createGetAvatarUrl(fn)
  router.get(`/${provider}/:key`, (req, res) => ssrCache({ req, res, fn: getAvatarByProvider }))
})

module.exports = express()
  .use(router)
  .disable('x-powered-by')
