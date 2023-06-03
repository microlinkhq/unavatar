'use strict'

const PCancelable = require('p-cancelable')
const cheerio = require('cheerio')
const qsm = require('qsm')

const getHTML = require('../util/html-get')

const { AVATAR_SIZE } = require('../constant')

module.exports = PCancelable.fn(async function gitlab ({ input }, onCancel) {
  const promise = getHTML(`https://gitlab.com/${input}`)
  onCancel(() => promise.onCancel())
  const { html } = await promise
  const $ = cheerio.load(html)

  let avatarUrl = $('.avatar-holder > a > img').attr('src')
  if (avatarUrl) avatarUrl = `https://gitlab.com${avatarUrl}`

  return qsm.exist(avatarUrl, 'width')
    ? qsm.add(avatarUrl, { width: AVATAR_SIZE })
    : avatarUrl
})

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
