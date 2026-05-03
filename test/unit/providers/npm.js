'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatarUrl, getAvatar } = require('../../../src/providers/npm')

test('.getAvatarUrl returns npm profile URL', t => {
  t.is(getAvatarUrl('kikobeats'), 'https://www.npmjs.com/~kikobeats')
})

test('.getAvatarUrl strips @ prefix from input', t => {
  t.is(getAvatarUrl('@kikobeats'), 'https://www.npmjs.com/~kikobeats')
})

test('.getAvatar extracts npm profile avatar', t => {
  const html = `
    <main id="main">
      <a href="http://en.gravatar.com/emails/" aria-label="Your profile picture">
        <img src="/npm-avatar/avatar-token" alt="" />
      </a>
      <img src="https://static-production.npmjs.com/package.svg" />
    </main>
  `
  const $ = cheerio.load(html)

  t.is(getAvatar($), 'https://www.npmjs.com/npm-avatar/avatar-token')
})

test('.getAvatar returns absolute profile avatar unchanged', t => {
  const $ = cheerio.load(`
    <a aria-label="Your profile picture">
      <img src="https://static-production.npmjs.com/avatar.png" />
    </a>
  `)

  t.is(getAvatar($), 'https://static-production.npmjs.com/avatar.png')
})

test('.getAvatar returns undefined when avatar is missing', t => {
  const $ = cheerio.load('<main><img src="/package-icon.svg" /></main>')

  t.is(getAvatar($), undefined)
})
