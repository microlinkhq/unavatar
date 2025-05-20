'use strict'

const NullProtoObj = require('null-prototype-object')

module.exports = fn =>
  (
    cache =>
      (...args) =>
        cache[args] || (cache[args] = fn(...args))
  )(new NullProtoObj())
