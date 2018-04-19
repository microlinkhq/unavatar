'use strict'

const QuickLRU = require('quick-lru')
const got = require('got')

const cache = new QuickLRU({ maxSize: 1000 })

module.exports = (url, opts) => got(url, Object.assign({ cache }, opts))
module.exports.stream = got.stream
