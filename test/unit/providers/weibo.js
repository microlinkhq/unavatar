'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const { getAvatar, getAvatarUrl } = require('../../../src/providers/weibo')

const NOT_FOUND = Symbol('NOT_FOUND')

const load = src =>
  cheerio.load(
    `<div class="mod-fil-img m-avatar-box"><div class="m-img-box"><img src="${src}"></div></div>`
  )

test('.getAvatarUrl builds the uid profile URL', t => {
  t.is(getAvatarUrl('2803301701'), 'https://m.weibo.cn/u/2803301701')
})

test('.getAvatarUrl builds the nickname profile URL', t => {
  t.is(
    getAvatarUrl('人民日报'),
    `https://m.weibo.cn/n/${encodeURIComponent('人民日报')}`
  )
})

test('.getAvatar rewrites the signed crop URL to the large variant', t => {
  const $ = load(
    'https://tvax4.sinaimg.cn/crop.0.0.1018.1018.180/0033ImPzly8h8vgemh8kxj60sa0sadgw02.jpg?KID=imgbed,tva&Expires=1781222288&ssig=A5a%2FuexYZn'
  )
  t.is(
    getAvatar({ $, NOT_FOUND }),
    'https://tvax4.sinaimg.cn/large/0033ImPzly8h8vgemh8kxj60sa0sadgw02.jpg'
  )
})

test('.getAvatar treats default avatars as a miss', t => {
  const $ = load(
    'https://tvax2.sinaimg.cn/default/images/default_avatar_male_180.gif'
  )
  t.is(getAvatar({ $, NOT_FOUND }), NOT_FOUND)
})

test('.getAvatar returns undefined when there is no avatar image', t => {
  const $ = cheerio.load('<html><body></body></html>')
  t.is(getAvatar({ $, NOT_FOUND }), undefined)
})
