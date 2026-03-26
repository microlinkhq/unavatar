'use strict'

const test = require('ava')

const { getAvatarUrl } = require('../../../src/providers/linkedin')

test('.getAvatarUrl defaults to user profile path', t => {
  t.is(getAvatarUrl('kikobeats'), 'https://www.linkedin.com/in/kikobeats')
})

test('.getAvatarUrl with explicit user type', t => {
  t.is(getAvatarUrl('user:kikobeats'), 'https://www.linkedin.com/in/kikobeats')
})

test('.getAvatarUrl with company type', t => {
  t.is(
    getAvatarUrl('company:microlink'),
    'https://www.linkedin.com/company/microlink'
  )
})

test('.getAvatarUrl with school type', t => {
  t.is(getAvatarUrl('school:mit'), 'https://www.linkedin.com/school/mit')
})
