'use strict'

const test = require('ava')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/tieba')

const createTieba = got => require('../../../src/providers/tieba')({ got })

const portrait = 'tb.1.d65fe516.CUxyCWneZ26g9_b7evuyfA'

test('.getAvatarUrl builds the user_json API URL', t => {
  t.is(
    getAvatarUrl('Mojang'),
    'https://tieba.baidu.com/i/sys/user_json?un=Mojang&ie=utf-8'
  )
})

test('.getAvatar returns the portrait URL', t => {
  const body = { creator: { portrait } }
  t.is(getAvatar(body), `https://himg.bdimg.com/sys/portrait/item/${portrait}`)
})

test('.getAvatar treats a missing portrait as a miss', t => {
  t.is(getAvatar({}), undefined)
})

test('tieba resolves the portrait from the user_json API', async t => {
  const tieba = createTieba(async (url, opts) => {
    t.is(url, 'https://tieba.baidu.com/i/sys/user_json?un=Mojang&ie=utf-8')
    t.is(opts.responseType, 'text')
    t.false(opts.throwHttpErrors)

    return {
      statusCode: 200,
      body: JSON.stringify({ creator: { portrait } })
    }
  })

  t.is(
    await tieba('Mojang'),
    `https://himg.bdimg.com/sys/portrait/item/${portrait}`
  )
})

test('tieba returns undefined when the response body is empty', async t => {
  const tieba = createTieba(async () => ({ statusCode: 200, body: '' }))

  t.is(await tieba('missing'), undefined)
})

test('tieba returns undefined when the response body is not JSON', async t => {
  const tieba = createTieba(async () => ({
    statusCode: 200,
    body: '<html></html>'
  }))

  t.is(await tieba('missing'), undefined)
})
