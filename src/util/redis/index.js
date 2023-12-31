'use strict'

const { REDIS_URI } = require('../../constant')

module.exports = require('./create')(REDIS_URI)
