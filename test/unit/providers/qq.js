'use strict'

const test = require('ava')

const { getAvatarUrl } = require('../../../src/providers/qq')

const createQQ = () => require('../../../src/providers/qq')({})

test('.getAvatarUrl builds the qlogo URL', t => {
  t.is(getAvatarUrl('10001'), 'https://q1.qlogo.cn/g?b=qq&nk=10001&s=640')
})

test('qq resolves the qlogo URL directly', t => {
  const qq = createQQ()
  t.is(qq('10001'), 'https://q1.qlogo.cn/g?b=qq&nk=10001&s=640')
})
