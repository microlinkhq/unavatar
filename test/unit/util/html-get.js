'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noPreserveCache()

test('html-get creates browser context and destroys it after request', async t => {
  const destroyContext = sinon.stub().resolves()
  const browserContext = { destroyContext }
  const browser = { createContext: sinon.stub().resolves(browserContext) }
  const createBrowser = sinon.stub().returns(browser)

  const getHTML = sinon.stub().callsFake(async (url, opts) => {
    t.is(url, 'https://example.com')
    t.is(opts.prerender, false)
    t.is(opts.puppeteerOpts.timeout, 3210)
    t.is(opts.puppeteerOpts.blockResources, true)
    t.is(opts.gotOpts.agent, 'agent-stub')
    t.deepEqual(opts.gotOpts.retry, { limit: 0 })
    t.is(opts.gotOpts.timeout, 3210)
    t.is(opts.custom, 'value')
    t.is(opts.getBrowserless(), browserContext)
    t.deepEqual(opts.serializeHtml('ignored'), { $: 'ignored' })
    return { $: 'dom', statusCode: 200 }
  })

  const htmlGetFactory = proxyquire('../../../src/util/html-get', {
    'html-get': getHTML
  })

  const htmlGet = htmlGetFactory({
    createBrowser,
    got: { gotOpts: { retry: { limit: 0 } } }
  })

  const result = await htmlGet('https://example.com', {
    custom: 'value',
    timeout: 3210,
    gotOpts: { agent: 'agent-stub' },
    puppeteerOpts: { blockResources: true }
  })

  t.deepEqual(result, { $: 'dom', statusCode: 200 })
  t.true(createBrowser.calledOnce)
  t.true(browser.createContext.calledOnce)
  t.true(destroyContext.calledOnce)
})
