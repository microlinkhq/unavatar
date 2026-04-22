'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const { getProfileUrl, getAvatarUrl } = require('../../../src/providers/stackoverflow')

test('.getProfileUrl builds users URL from ID', t => {
  t.is(getProfileUrl('576911'), 'https://stackoverflow.com/users/576911')
})

test('.getProfileUrl supports input prefixed with users/', t => {
  t.is(
    getProfileUrl('users/576911'),
    'https://stackoverflow.com/users/576911'
  )
})

test('.getProfileUrl keeps only user ID when a slug is present', t => {
  t.is(
    getProfileUrl('/users/576911/example-slug'),
    'https://stackoverflow.com/users/576911'
  )
})

test('.getAvatarUrl resolves expected avatar from inline stackoverflow markup', t => {
  const html = `
    <html>
      <body>
        <div class="js-usermini-avatar-container">
          <img src="https://www.gravatar.com/avatar/27c58ba8661585b00b571efab36af60f?s=256&amp;d=identicon&amp;r=PG" width="128" />
        </div>
        <div class="js-usermini-avatar-container">
          <img src="https://www.gravatar.com/avatar/27c58ba8661585b00b571efab36af60f?s=192&amp;d=identicon&amp;r=PG" width="96" />
        </div>
      </body>
    </html>
  `
  const $ = cheerio.load(html)

  t.is(
    getAvatarUrl($),
    'https://www.gravatar.com/avatar/27c58ba8661585b00b571efab36af60f?s=256&d=identicon&r=PG'
  )
})
