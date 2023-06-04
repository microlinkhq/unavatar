'use strict'

const PCancelable = require('p-cancelable')
const mql = require('@microlink/mql')

module.exports = PCancelable.fn(async function microlink (
  { input, req },
  onCancel
) {
  const promise = mql(`https://${input}`, {
    apiKey: req.headers?.['x-api-key']
  })
  onCancel(() => promise.onCancel())
  const { data } = await promise
  return data.logo?.url
})

module.exports.supported = {
  email: false,
  username: false,
  domain: true
}
