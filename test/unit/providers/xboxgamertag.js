'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const { getAvatarUrl } = require('../../../src/providers/xboxgamertag')

test('.getAvatarUrl builds search URL', t => {
  t.is(getAvatarUrl('P3'), 'https://xboxgamertag.com/search/P3')
})

test('.getAvatarUrl encodes special characters', t => {
  t.is(
    getAvatarUrl('Major Nelson'),
    'https://xboxgamertag.com/search/Major%20Nelson'
  )
})

const createHtmlProvider = opts => opts

const xboxgamertag = require('../../../src/providers/xboxgamertag')({
  createHtmlProvider
})

test('getter extracts the profile avatar from xboxgamertag markup', t => {
  const $ = cheerio.load(`
    <div class="page-header">
      <div class="row">
        <div class="col-auto avatar">
          <a href="/search/P3">
            <img
              class="rounded img-thumbnail"
              src="//images.weserv.nl/?url=https://images-eds-ssl.xboxlive.com/image?url=example&amp;format=png&amp;maxage=1d&amp;output=webp&amp;w=90&amp;h=90"
            >
          </a>
        </div>
      </div>
    </div>
  `)

  t.is(
    xboxgamertag.getter($),
    'https://images.weserv.nl/?url=https://images-eds-ssl.xboxlive.com/image?url=example&format=png&maxage=1d&output=webp&w=90&h=90'
  )
})
