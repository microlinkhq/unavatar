'use strict'

const cheerio = require('cheerio')
const path = require('path')
const ava = require('ava')
const fs = require('fs')

const { getAvatarUrl } = require('../../../src/providers/tiktok')

ava('.getAvatarUrl returns the correct avatar URL', t => {
  const html = fs.readFileSync(path.join(__dirname, 'tiktok.html'), 'utf8')
  const $ = cheerio.load(html)
  const avatarUrl = getAvatarUrl($)
  t.is(
    avatarUrl,
    'https://p16-pu-sign-no.tiktokcdn-eu.com/tos-no1a-avt-0068c001-no/340072a4400ed43a83d255f346b879aa~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=10399&refresh_token=02720a18&x-expires=1765267200&x-signature=tc69d0XimWmLbqH%2F2vOg941kpgE%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=no1a'
  )
})

ava('.getAvatarUrl returns undefined when universal payload is missing', t => {
  const $ = cheerio.load('<html><head></head><body></body></html>')
  t.is(getAvatarUrl($), undefined)
})
