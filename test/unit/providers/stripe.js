'use strict'

const test = require('ava')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/stripe')

const createStripe = got => require('../../../src/providers/stripe')({ got })

const avatarUrl =
  'https://files.stripe.com/files/MDB8YWNjdF8xSEFIM1JMdUk0ZHF6SlpDfGZfbGl2ZV9LeG13OEo3MkEwU3M0ZHhWdWFncVliNmg00AIuYej04'

test('.getAvatarUrl builds the business profile API URL', t => {
  t.is(
    getAvatarUrl('levelsio'),
    'https://api.stripe.com/v2/xauth_/network/business_profiles/levelsio'
  )
})

test('.getAvatarUrl strips a leading @', t => {
  t.is(
    getAvatarUrl('@levelsio'),
    'https://api.stripe.com/v2/xauth_/network/business_profiles/levelsio'
  )
})

test('.getAvatarUrl encodes the input', t => {
  t.is(
    getAvatarUrl('a b'),
    'https://api.stripe.com/v2/xauth_/network/business_profiles/a%20b'
  )
})

test('.getAvatar returns the branding icon', t => {
  t.is(getAvatar({ branding: { icon: { original: avatarUrl } } }), avatarUrl)
})

test('.getAvatar treats a missing or empty icon as a miss', t => {
  t.is(getAvatar({}), undefined)
  t.is(getAvatar({ branding: {} }), undefined)
  t.is(getAvatar({ branding: { icon: { original: null } } }), undefined)
  t.is(getAvatar({ branding: { icon: { original: '' } } }), undefined)
})

test('stripe resolves the avatar from the business profile API', async t => {
  const stripe = createStripe(async (url, opts) => {
    t.is(
      url,
      'https://api.stripe.com/v2/xauth_/network/business_profiles/levelsio'
    )
    t.is(opts.responseType, 'json')
    t.false(opts.throwHttpErrors)
    t.is(opts.headers['Stripe-Version'], 'unsafe-development')

    return {
      statusCode: 200,
      body: { branding: { icon: { original: avatarUrl } } }
    }
  })

  t.is(await stripe('@levelsio'), avatarUrl)
})

test('stripe returns undefined when the profile is missing', async t => {
  const stripe = createStripe(async () => ({
    statusCode: 404,
    body: {
      error: {
        code: 'not_found',
        message: 'Stripe business profile not found.'
      }
    }
  }))

  t.is(await stripe('missing'), undefined)
})

test('stripe returns undefined when the username is empty', async t => {
  const stripe = createStripe(async () => {
    t.fail('should not fetch')
  })

  t.is(await stripe(''), undefined)
  t.is(await stripe('@'), undefined)
})
