'use strict'

const RateLimiter = require('async-ratelimiter')
const { getClientIp } = require('request-ip')
const { forEach } = require('lodash')
const express = require('express')
const Redis = require('ioredis')
const path = require('path')

const { REDIS_URI, LOG_LEVEL } = require('./constant')
const { providers } = require('./providers')

const ssrCache = require('./send/cache')
const avatar = require('./avatar')
const { Router } = express

const rateLimiter = new RateLimiter({
  db: new Redis(REDIS_URI),
  duration: 86400000,
  max: 1000,
  namespace: 'unavatar'
})

const router = Router()

router.use(
  require('helmet')({
    crossOriginResourcePolicy: false
  })
)

router.use(async (req, res, next) => {
  const clientIp = getClientIp(req)
  const limit = await rateLimiter.get({ id: clientIp })

  if (!res.finished && !res.headersSent) {
    res.setHeader('X-Rate-Limit-Limit', limit.total)
    res.setHeader('X-Rate-Limit-Remaining', Math.max(0, limit.remaining - 1))
    res.setHeader('X-Rate-Limit-Reset', limit.reset)
  }

  return limit.remaining ? next() : res.status(429).end('Daily quota reached')
})

router.use(require('compression')())
router.use(require('cors')())
router.use(require('morgan')(LOG_LEVEL))
router.use(express.static(path.resolve('public')))

router.get('/robots.txt', (req, res) => res.status(204).send())
router.get('/favicon.ico', (req, res) => res.status(204).send())

router.get('/:key', (req, res) =>
  ssrCache({
    req,
    res,
    fn: avatar.resolve(avatar.auto)
  })
)

forEach(providers, (fn, provider) =>
  router.get(`/${provider}/:key`, (req, res) =>
    ssrCache({ req, res, fn: avatar.resolve(avatar.provider(fn)) })
  )
)

module.exports = express()
  .use(router)
  .disable('x-powered-by')
