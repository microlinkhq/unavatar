'use strict'

const test = require('ava')
const httpStatus = require('../../../src/util/http-status')

test('converts status codes to names', t => {
  t.is(httpStatus.OK, 200)
  t.is(httpStatus.NOT_FOUND, 404)
  t.is(httpStatus.INTERNAL_SERVER_ERROR, 500)
})

test('converts names to codes', t => {
  t.is(httpStatus(200), 'OK')
  t.is(httpStatus(404), 'Not Found')
  t.is(httpStatus(500), 'Internal Server Error')
  t.is(httpStatus(999), 999)
})

test('handle special characters', t => {
  t.is(httpStatus.NON_AUTHORITATIVE_INFORMATION, 203)
  t.is(httpStatus.MULTI_STATUS, 207)
  t.is(httpStatus.I_M_A_TEAPOT, 418)
  t.is(httpStatus('NOT_FOUND'), '404')
})
