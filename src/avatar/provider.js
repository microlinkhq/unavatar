'use strict'

const { getAvatarUrl } = require('./auto')

module.exports = fn => async input => getAvatarUrl(fn, input)
