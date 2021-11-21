'use strict'

const { getAvatar } = require('./auto')

module.exports = fn => async (...args) => getAvatar(fn, ...args)
