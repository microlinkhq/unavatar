'use strict'

const test = require('ava')

test('whatsapp provider maps input types to expected URLs', t => {
  const createHtmlProvider = opts => opts
  const provider = require('../../../src/providers/whatsapp')({
    createHtmlProvider,
    getOgImage: () => 'og-image'
  })

  t.is(provider.url('34660021551'), 'https://api.whatsapp.com/send/?phone=34660021551')
  t.is(
    provider.url('channel:0029VaARuQ7KwqSXh9fiMc0m'),
    'https://www.whatsapp.com/channel/0029VaARuQ7KwqSXh9fiMc0m'
  )
  t.is(
    provider.url('chat:GDoR4ELqJtb2bMy1JI2Hfq'),
    'https://chat.whatsapp.com/GDoR4ELqJtb2bMy1JI2Hfq'
  )
  t.is(
    provider.url('group:GDoR4ELqJtb2bMy1JI2Hfq'),
    'https://chat.whatsapp.com/GDoR4ELqJtb2bMy1JI2Hfq'
  )
})

test('whatsapp provider throws for unsupported input type', t => {
  const createHtmlProvider = opts => opts
  const provider = require('../../../src/providers/whatsapp')({
    createHtmlProvider,
    getOgImage: () => 'og-image'
  })

  const error = t.throws(() => provider.url('unsupported:value'))
  t.is(error.message, 'Unsupported WhatsApp type: unsupported')
})
