'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const { getProfileUrl, getAvatarUrl } = require('../../../src/providers/stackoverflow')

test('.getProfileUrl builds users URL', t => {
  t.is(
    getProfileUrl('19082/mike-hordecki'),
    'https://stackoverflow.com/users/19082/mike-hordecki'
  )
})

test('.getProfileUrl supports input prefixed with users/', t => {
  t.is(
    getProfileUrl('users/19082/mike-hordecki'),
    'https://stackoverflow.com/users/19082/mike-hordecki'
  )
})

test('.getProfileUrl removes leading slash', t => {
  t.is(
    getProfileUrl('/users/19082/mike-hordecki'),
    'https://stackoverflow.com/users/19082/mike-hordecki'
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
