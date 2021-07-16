'use strict'

const { pickBy, get } = require('lodash')

const got = require('./got')

const { ALLOWED_REQ_HEADERS } = require('./constant')

const sendAvatar = ({ req, res, url, isError }) => {
  if (isError) return res.send()

  const headers = pickBy(req.headers, (value, key) => ALLOWED_REQ_HEADERS.includes(key))

  const stream = got.stream(url, { headers })
  stream.on('response', resAvatar =>
    res.set('Content-Type', get(resAvatar, 'headers.content-type'))
  )
  stream.on('error', () => res.status(404))
  return stream.pipe(res)
}

const send = ({ url, req, res, isJSON, isError }) => {
  res.status(isError ? 404 : 200)
  return isJSON ? res.json({ url }) : sendAvatar({ req, res, url, isError })
}

module.exports = send
