'use strict'

const uniqueRandomArray = require('unique-random-array')

module.exports = uniqueRandomArray(
  require('top-crawler-agents').filter(agent => agent.startsWith('Slackbot'))
)
