'use strict'

const { getAvatar } = require('./auto')

module.exports = (name, fn) => args => getAvatar(fn, name, args)
