'use strict'

const { isFinished } = require('on-finished')

const rateLimiter = require('./util/rate-limiter')

const { API_KEY } = require('./constant')

const more = (() => {
  const email = 'hello@microlink.io'
  const subject = encodeURIComponent('[unavatar] Buy an API key')
  const body = encodeURIComponent(
    'Hello,\nI want to buy an unavatar.sh API key. Please tell me how to proceed.'
  )
  return `mailto:${email}?subject=${subject}&body=${body}`
})()

const rateLimitError = (() => {
  const rateLimitError = new Error(
    JSON.stringify({
      status: 'fail',
      code: 'ERATE',
      more,
      message:
        'Your daily rate limit has been reached. You need to wait or buy a plan.'
    })
  )

  rateLimitError.status = 429
  rateLimitError.headers = { 'Content-Type': 'application/json' }
  return rateLimitError
})()

module.exports = async (req, res, next) => {
  if (req.headers['x-api-key'] === API_KEY) return next()
  const clientIp = req.headers['cf-connecting-ip'] || '::ffff:127.0.0.1'
  const { total, reset, remaining } = await rateLimiter.get({ id: clientIp })

  if (!isFinished(res)) {
    res.setHeader('X-Rate-Limit-Limit', total)
    res.setHeader('X-Rate-Limit-Remaining', Math.max(0, remaining - 1))
    res.setHeader('X-Rate-Limit-Reset', reset)
  }

  return remaining ? next() : next(rateLimitError)
}
