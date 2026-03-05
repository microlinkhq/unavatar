'use strict'

const { URLSearchParams } = require('url')

module.exports = obj => new URLSearchParams(obj).toString()
