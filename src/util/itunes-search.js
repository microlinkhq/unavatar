'use strict'

const memoize = require('@keyvhq/memoize')

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search'

const getSearchResults = async ({ got, query }) => {
  const body = await got(`${ITUNES_SEARCH_URL}?${query}`, {
    responseType: 'json',
    resolveBodyOnly: true
  })
  return body?.results ?? []
}

const createGetSearchResults = ({ got, itunesSearchCache }) => {
  const searchResults = query => getSearchResults({ got, query })
  if (!itunesSearchCache) return searchResults

  return memoize(searchResults, itunesSearchCache, {
    key: query => query.trim().toLowerCase()
  })
}

module.exports = { createGetSearchResults }
