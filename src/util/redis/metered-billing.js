'use strict'

const { REDIS_URI_METERED_BILLING } = require('../../constant')

module.exports = require('./create')(REDIS_URI_METERED_BILLING)
