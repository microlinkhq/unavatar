'use strict'

const test = require('ava')
const path = require('path')
const fs = require('fs')

const DEFAULTS = require('../../../src/constant')

const mockCtx = {
  constants: DEFAULTS,
  createHtmlProvider: opts => async function () {},
  getOgImage: () => undefined,
  got: Object.assign(() => {}, { gotOpts: {} }),
  createRedisCache: () => new Map()
}

const { providers, providersBy } = require('../../../src/providers')(mockCtx)

const providersDir = path.join(__dirname, '../../../src/providers')
const providerFiles = fs
  .readdirSync(providersDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js')

for (const file of providerFiles) {
  const providerName = path.basename(file, '.js')

  test(`${providerName} is exported as provider function`, t => {
    t.truthy(providers[providerName], `${providerName} should be exported`)
    t.is(typeof providers[providerName], 'function', `${providerName} should export a function`)
  })
}

test('providersBy references valid providers only', t => {
  for (const inputType of ['email', 'username', 'domain']) {
    t.true(Array.isArray(providersBy[inputType]), `${inputType} should be an array`)
    for (const providerName of providersBy[inputType]) {
      t.truthy(providers[providerName], `${providerName} should exist in providers`)
    }
  }
})
