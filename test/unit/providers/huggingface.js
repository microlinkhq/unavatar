'use strict'

const sinon = require('sinon')
const test = require('ava')

const {
  getOrganizationOverviewUrl,
  getUserOverviewUrl
} = require('../../../src/providers/huggingface')

const createHuggingFace = got =>
  require('../../../src/providers/huggingface')({ got })

test('.getUserOverviewUrl builds user API URL', t => {
  t.is(
    getUserOverviewUrl('gyq1999'),
    'https://huggingface.co/api/users/gyq1999/overview'
  )
})

test('.getOrganizationOverviewUrl builds organization API URL', t => {
  t.is(
    getOrganizationOverviewUrl('deepseek-ai'),
    'https://huggingface.co/api/organizations/deepseek-ai/overview'
  )
})

test('huggingface resolves user avatar URL', async t => {
  const got = sinon.stub().resolves({
    statusCode: 200,
    body: {
      avatarUrl:
        'https://cdn-avatars.huggingface.co/v1/production/uploads/no-auth/user.png'
    }
  })
  const huggingface = createHuggingFace(got)

  const avatarUrl = await huggingface('gyq1999')

  t.is(
    avatarUrl,
    'https://cdn-avatars.huggingface.co/v1/production/uploads/no-auth/user.png'
  )
  t.true(got.calledOnce)
  t.deepEqual(got.firstCall.args, [
    'https://huggingface.co/api/users/gyq1999/overview',
    {
      responseType: 'json',
      throwHttpErrors: false
    }
  ])
})

test('huggingface falls back to organization avatar URL', async t => {
  const got = sinon.stub()
  got.onFirstCall().resolves({ statusCode: 404, body: { error: 'Not found' } })
  got.onSecondCall().resolves({
    statusCode: 200,
    body: {
      avatarUrl:
        'https://cdn-avatars.huggingface.co/v1/production/uploads/org.png'
    }
  })

  const huggingface = createHuggingFace(got)
  const avatarUrl = await huggingface('deepseek-ai')

  t.is(
    avatarUrl,
    'https://cdn-avatars.huggingface.co/v1/production/uploads/org.png'
  )
  t.true(got.calledTwice)
  t.is(
    got.secondCall.args[0],
    'https://huggingface.co/api/organizations/deepseek-ai/overview'
  )
})

test('huggingface returns undefined when no avatar is available', async t => {
  const got = sinon.stub().resolves({ statusCode: 200, body: {} })
  const huggingface = createHuggingFace(got)

  const avatarUrl = await huggingface('missing-avatar')

  t.is(avatarUrl, undefined)
  t.true(got.calledTwice)
})
