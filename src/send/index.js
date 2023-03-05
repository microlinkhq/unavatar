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

const sendAvatar = ({ req, res, type, data }) => {
  if (!data) return res.end()
  return type === 'buffer'
    ? res.end(dataUriToBuffer(data))
    : got.stream(data, { headers: pickHeaders(req.headers) }).pipe(res)
}

const send = ({ type, data, req, res }) => {
  const { query } = req
  res.statusCode = data ? 200 : 404
  return query.json
    ? sendJson(res, { url: data })
    : sendAvatar({ req, res, type, data })
}

module.exports = send
