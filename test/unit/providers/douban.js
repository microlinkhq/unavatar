'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/douban')

const avatarUrl = 'https://img1.doubanio.com/icon/ul1000001-30.jpg'

test('.getAvatarUrl builds the people profile URL', t => {
  t.is(getAvatarUrl('ahbei'), 'https://www.douban.com/people/ahbei/')
})

test('.getAvatar returns the userface image', t => {
  const $ = cheerio.load(
    `<div class="basic-info"><img src="${avatarUrl}" class="userface" alt="" /></div>`
  )
  t.is(getAvatar($), avatarUrl)
})

test('.getAvatar returns undefined when there is no userface image', t => {
  const $ = cheerio.load('<html><body></body></html>')
  t.is(getAvatar($), undefined)
})
