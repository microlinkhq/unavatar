'use strict'

const test = require('ava')

const createKeybase = require('../../../src/providers/keybase')
const { getAvatarUrl } = createKeybase

test('.getAvatarUrl builds single-user lookup URL', t => {
  t.is(
    getAvatarUrl('chris'),
    'https://keybase.io/_/api/1.0/user/lookup.json?username=chris&fields=pictures'
  )
})

test('.getAvatarUrl encodes input so it cannot add extra query params or users', t => {
  t.is(
    getAvatarUrl('chris,max&fields=basics'),
    'https://keybase.io/_/api/1.0/user/lookup.json?username=chris%2Cmax%26fields%3Dbasics&fields=pictures'
  )
})

test('keybase resolves primary picture URL', async t => {
  const keybase = createKeybase({
    got: async (url, opts) => {
      t.is(
        url,
        'https://keybase.io/_/api/1.0/user/lookup.json?username=chris&fields=pictures'
      )
      t.is(opts.responseType, 'json')
      t.false(opts.throwHttpErrors)

      return {
        statusCode: 200,
        body: {
          status: { code: 0, name: 'OK' },
          them: {
            id: '23260c2ce19420f97b58d7d95b68ca00',
            pictures: {
              primary: {
                url: 'https://s3.amazonaws.com/keybase_processed_uploads/4c7cff041ee54c71fd25595898133505_360_360.jpg',
                source: null
              }
            }
          }
        }
      }
    }
  })

  t.is(
    await keybase('chris'),
    'https://s3.amazonaws.com/keybase_processed_uploads/4c7cff041ee54c71fd25595898133505_360_360.jpg'
  )
})

test('keybase returns undefined when user is not found', async t => {
  const keybase = createKeybase({
    got: async () => ({
      statusCode: 200,
      body: {
        status: {
          code: 205,
          desc: 'zqxnotreal8812: user not found',
          name: 'NOT_FOUND'
        }
      }
    })
  })

  t.is(await keybase('zqxnotreal8812'), undefined)
})

test('keybase returns undefined when username is invalid', async t => {
  const keybase = createKeybase({
    got: async () => ({
      statusCode: 200,
      body: {
        status: {
          code: 100,
          desc: 'invalid name',
          fields: { username: 'invalid name' },
          name: 'INPUT_ERROR'
        }
      }
    })
  })

  t.is(await keybase('not-a-valid-name'), undefined)
})

test('keybase returns undefined when user has no picture', async t => {
  const keybase = createKeybase({
    got: async () => ({
      statusCode: 200,
      body: {
        status: { code: 0, name: 'OK' },
        them: { id: '1cc3e3f4873fe269addd105167053d00' }
      }
    })
  })

  t.is(await keybase('alice'), undefined)
})

test('keybase returns undefined on HTTP error', async t => {
  const keybase = createKeybase({
    got: async () => ({ statusCode: 429, body: undefined })
  })

  t.is(await keybase('chris'), undefined)
})
