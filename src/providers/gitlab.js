'use strict'

const cheerio = require('cheerio')
const qsm = require('qsm')

const got = require('../util/got')

const { AVATAR_SIZE } = require('../constant')

module.exports = async function gitlab (username) {
  const { body } = await got(`https://gitlab.com/${username}`)
  const $ = cheerio.load(body)
  const avatarUrl = $('.avatar').attr('data-src')
  return qsm.exist(avatarUrl, 'width')
    ? qsm.add(avatarUrl, { width: AVATAR_SIZE })
    : avatarUrl
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
