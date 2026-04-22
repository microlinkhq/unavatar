'use strict'

const test = require('ava')
const path = require('path')
const fs = require('fs')
const Keyv = require('@keyvhq/core')

const DEFAULTS = require('../../../src/constant')

const mockCtx = {
  constants: DEFAULTS,
  createHtmlProvider: () => async function () {},
  getOgImage: () => undefined,
  got: Object.assign(() => {}, { gotOpts: {} }),
  githubSearchCache: new Keyv({ store: new Map() }),
  itunesSearchCache: new Keyv({ store: new Map() })
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
    t.is(
      typeof providers[providerName],
      'function',
      `${providerName} should export a function`
    )
  })
}

test('providersBy references valid providers only', t => {
  for (const inputType of ['email', 'username', 'domain']) {
    t.true(
      Array.isArray(providersBy[inputType]),
      `${inputType} should be an array`
    )
    for (const providerName of providersBy[inputType]) {
      t.truthy(
        providers[providerName],
        `${providerName} should exist in providers`
      )
    }
  }
})

test('providers do not duplicate og:image extraction or import html-provider directly', t => {
  const directImportPattern = /require\((['"])..\/util\/html-provider\1\)/
  const ogImageSelectorPattern =
    /meta\[property="og:image"\][\s\S]*meta\[name="og:image"\]/

  for (const file of providerFiles) {
    const filePath = path.join(providersDir, file)
    const source = fs.readFileSync(filePath, 'utf8')

    t.false(
      directImportPattern.test(source),
      `${file} should receive getOgImage from provider context`
    )
    t.false(
      ogImageSelectorPattern.test(source),
      `${file} should use shared getOgImage helper instead of duplicated selector logic`
    )
  }
})
