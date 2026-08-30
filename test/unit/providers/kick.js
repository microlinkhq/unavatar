'use strict'

const test = require('ava')
const sinon = require('sinon')

const createKick = got => require('../../../src/providers/kick')({ got })

test('provider calls the channels API and returns the profile picture', async t => {
  const avatarUrl =
    'https://files.kick.com/images/user/676/profile_image/conversion/avatar-fullsize.webp'
  const got = sinon.stub().resolves({
    body: { user: { profile_pic: avatarUrl } }
  })

  const kick = createKick(got)
  const result = await kick('xqc')

  t.is(result, avatarUrl)
  t.true(got.calledOnce)
  t.is(got.firstCall.args[0], 'https://kick.com/api/v2/channels/xqc')
})

test('provider returns undefined when the channel has no picture', async t => {
  const got = sinon.stub().resolves({ body: { user: {} } })

  const kick = createKick(got)
  const result = await kick('someone')

  t.is(result, undefined)
})

test('provider encodes the input in the request url', async t => {
  const got = sinon.stub().resolves({ body: { user: {} } })

  const kick = createKick(got)
  await kick('a b')

  t.is(got.firstCall.args[0], 'https://kick.com/api/v2/channels/a%20b')
})
