'use strict'

const { NOT_FOUND } = require('../../../src/util/html-provider')

const createApiProviderCtx = ({ got, onFetch, ...ctx }) => ({
  ...ctx,
  NOT_FOUND,
  createApiProvider: require('../../../src/util/api-provider')({
    got,
    PROXY_TIMEOUT: 8000,
    onFetch
  }).createApiProvider
})

const captureAttempt = async ({ attempt }) => {
  try {
    return { value: await attempt() }
  } catch (error) {
    return { error }
  }
}

module.exports = { captureAttempt, createApiProviderCtx, NOT_FOUND }
