'use strict'

const getDataPage = $ =>
  $('#app').attr('data-page') || $('script[data-page="app"]').html()

const getAvatar = $ => {
  const dataPage = getDataPage($)
  if (!dataPage) return

  try {
    return JSON.parse(dataPage)?.props?.creator_data?.data?.dp
  } catch {
    const match = dataPage.match(/"dp":"([^"]+)"/)
    return match?.[1]?.replace(/\\\//g, '/')
  }
}

const factory = ({ createHtmlProvider }) =>
  createHtmlProvider({
    name: 'buymeacoffee',
    url: input => `https://buymeacoffee.com/${input}`,
    getter: getAvatar
  })

factory.getAvatar = getAvatar

module.exports = factory
