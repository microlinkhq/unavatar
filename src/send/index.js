'use strict'

const dataUriToBuffer = require('data-uri-to-buffer')
const { promisify } = require('util')
const { pickBy } = require('lodash')
const stream = require('stream')

const pipeline = promisify(stream.pipeline)

const got = require('../util/got')

const { ALLOWED_REQ_HEADERS } = require('../constant')

const pickHeaders = headers =>
  pickBy(headers, (value, key) => ALLOWED_REQ_HEADERS.includes(key))

const sendAvatar = ({ req, res, type, data, isError }) => {
  if (isError) return res.send()
  return type === 'buffer'
    ? res.send(dataUriToBuffer(data))
    : pipeline(got.stream(data, { headers: pickHeaders(req.headers) }), res)
}

const send = ({ type, data, req, res, isJSON, isError }) => {
  res.status(isError ? 404 : 200)
  return isJSON
    ? res.json({ url: data })
    : sendAvatar({ req, res, type, data, isError })
}

module.exports = send
