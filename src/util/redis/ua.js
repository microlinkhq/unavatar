'use strict'

const { REDIS_URI_UA } = require('../../constant')

module.exports = require('./create')(REDIS_URI_UA)
