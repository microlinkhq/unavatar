'use strict'

const { get } = require('lodash')
const { JSDOM } = require('jsdom')
const got = require('got')

module.exports = async username => {
  const { body } = await got(`https://www.instagram.com/${username}`)
  const { window } = new JSDOM(body, { runScripts: 'dangerously' })
  return get(
    window,
    '_sharedData.entry_data.ProfilePage[0].graphql.user.profile_pic_url_hd'
  )
}

module.exports.supported = {
  email: false,
  username: true
}
