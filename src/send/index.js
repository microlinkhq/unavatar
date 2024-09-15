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

  if (query.json) {
    return send(res, statusCode, { url: data })
  }

  if (type === 'buffer' || data === undefined) {
    const responseData = data === undefined ? data : dataUriToBuffer(data)
    return send(res, statusCode, responseData)
  }

  const stream = got.stream(data, { headers: pickHeaders(req.headers) })
  return stream.pipe(res)
}
