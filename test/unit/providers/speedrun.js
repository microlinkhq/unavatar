'use strict'

const test = require('ava')

const { getAvatarUrl, getAvatar } = require('../../../src/providers/speedrun')

const createSpeedrun = got =>
  require('../../../src/providers/speedrun')({ got })

test('.getAvatarUrl builds encoded user API URL', t => {
  t.is(getAvatarUrl('cheese'), 'https://www.speedrun.com/api/v1/users/cheese')
  t.is(getAvatarUrl('a/b?c'), 'https://www.speedrun.com/api/v1/users/a%2Fb%3Fc')
})

test('.getAvatar adds a file extension to the image path', t => {
  t.is(
    getAvatar({
      data: {
        assets: {
          image: {
            uri: 'https://www.speedrun.com/static/user/v814mkp8/image?v=577e769'
          }
        }
      }
    }),
    'https://www.speedrun.com/static/user/v814mkp8/image.png?v=577e769'
  )
})

test('.getAvatar keeps an existing file extension', t => {
  t.is(
    getAvatar({
      data: {
        assets: {
          image: {
            uri: 'https://www.speedrun.com/static/user/v814mkp8/image.jpg?v=1'
          }
        }
      }
    }),
    'https://www.speedrun.com/static/user/v814mkp8/image.jpg?v=1'
  )
})

test('.getAvatar ignores the icon when there is no profile image', t => {
  t.is(
    getAvatar({
      data: {
        assets: {
          icon: {
            uri: 'https://www.speedrun.com/static/user/qjne76wj/icon?v=de59833'
          },
          image: { uri: null }
        }
      }
    }),
    undefined
  )
})

test('speedrun resolves the profile image from the user API', async t => {
  const speedrun = createSpeedrun(async (url, opts) => {
    t.is(url, 'https://www.speedrun.com/api/v1/users/Niftski')
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)

    return {
      statusCode: 200,
      body: {
        data: {
          id: 'qjne76wj',
          assets: {
            icon: {
              uri: 'https://www.speedrun.com/static/user/qjne76wj/icon?v=de59833'
            },
            supporterIcon: null,
            image: {
              uri: 'https://www.speedrun.com/static/user/qjne76wj/image?v=50685a6'
            }
          }
        }
      }
    }
  })

  t.is(
    await speedrun('Niftski'),
    'https://www.speedrun.com/static/user/qjne76wj/image.png?v=50685a6'
  )
})

test('speedrun returns undefined when user has no image', async t => {
  const speedrun = createSpeedrun(async () => ({
    statusCode: 200,
    body: {
      data: {
        id: 'v815d1pj',
        assets: {
          icon: { uri: null },
          supporterIcon: null,
          image: { uri: null }
        }
      }
    }
  }))

  t.is(await speedrun('cheese05'), undefined)
})

test('speedrun returns undefined when user is missing', async t => {
  const speedrun = createSpeedrun(async () => ({
    statusCode: 404,
    body: {
      status: 404,
      message: 'User zzzunavatarnope123 could not be found.'
    }
  }))

  t.is(await speedrun('zzzunavatarnope123'), undefined)
})
