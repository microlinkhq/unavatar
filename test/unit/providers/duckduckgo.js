'use strict'

const test = require('ava')
const sinon = require('sinon')

const duckduckgoFactory = require('../../../src/providers/duckduckgo')
const { getAvatarUrl, toggleWww } = duckduckgoFactory

const ip3 = host => `https://icons.duckduckgo.com/ip3/${host}.ico`

// Builds a reachableUrl stub that reports the given hosts as reachable (HTTP
// 200) and everything else as a 404, mirroring how DuckDuckGo's `ip3` endpoint
// answers per exact hostname.
const stubReachable = (...reachableHosts) => {
  const set = new Set(reachableHosts.map(ip3))
  const reachableUrl = sinon.stub().callsFake(async url => ({
    statusCode: set.has(url) ? 200 : 404,
    url
  }))
  reachableUrl.isReachable = ({ statusCode }) =>
    statusCode >= 200 && statusCode < 400
  return reachableUrl
}

test('.getAvatarUrl builds the ip3 icon URL from the host', t => {
  t.is(getAvatarUrl('chrisd.ca'), ip3('chrisd.ca'))
})

test('.toggleWww prepends www to a bare host', t => {
  t.is(toggleWww('chrisd.ca'), 'www.chrisd.ca')
})

test('.toggleWww strips www from a www host', t => {
  t.is(toggleWww('www.chrisd.ca'), 'chrisd.ca')
})

test('returns the primary URL when the bare host is reachable', async t => {
  const reachableUrl = stubReachable('winnipegfreepress.com')
  const duckduckgo = duckduckgoFactory({ reachableUrl })

  t.is(await duckduckgo('winnipegfreepress.com'), ip3('winnipegfreepress.com'))
  // Only the primary is probed; no wasted www lookup.
  t.true(reachableUrl.calledOnceWithExactly(ip3('winnipegfreepress.com')))
})

test('recovers the www variant when only www is reachable (chrisd.ca)', async t => {
  // chrisd.ca: bare 404, www.chrisd.ca 200 — the issue #629 case.
  const reachableUrl = stubReachable('www.chrisd.ca')
  const duckduckgo = duckduckgoFactory({ reachableUrl })

  t.is(await duckduckgo('chrisd.ca'), ip3('www.chrisd.ca'))
})

test('recovers the apex variant when only apex is reachable', async t => {
  const reachableUrl = stubReachable('chrisd.ca')
  const duckduckgo = duckduckgoFactory({ reachableUrl })

  t.is(await duckduckgo('www.chrisd.ca'), ip3('chrisd.ca'))
})

test('falls back to the primary URL when neither variant is reachable (rabble.ca)', async t => {
  // rabble.ca: DDG has neither bare nor www — return primary so the caller's
  // reachability check rejects it uniformly and the race falls to Google.
  const reachableUrl = stubReachable()
  const duckduckgo = duckduckgoFactory({ reachableUrl })

  t.is(await duckduckgo('rabble.ca'), ip3('rabble.ca'))
})

test('treats a probe rejection as unreachable and tries the alternate', async t => {
  const reachableUrl = sinon.stub()
  reachableUrl.withArgs(ip3('chrisd.ca')).rejects(new Error('network error'))
  reachableUrl
    .withArgs(ip3('www.chrisd.ca'))
    .resolves({ statusCode: 200, url: ip3('www.chrisd.ca') })
  reachableUrl.isReachable = ({ statusCode }) =>
    statusCode >= 200 && statusCode < 400
  const duckduckgo = duckduckgoFactory({ reachableUrl })

  t.is(await duckduckgo('chrisd.ca'), ip3('www.chrisd.ca'))
})
