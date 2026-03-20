'use strict'

const test = require('ava')
const CacheableLookup = require('cacheable-lookup')

const createIsReservedIp = require('../../../src/util/is-reserved-ip')

const isReservedIp = createIsReservedIp({
  cacheableLookup: new CacheableLookup()
})

test('returns true for IPv4 loopback', async t => {
  t.true(await isReservedIp('127.0.0.1'))
})

test('returns true for IPv4 private ranges', async t => {
  t.true(await isReservedIp('10.0.0.1'))
  t.true(await isReservedIp('192.168.1.1'))
  t.true(await isReservedIp('172.16.0.1'))
})

test('returns true for link-local / metadata endpoint', async t => {
  t.true(await isReservedIp('169.254.169.254'))
})

test('returns true for unspecified address', async t => {
  t.true(await isReservedIp('0.0.0.0'))
})

test('returns true for localhost (resolves to loopback)', async t => {
  t.true(await isReservedIp('localhost'))
})

test('returns true for IPv6 loopback', async t => {
  t.true(await isReservedIp('[::1]'))
})

test('returns true for IPv4-mapped IPv6 loopback', async t => {
  t.true(await isReservedIp('[::ffff:127.0.0.1]'))
})

test('returns true for IPv6 unique local (ULA)', async t => {
  t.true(await isReservedIp('[fd00::1]'))
})

test('returns true for IPv6 link-local', async t => {
  t.true(await isReservedIp('[fe80::1]'))
})

test('returns true for carrier-grade NAT range (100.64.0.0/10)', async t => {
  t.true(await isReservedIp('100.64.0.1'))
})

test('returns false for public unicast addresses', async t => {
  t.false(await isReservedIp('1.1.1.1'))
  t.false(await isReservedIp('8.8.8.8'))
})

test('returns false for bracketed public IPv6 unicast', async t => {
  t.false(await isReservedIp('[2001:4860:4860::8888]'))
})
