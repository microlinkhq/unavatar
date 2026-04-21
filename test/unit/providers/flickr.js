'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const { getAvatarUrl, getAvatarFromMarkup } = require('../../../src/providers/flickr')

test('.getAvatarUrl defaults to user photostream path', t => {
  t.is(getAvatarUrl('stevebooth'), 'https://www.flickr.com/photos/stevebooth/')
})

test('.getAvatarUrl supports user NSID', t => {
  t.is(
    getAvatarUrl('user:94867603@N03'),
    'https://www.flickr.com/photos/94867603@N03/'
  )
})

test('.getAvatarUrl supports group path', t => {
  t.is(
    getAvatarUrl('group:best100only'),
    'https://www.flickr.com/groups/best100only/'
  )
})

test('.getAvatarUrl supports groups NSID', t => {
  t.is(
    getAvatarUrl('groups:80641914@N00'),
    'https://www.flickr.com/groups/80641914@N00/'
  )
})

test('.getAvatarUrl throws for unsupported type', t => {
  const error = t.throws(() => getAvatarUrl('album:foo'))
  t.is(error.message, 'Unsupported Flickr type: album')
})

test('.getter extracts buddy icon URL from profile style markup', t => {
  const $ = cheerio.load(`
    <div
      class="avatar"
      style="background-image: url(//live.staticflickr.com/544/buddyicons/94867603@N03_r.jpg?1483529005#94867603@N03);"
    ></div>
  `)

  t.is(
    getAvatarFromMarkup($),
    '//live.staticflickr.com/544/buddyicons/94867603@N03_r.jpg?1483529005#94867603@N03'
  )
})

test('.getter extracts buddy icon URL from group img markup', t => {
  const $ = cheerio.load(`
    <img
      class="sn-avatar-mask"
      src="https://farm8.staticflickr.com/7304/buddyicons/80641914@N00_r.jpg?1422640699"
    />
  `)

  t.is(
    getAvatarFromMarkup($),
    'https://farm8.staticflickr.com/7304/buddyicons/80641914@N00_r.jpg?1422640699'
  )
})

test('.getter extracts escaped buddy icon URL from script markup', t => {
  const $ = cheerio.load(`
    <script>
      {"avatar":"https:\\/\\/live.staticflickr.com\\/544\\/buddyicons\\/94867603@N03_r.jpg?1483529005#94867603@N03"}
    </script>
  `)

  t.is(
    getAvatarFromMarkup($),
    'https://live.staticflickr.com/544/buddyicons/94867603@N03_r.jpg?1483529005#94867603@N03'
  )
})
