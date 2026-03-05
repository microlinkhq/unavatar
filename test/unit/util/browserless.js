'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noPreserveCache()

const buildBrowserless = ({ isTest = false } = {}) => {
  const browser = { id: Symbol('browser') }
  const createBrowser = sinon.stub().returns(browser)
  createBrowser.driver = { defaultArgs: ['--headless'] }

  const factory = proxyquire('../../../src/util/browserless', {
    browserless: createBrowser,
    crypto: { randomUUID: sinon.stub().returns('uuid-test') },
    puppeteer: { name: 'puppeteer-stub' }
  })

  const getBrowser = factory({ TMP_FOLDER: '/tmp/unavatar', isTest })

  return { getBrowser, createBrowser, browser }
}

test('uses fixed puppeteer directory outside tests', t => {
  const { getBrowser, createBrowser, browser } = buildBrowserless({ isTest: false })

  t.is(getBrowser(), browser)
  t.true(createBrowser.calledOnce)

  const { args } = createBrowser.firstCall.args[0]
  t.true(args.includes('--headless'))
  t.true(args.includes('--disk-cache-dir=/tmp/unavatar/puppeteer/cache'))
  t.true(args.includes('--user-data-dir=/tmp/unavatar/puppeteer/profile'))
})

test('uses unique puppeteer directory in tests', t => {
  const { getBrowser, createBrowser } = buildBrowserless({ isTest: true })
  getBrowser()

  const { args } = createBrowser.firstCall.args[0]
  t.true(args.includes('--disk-cache-dir=/tmp/unavatar/puppeteer-uuid-test/cache'))
  t.true(args.includes('--user-data-dir=/tmp/unavatar/puppeteer-uuid-test/profile'))
})
