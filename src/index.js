'use strict'

const { forEach } = require('lodash')
const express = require('express')
const path = require('path')
const { Router } = express

const { providers } = require('./providers')
const { LOG_LEVEL } = require('./constant')

const ssrCache = require('./send/cache')
const avatar = require('./avatar')

const router = Router()

router.use(require('helmet')())
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
