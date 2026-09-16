'use strict'

const createClient = require('microlink.io')

module.exports = ({ constants }) => {
  const client = createClient()

  return async function microlink (input, context) {
    const req = context?.req
    const logo = await client.logo(`https://${input}`, {
      apiKey: req?.isPro
        ? constants.MICROLINK_API_KEY
        : req?.headers?.['x-api-key']
    })
    return logo?.url
  }
}
