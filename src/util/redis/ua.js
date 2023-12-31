'use strict'

const { REDIS_UA_URI } = require('../../constant')

module.exports = require('./create')(REDIS_UA_URI)
