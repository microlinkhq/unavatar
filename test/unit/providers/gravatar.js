'use strict'

const test = require('ava')
const crypto = require('crypto')

const { AVATAR_SIZE } = require('../../../src/constant')

const createGravatar = () =>
  require('../../../src/providers/gravatar')({ constants: { AVATAR_SIZE } })

const sha256 = str => crypto.createHash('sha256').update(str).digest('hex')

test('gravatar hashes email with sha256', t => {
  const gravatar = createGravatar()
  const email = 'hello@example.com'
  const hash = sha256(email.trim().toLowerCase())
  t.is(gravatar(email), `https://gravatar.com/avatar/${hash}?size=${AVATAR_SIZE}&d=404`)
})

test('gravatar normalizes email before hashing', t => {
  const gravatar = createGravatar()
  const hash = sha256('hello@example.com')
  t.is(gravatar('  Hello@Example.COM  '), `https://gravatar.com/avatar/${hash}?size=${AVATAR_SIZE}&d=404`)
})

test('gravatar uses sha256 hash input directly', t => {
  const gravatar = createGravatar()
  const hash = sha256('hello@example.com')
  t.is(gravatar(hash), `https://gravatar.com/avatar/${hash}?size=${AVATAR_SIZE}&d=404`)
})

test('gravatar uses md5 hash input directly (legacy)', t => {
  const gravatar = createGravatar()
  const md5hash = crypto.createHash('md5').update('hello@example.com').digest('hex')
  t.is(gravatar(md5hash), `https://gravatar.com/avatar/${md5hash}?size=${AVATAR_SIZE}&d=404`)
})

test('gravatar normalizes hash input to lowercase', t => {
  const gravatar = createGravatar()
  const hash = sha256('hello@example.com')
  t.is(gravatar(hash.toUpperCase()), `https://gravatar.com/avatar/${hash}?size=${AVATAR_SIZE}&d=404`)
})
