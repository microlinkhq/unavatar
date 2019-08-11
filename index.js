'use strict'

const express = require('express')

module.exports = express()
  .use(require('./src'))
  .disable('x-powered-by')
