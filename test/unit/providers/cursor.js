'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const { getAvatarUrl, getAvatar } = require('../../../src/providers/cursor')

test('.getAvatarUrl prepends @ when missing', t => {
  t.is(getAvatarUrl('eric'), 'https://cursor.com/@eric')
})

test('.getAvatarUrl keeps existing @ prefix', t => {
  t.is(getAvatarUrl('@eric'), 'https://cursor.com/@eric')
})

test('.getAvatar extracts CDN url from img matched by display name', t => {
  const $ = cheerio.load(`
    <h1 class="truncate text-xl font-semibold leading-tight text-primary">Eric Zakariasson</h1>
    <img
      alt="Eric Zakariasson"
      loading="lazy"
      width="48"
      height="48"
      srcset="/_next/image?url=https%3A%2F%2Fcursor-cdn.com%2Fprofile-pictures%2F0a0087018836d4ab41793b40d4e1e3fa%2Fb9a913bc-eb36-40fa-9ec9-441057ea3bb3.jpg&amp;w=48&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fcursor-cdn.com%2Fprofile-pictures%2F0a0087018836d4ab41793b40d4e1e3fa%2Fb9a913bc-eb36-40fa-9ec9-441057ea3bb3.jpg&amp;w=96&amp;q=75 2x"
      src="https://cursor.com/_next/image?url=https%3A%2F%2Fcursor-cdn.com%2Fprofile-pictures%2F0a0087018836d4ab41793b40d4e1e3fa%2Fb9a913bc-eb36-40fa-9ec9-441057ea3bb3.jpg&amp;w=96&amp;q=75"
    />
  `)

  t.is(
    getAvatar($),
    'https://cursor-cdn.com/profile-pictures/0a0087018836d4ab41793b40d4e1e3fa/b9a913bc-eb36-40fa-9ec9-441057ea3bb3.jpg'
  )
})

test('.getAvatar falls back to srcset when src is missing', t => {
  const $ = cheerio.load(`
    <h1>Eric Zakariasson</h1>
    <img
      alt="Eric Zakariasson"
      srcset="/_next/image?url=https%3A%2F%2Fcursor-cdn.com%2Fprofile-pictures%2F0a0087018836d4ab41793b40d4e1e3fa%2Fb9a913bc-eb36-40fa-9ec9-441057ea3bb3.jpg&amp;w=96&amp;q=75 2x"
    />
  `)

  t.is(
    getAvatar($),
    'https://cursor-cdn.com/profile-pictures/0a0087018836d4ab41793b40d4e1e3fa/b9a913bc-eb36-40fa-9ec9-441057ea3bb3.jpg'
  )
})

test('.getAvatar returns undefined when profile picture is missing', t => {
  const $ = cheerio.load('<html><body></body></html>')
  t.is(getAvatar($), undefined)
})
