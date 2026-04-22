'use strict'

const { createGetSearchResults } = require('../util/itunes-search')

const ITUNES_LOOKUP_URL = 'https://itunes.apple.com/lookup'
const COUNTRY_CODE_REGEX = /^[a-z]{2}$/i

const getArtworkUrl = result =>
  result?.artworkUrl512 || result?.artworkUrl100 || result?.artworkUrl60

const withCountry = ({ query, country }) =>
  country ? `${query}&country=${encodeURIComponent(country)}` : query

const parseInput = input => {
  const separatorIndex = input.indexOf(':')
  if (separatorIndex === -1) return { type: 'app', value: input }

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

const getBundleAvatar = async ({ got, bundleId, country }) => {
  const query = withCountry({
    query: `bundleId=${encodeURIComponent(bundleId)}&entity=software&limit=1`,
    country
  })
  const [result] = await getLookupResults({ got, query })
  return getArtworkUrl(result)
}

const getAppNameAvatar = async ({ got, name, country, searchResults }) => {
  const getSearchResults = searchResults || createGetSearchResults({ got })
  const query = withCountry({
    query: `term=${encodeURIComponent(name)}&entity=software&limit=1`,
    country
  })
  const [result] = await getSearchResults(query)
  return getArtworkUrl(result)
}

const getDeveloperNameAvatar = async ({
  got,
  name,
  country,
  searchResults
}) => {
  const getSearchResults = searchResults || createGetSearchResults({ got })
  const query = withCountry({
    query: `term=${encodeURIComponent(
      name
    )}&entity=software&attribute=softwareDeveloper&limit=1`,
    country
  })
  const [result] = await getSearchResults(query)
  return getArtworkUrl(result)
}

module.exports = ({ got, itunesSearchCache }) => {
  const searchResults = createGetSearchResults({ got, itunesSearchCache })

  return async function appleStore (input) {
    const { type, value: rawValue } = parseInput(input)
    const { value, country } = parseCountry(rawValue)

    switch (type) {
      case 'app':
        return getAppAvatar({ got, id: value, country })
      case 'bundle':
        return getBundleAvatar({ got, bundleId: value, country })
      case 'app-name':
        return getAppNameAvatar({ got, name: value, country, searchResults })
      case 'dev-name':
        return getDeveloperNameAvatar({
          got,
          name: value,
          country,
          searchResults
        })
      default:
        throw new Error(`Unsupported Apple Store type: ${type}`)
    }
  }
}

module.exports.getAppAvatar = getAppAvatar
module.exports.getBundleAvatar = getBundleAvatar
module.exports.getAppNameAvatar = getAppNameAvatar
module.exports.getDeveloperNameAvatar = getDeveloperNameAvatar
