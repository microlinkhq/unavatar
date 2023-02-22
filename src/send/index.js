'use strict'

const dataUriToBuffer = require('data-uri-to-buffer')
const { pickBy } = require('lodash')

const got = require('../util/got')

const { ALLOWED_REQ_HEADERS } = require('../constant')

const pickHeaders = headers =>
  pickBy(headers, (value, key) => ALLOWED_REQ_HEADERS.includes(key))

const sendJson = (res, data) => {
  const str = JSON.stringify(data)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Content-Length', Buffer.byteLength(str))
  return res.end(str)
}

const sendAvatar = ({ req, res, type, data, isError }) => {
  if (isError) return res.end()
  return type === 'buffer'
    ? res.end(dataUriToBuffer(data))
    : got.stream(data, { headers: pickHeaders(req.headers) }).pipe(res)
}

const send = ({ type, data, req, res, isJSON, isError }) => {
  res.statusCode = isError ? 404 : 200
  return isJSON
    ? sendJson(res, { url: data })
    : sendAvatar({ req, res, type, data, isError })
}

module.exports = send
