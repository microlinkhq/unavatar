'use strict'

const cacheableResponse = require('cacheable-response')
const { forEach } = require('lodash')
const express = require('express')
const path = require('path')
const { Router } = express
const { get } = require('lodash')

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
router.get('/fallback.svg', (req, res) => {
  const start = get(req, 'query.start', '64748B').replace(/[^a-zA-Z0-9]/, '')
  const end = get(req, 'query.end', '64748B').replace(/[^a-zA-Z0-9]/, '')
  const width = parseInt(get(req, 'query.width', 256))
  const height = parseInt(get(req, 'query.height', 256))
  const size = parseInt(get(req, 'query.height', 96))
  const text = get(req, 'query.text', '').replace(/[\W_]+/g, '')
  res.set('Content-Type', 'image/svg+xml')
  const svg = `<svg viewBox="0 0 ${width} ${height}" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <g>
      <defs>
        <linearGradient id="avatar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#${start}"/>
          <stop offset="100%" stop-color="#${end}"/>
        </linearGradient>
      </defs>
      <rect fill="url(#avatar)" x="0" y="0" width="${width}" height="${height}"/>
      <text x="50%" y="50%" alignment-baseline="central" dominant-baseline="central" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="${size}">${text}</text>
    </g>
  </svg>`
  res.send(svg)
})

const getAvatar = createGetAvatarUrl()

router.get('/:key', (req, res) => ssrCache({ req, res, fn: getAvatar }))

forEach(providers, (fn, provider) => {
  const getAvatarByProvider = createGetAvatarUrl(fn)
  router.get(`/${provider}/:key`, (req, res) => ssrCache({ req, res, fn: getAvatarByProvider }))
})

module.exports = express()
  .use(router)
  .disable('x-powered-by')
