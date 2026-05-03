'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const {
  getAvatarUrl,
  getAvatar
} = require('../../../src/providers/stackoverflow')

test('.getAvatarUrl builds users URL from ID', t => {
  t.is(getAvatarUrl('576911'), 'https://stackoverflow.com/users/576911')
})

test('.getAvatarUrl supports input prefixed with users/', t => {
  t.is(getAvatarUrl('users/576911'), 'https://stackoverflow.com/users/576911')
})

test('.getAvatarUrl keeps only user ID when a slug is present', t => {
  t.is(
    getAvatarUrl('/users/576911/example-slug'),
    'https://stackoverflow.com/users/576911'
  )
})

test('.getAvatar resolves expected avatar from inline stackoverflow markup', t => {
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
    getAvatar($),
    'https://www.gravatar.com/avatar/27c58ba8661585b00b571efab36af60f?s=256&d=identicon&r=PG'
  )
})
