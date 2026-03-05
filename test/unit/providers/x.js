'use strict'

const cheerio = require('cheerio')
const path = require('path')
const test = require('ava')
const fs = require('fs')

const { getProfileImage } = require('../../../src/providers/x')

test('.getProfileImage from JSON-LD when og:image is fallback', t => {
  const html = fs.readFileSync(path.join(__dirname, 'x-jsonld.html'), 'utf8')
  const $ = cheerio.load(html)
  const avatarUrl = getProfileImage($)
  t.is(avatarUrl, 'https://pbs.twimg.com/profile_images/1846292082501054464/oKUC44PF_400x400.jpg')
})

test('.getProfileImage from og:image and transforms to high resolution', t => {
  const html = fs.readFileSync(path.join(__dirname, 'x-og.html'), 'utf8')
  const $ = cheerio.load(html)
  const avatarUrl = getProfileImage($)
  t.is(avatarUrl, 'https://pbs.twimg.com/profile_images/1846292082501054464/oKUC44PF_400x400.jpg')
})

test('.getProfileImage transforms `_normal` image URLs to high resolution', t => {
  const html = `
    <html>
      <head>
        <meta property="og:image" content="https://pbs.twimg.com/profile_images/123/avatar_normal.jpg" />
      </head>
    </html>
  `
  const $ = cheerio.load(html)
  const avatarUrl = getProfileImage($)
  t.is(avatarUrl, 'https://pbs.twimg.com/profile_images/123/avatar_400x400.jpg')
})

test('.getProfileImage keeps non-twitter image URLs unchanged', t => {
  const html = `
    <html>
      <head>
        <meta property="og:image" content="https://example.com/avatar.jpg" />
      </head>
    </html>
  `
  const $ = cheerio.load(html)
  const avatarUrl = getProfileImage($)
  t.is(avatarUrl, 'https://example.com/avatar.jpg')
})

test('.provider returns undefined on 404 without proxying', async t => {
  let getHtmlCalls = 0
  let headerCalled = false

  const getHTML = async () => {
    getHtmlCalls++
    return { $: cheerio.load('<html />'), statusCode: 404 }
  }

  const htmlProviderFactory = require('../../../src/util/html-provider')
  const { createHtmlProvider } = htmlProviderFactory({ PROXY_TIMEOUT: 8000, getHTML })

  const provider = createHtmlProvider({
    name: 'x',
    url: input => `https://x.com/${input}`,
    getter: () => 'should-not-be-returned',
    htmlOpts: () => ({})
  })

  const result = await provider(
    {
      input: 'missing-user',
      opts: async () => ({}),
      req: { query: {}, customerId: undefined },
      res: { setHeader: () => (headerCalled = true) }
    },
    () => {}
  )

  t.is(result, undefined)
  t.is(getHtmlCalls, 1)
  t.false(headerCalled)
})

test('.getProfileImage returns undefined when profile is missing', t => {
  const html = `
    <html>
      <head>
        <meta property="og:title" content="Profile / X" data-rh="true" />
      </head>
      <body>This account doesn't exist</body>
    </html>
  `
  const $ = cheerio.load(html)
  const avatarUrl = getProfileImage($)
  t.is(avatarUrl, undefined)
})
