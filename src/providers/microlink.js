'use strict'

const mql = require('@microlink/mql')
const { get } = require('lodash')

module.exports = ({ constants }) =>
  async function microlink (input, context) {
    const req = context?.req
    const { data } = await mql(`https://${input}`, {
      apiKey: req?.isPro
        ? constants.MICROLINK_API_KEY
        : req?.headers?.['x-api-key']
    })
    return get(data, 'logo.url')
  }
