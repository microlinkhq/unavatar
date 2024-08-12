'use strict'

const { dataUriToBuffer } = require('data-uri-to-buffer')
const { pickBy } = require('lodash')
const send = require('send-http')

const got = require('../util/got')

const { ALLOWED_REQ_HEADERS } = require('../constant')

const pickHeaders = headers =>
  pickBy(headers, (_, key) => ALLOWED_REQ_HEADERS.includes(key))

module.exports = ({ type, data, req, res }) => {
  const { query } = req
  const statusCode = data ? 200 : 404
  return query.json
    ? send(res, statusCode, { url: data })
    : type === 'buffer'
      ? send(res, statusCode, dataUriToBuffer(data))
      : got.stream(data, { headers: pickHeaders(req.headers) }).pipe(res)
}
