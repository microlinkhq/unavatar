'use strict'

const test = require('ava')

const {
  getAvatar,
  getAvatarUrl,
  parseInput
} = require('../../../src/providers/roblox')

const createRoblox = got => require('../../../src/providers/roblox')({ got })

const USERS_API_URL = 'https://users.roblox.com/v1/usernames/users'
const THUMBNAIL_URL =
  'https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=156&size=720x720&format=Png&isCircular=false'
const IMAGE_URL =
  'https://t1.rbxcdn.com/30DAY-AvatarHeadshot-635A2AA0A87D473B6136800B5B86F761-Png'

const completedThumbnail = {
  statusCode: 200,
  body: {
    data: [
      {
        targetId: 156,
        state: 'Completed',
        imageUrl: IMAGE_URL,
        version: 'TN3'
      }
    ]
  }
}

test('.parseInput treats bare input as a username', t => {
  t.deepEqual(parseInput('builderman'), {
    type: 'username',
    value: 'builderman'
  })
  t.deepEqual(parseInput('123'), { type: 'username', value: '123' })
})

test('.parseInput reads an id: prefix as a user id', t => {
  t.deepEqual(parseInput('id:156'), { type: 'id', value: '156' })
})

test('.getAvatarUrl builds the 720x720 headshot URL', t => {
  t.is(getAvatarUrl(156), THUMBNAIL_URL)
})

test('.getAvatar returns imageUrl for a completed thumbnail', t => {
  t.is(getAvatar(completedThumbnail.body), IMAGE_URL)
})

test('.getAvatar treats non-completed or empty thumbnails as a miss', t => {
  t.is(getAvatar({ data: [] }), undefined)
  t.is(getAvatar({}), undefined)
  t.is(
    getAvatar({ data: [{ state: 'Pending', imageUrl: IMAGE_URL }] }),
    undefined
  )
  t.is(getAvatar({ data: [{ state: 'Blocked', imageUrl: '' }] }), undefined)
  t.is(getAvatar({ data: [{ state: 'Completed', imageUrl: '' }] }), undefined)
})

test('roblox resolves a username to its headshot', async t => {
  const calls = []
  const roblox = createRoblox(async (url, opts) => {
    calls.push(url)
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    if (url === USERS_API_URL) {
      t.is(opts.method, 'POST')
      t.deepEqual(opts.json, {
        usernames: ['builderman'],
        excludeBannedUsers: true
      })
      return {
        statusCode: 200,
        body: { data: [{ requestedUsername: 'builderman', id: 156 }] }
      }
    }

    return completedThumbnail
  })

  t.is(await roblox('builderman'), IMAGE_URL)
  t.deepEqual(calls, [USERS_API_URL, THUMBNAIL_URL])
})

test('roblox skips the username lookup for an id: input', async t => {
  const calls = []
  const roblox = createRoblox(async url => {
    calls.push(url)
    return completedThumbnail
  })

  t.is(await roblox('id:156'), IMAGE_URL)
  t.deepEqual(calls, [THUMBNAIL_URL])
})

test('roblox returns undefined for a missing username', async t => {
  const calls = []
  const roblox = createRoblox(async url => {
    calls.push(url)
    return { statusCode: 200, body: { data: [] } }
  })

  t.is(await roblox('zzqx_no_such_user_9f3k2'), undefined)
  t.deepEqual(calls, [USERS_API_URL])
})

test('roblox returns undefined when the username lookup fails', async t => {
  const roblox = createRoblox(async () => ({
    statusCode: 429,
    body: { errors: [{ code: 0, message: 'Too many requests' }] }
  }))

  t.is(await roblox('builderman'), undefined)
})

test('roblox returns undefined for a non-numeric id: input', async t => {
  const calls = []
  const roblox = createRoblox(async url => {
    calls.push(url)
    return completedThumbnail
  })

  t.is(await roblox('id:builderman'), undefined)
  t.is(await roblox('id:'), undefined)
  t.deepEqual(calls, [])
})

test('roblox returns undefined when the thumbnail is not completed', async t => {
  const roblox = createRoblox(async () => ({
    statusCode: 200,
    body: { data: [{ targetId: 156, state: 'Pending', imageUrl: null }] }
  }))

  t.is(await roblox('id:156'), undefined)
})

test('roblox returns undefined for an unknown user id', async t => {
  const roblox = createRoblox(async () => ({
    statusCode: 200,
    body: { data: [] }
  }))

  t.is(await roblox('id:999999999999'), undefined)
})
