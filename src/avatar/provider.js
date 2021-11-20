'use strict'

const { getAvatarUrl } = require('./auto')

module.exports = fn => async (...args) => getAvatarUrl(fn, ...args)
