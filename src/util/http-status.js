'use strict'

const { STATUS_CODES } = require('http')

const byCode = Object.entries(STATUS_CODES).reduce((acc, [key, value]) => {
  const name = value.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase()
  acc[name] = key
  return acc
}, {})

const fn = input => (typeof input === 'number' ? STATUS_CODES[input] ?? input : byCode[input])

Object.keys(byCode).forEach(key => {
  fn[key] = Number(byCode[key])
})

module.exports = fn
