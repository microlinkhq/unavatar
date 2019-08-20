'use strict'

const { filter } = require('lodash')
const { JSDOM } = require('jsdom')
const got = require('got')

const REGEX_PROFILE_URL = /^https?:\/\/(?:www\.)?deviantart\.com\/([\w\-]+)$/

module.exports = async username => {
  const { body } = await got(`https://www.deviantart.com/${username}`)
  const { window } = new JSDOM(body, { runScripts: 'dangerously' })
  const canonUsername = window.document
    .querySelector('head link[rel=canonical]')
    .getAttribute('href')
    .replace(REGEX_PROFILE_URL, '$1')
  const els = filter(
    window.document.querySelectorAll('img.avatar,a[data-hook=user_link][data-icon]'),
    el => {
      const thisUsername = el.getAttribute('data-username') || el.getAttribute('title')
      return canonUsername.toLowerCase() === thisUsername.toLowerCase()
    }
  )
  return els[0].getAttribute('data-icon') || els[0].getAttribute('src')
}

module.exports.supported = {
  email: false,
  username: true,
  domain: false
}
