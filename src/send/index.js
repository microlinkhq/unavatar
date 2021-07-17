'use strict'

const { promisify } = require('util')
const { pickBy } = require('lodash')
const stream = require('stream')

const pipeline = promisify(stream.pipeline)

const got = require('../util/got')

const { ALLOWED_REQ_HEADERS } = require('../constant')

const sendAvatar = ({ req, res, url, isError }) => {
  if (isError) return res.send()
  const headers = pickBy(req.headers, (value, key) => ALLOWED_REQ_HEADERS.includes(key))
  return pipeline(got.stream(url, { headers }), res)
}

const send = ({ url, req, res, isJSON, isError }) => {
  res.status(isError ? 404 : 200)
  return isJSON ? res.json({ url }) : sendAvatar({ req, res, url, isError })
}

module.exports = send
