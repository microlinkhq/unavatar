'use strict'

const test = require('ava')

const createHtmlProvider = opts => opts
const getOgImage = () => 'og-image'

test('youtube provider supports handles and channel ids', t => {
  const provider = require('../../../src/providers/youtube')({ createHtmlProvider, getOgImage })

  t.is(provider.url('natelive7'), 'https://www.youtube.com/@natelive7')
  t.is(provider.url('@natelive7'), 'https://www.youtube.com/@natelive7')
  t.is(provider.url('UC_x5XG1OV2P6uZZ5FSM9Ttw'), 'https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw')
  t.is(provider.url('UC1234'), 'https://www.youtube.com/@UC1234')
})
