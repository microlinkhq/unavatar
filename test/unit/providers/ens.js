'use strict'

const test = require('ava')

const createEnsProvider = require('../../../src/providers/ens')
const { parseInput, getAvatarUrl } = require('../../../src/providers/ens')

const ens = createEnsProvider()

test('.parseInput keeps a full ENS name', t => {
  t.is(parseInput('vitalik.eth'), 'vitalik.eth')
})

test('.parseInput keeps subnames', t => {
  t.is(parseInput('jesse.base.eth'), 'jesse.base.eth')
})

test('.parseInput appends .eth to a bare label', t => {
  t.is(parseInput('vitalik'), 'vitalik.eth')
})

test('.parseInput lowercases and trims the name', t => {
  t.is(parseInput('  Vitalik.ETH '), 'vitalik.eth')
})

test('.parseInput applies ENSIP-15 normalization', t => {
  t.is(parseInput('ＡＢＣ.eth'), 'abc.eth')
  t.is(parseInput('🦊.ETH'), '🦊.eth')
})

test('.parseInput returns undefined for names ENS cannot normalize', t => {
  t.is(parseInput('a b.eth'), undefined)
  t.is(parseInput('..eth'), undefined)
})

test('ens returns no avatar for names ENS cannot normalize', t => {
  t.is(ens('a b.eth'), undefined)
})

test('.getAvatarUrl encodes non-ascii names', t => {
  t.is(
    getAvatarUrl('🦊.eth'),
    'https://metadata.ens.domains/mainnet/avatar/%F0%9F%A6%8A.eth'
  )
})

test('ens resolves the ENS metadata avatar URL', t => {
  t.is(
    ens('vitalik.eth'),
    'https://metadata.ens.domains/mainnet/avatar/vitalik.eth'
  )
})

test('ens resolves base.eth subnames', t => {
  t.is(
    ens('jesse.base.eth'),
    'https://metadata.ens.domains/mainnet/avatar/jesse.base.eth'
  )
})

test('ens resolves a bare label as a .eth name', t => {
  t.is(ens('nick'), 'https://metadata.ens.domains/mainnet/avatar/nick.eth')
})
