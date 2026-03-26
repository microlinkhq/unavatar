'use strict'

const test = require('ava')

const { getAvatarUrl } = require('../../../src/providers/whatsapp')

test('.getAvatarUrl defaults to phone type', t => {
  t.is(
    getAvatarUrl('34660021551'),
    'https://api.whatsapp.com/send/?phone=34660021551'
  )
})

test('.getAvatarUrl with channel type', t => {
  t.is(
    getAvatarUrl('channel:0029VaARuQ7KwqSXh9fiMc0m'),
    'https://www.whatsapp.com/channel/0029VaARuQ7KwqSXh9fiMc0m'
  )
})

test('.getAvatarUrl with chat type', t => {
  t.is(
    getAvatarUrl('chat:GDoR4ELqJtb2bMy1JI2Hfq'),
    'https://chat.whatsapp.com/GDoR4ELqJtb2bMy1JI2Hfq'
  )
})

test('.getAvatarUrl with group type', t => {
  t.is(
    getAvatarUrl('group:GDoR4ELqJtb2bMy1JI2Hfq'),
    'https://chat.whatsapp.com/GDoR4ELqJtb2bMy1JI2Hfq'
  )
})

test('.getAvatarUrl throws for unsupported type', t => {
  const error = t.throws(() => getAvatarUrl('unsupported:value'))
  t.is(error.message, 'Unsupported WhatsApp type: unsupported')
})
