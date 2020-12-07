'use strict'

const { get } = require('lodash')
const { JSDOM } = require('jsdom')
const got = require('got')

const AVATAR_URL = {
  big: 'graphql.user.profile_pic_url_hd',
  normal: 'graphql.user.profile_pic_url'
}

module.exports = async username => {
  const body = await got(`https://www.instagram.com/${username}/?__a=1`).json()
  const avatarUrl = get(window, AVATAR_URL.big) || get(window, AVATAR_URL.normal)
  return avatarUrl ? new URL(avatarUrl).toString() : null
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
