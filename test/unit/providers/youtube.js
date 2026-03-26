'use strict'

const test = require('ava')

const { getAvatarUrl } = require('../../../src/providers/youtube')

test('.getAvatarUrl prepends @ for plain username', t => {
  t.is(getAvatarUrl('natelive7'), 'https://www.youtube.com/@natelive7')
})

test('.getAvatarUrl keeps existing @ prefix', t => {
  t.is(getAvatarUrl('@natelive7'), 'https://www.youtube.com/@natelive7')
})

test('.getAvatarUrl uses channel path for 24-char UC ids', t => {
  t.is(
    getAvatarUrl('UC_x5XG1OV2P6uZZ5FSM9Ttw'),
    'https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw'
  )
})

test('.getAvatarUrl treats short UC prefix as username', t => {
  t.is(getAvatarUrl('UC1234'), 'https://www.youtube.com/@UC1234')
})
