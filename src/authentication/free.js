'use strict'

const { RateLimiterMemory } = require('rate-limiter-flexible')

const { RATE_LIMIT_WINDOW, RATE_LIMIT } = require('../constant')

const rateLimiter = new RateLimiterMemory({
  points: RATE_LIMIT,
  duration: RATE_LIMIT_WINDOW
})

module.exports = async token => {
  const { msBeforeNext, remainingPoints: remaining } = await rateLimiter
    .consume(token)
    .catch(error => error)

  return {
    limit: RATE_LIMIT,
    reset: Date.now() + msBeforeNext,
    remaining
  }
}
