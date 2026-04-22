'use strict'

const { createGetSearchResults } = require('../util/itunes-search')

const ITUNES_LOOKUP_URL = 'https://itunes.apple.com/lookup'
const COUNTRY_CODE_REGEX = /^[a-z]{2}$/i

const getArtworkUrl = result =>
  result?.artworkUrl512 || result?.artworkUrl100 || result?.artworkUrl60

const normalizeName = value =>
  typeof value === 'string'
    ? value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
    : ''

const isAppNameMatch = ({ result, name }) => {
  const query = normalizeName(name)
  if (!query) return false

  const trackName = normalizeName(result?.trackName)
  const trackCensoredName = normalizeName(result?.trackCensoredName)

  return trackName === query || trackCensoredName === query
}

const withCountry = ({ query, country }) =>
  country ? `${query}&country=${encodeURIComponent(country)}` : query

const parseInput = input => {
  const separatorIndex = input.indexOf(':')
  if (separatorIndex === -1) return { type: 'id', value: input }

  return {
    type: input.slice(0, separatorIndex),
    value: input.slice(separatorIndex + 1)
  }
}

const parseCountry = value => {
  const separatorIndex = value.lastIndexOf('@')
  if (separatorIndex === -1) return { value, country: undefined }

  const country = value.slice(separatorIndex + 1)
  if (!COUNTRY_CODE_REGEX.test(country)) return { value, country: undefined }

  const nextValue = value.slice(0, separatorIndex)
  if (!nextValue) return { value, country: undefined }

  return {
    value: nextValue,
    country: country.toLowerCase()
  }
}

const getLookupResults = async ({ got, query }) => {
  const body = await got(`${ITUNES_LOOKUP_URL}?${query}`, {
    responseType: 'json',
    resolveBodyOnly: true
  })
  return body?.results ?? []
}

const getAppAvatar = async ({ got, id, country }) => {
  const query = withCountry({
    query: `id=${encodeURIComponent(id)}&entity=software&limit=1`,
    country
  })
  const [result] = await getLookupResults({ got, query })
  return getArtworkUrl(result)
}

const getAppNameAvatar = async ({ got, name, country, searchResults }) => {
  const getSearchResults = searchResults || createGetSearchResults({ got })
  const query = withCountry({
    query: `term=${encodeURIComponent(name)}&entity=software&limit=5`,
    country
  })
  const results = await getSearchResults(query)
  const result = results.find(result => isAppNameMatch({ result, name }))
  return getArtworkUrl(result)
}

module.exports = ({ got, itunesSearchCache }) => {
  const searchResults = createGetSearchResults({ got, itunesSearchCache })

  return async function appleStore (input) {
    const { type, value: rawValue } = parseInput(input)
    const { value, country } = parseCountry(rawValue)

    switch (type) {
      case 'id':
        return getAppAvatar({ got, id: value, country })
      case 'name':
        return getAppNameAvatar({ got, name: value, country, searchResults })
      default:
        throw new Error(`Unsupported Apple Store type: ${type}`)
    }
  }
}

module.exports.getAppAvatar = getAppAvatar
module.exports.getAppNameAvatar = getAppNameAvatar
