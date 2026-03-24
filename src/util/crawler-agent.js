'use strict'

const uniqueRandomArray = require('unique-random-array')

// TODO: update top-crawler-agents to don't make necessary to filter.
module.exports = uniqueRandomArray(
  require('top-crawler-agents').filter(agent => agent.startsWith('Slackbot'))
)
