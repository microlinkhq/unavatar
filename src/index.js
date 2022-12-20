'use strict'

const { forEach } = require('lodash')
const polka = require('polka')

const { LOG_LEVEL } = require('./constant')

const { providers } = require('./providers')
const ssrCache = require('./send/cache')
const avatar = require('./avatar')

const app = polka()

app.use(require('helmet')({ crossOriginResourcePolicy: false }))
app.use(require('compression')())
app.use(require('cors')())
app.use(require('morgan')(LOG_LEVEL))
app.use(require('./authentication'))

app.get('/:key', (req, res) =>
  ssrCache({
    req,
    res,
    fn: avatar.resolve(avatar.auto)
  })
)

forEach(providers, (fn, provider) =>
  app.get(`/${provider}/:key`, (req, res) =>
    ssrCache({ req, res, fn: avatar.resolve(avatar.provider(fn)) })
  )
)

module.exports = app
