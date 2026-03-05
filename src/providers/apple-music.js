'use strict'

const { $jsonld } = require('@metascraper/helpers')
const memoize = require('@keyvhq/memoize')
const ms = require('ms')

const APPLE_MUSIC_ID_REGEX = /^\d+$/
const APPLE_MUSIC_STOREFRONT = 'us'
const APPLE_MUSIC_ENTITY_TYPES = {
  album: { entity: 'album', idKey: 'collectionId' },
  artist: { entity: 'musicArtist', idKey: 'artistId' },
  song: { entity: 'song', idKey: 'trackId' }
}

const APPLE_MUSIC_SEARCH_TYPES = ['artist', 'song', 'album']
const ITUNES_SEARCH_CACHE_TTL = ms('7d')

const isNumericId = value => {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0
  }

  if (typeof value === 'string' && APPLE_MUSIC_ID_REGEX.test(value)) {
    const parsed = Number.parseInt(value, 10)
    return Number.isSafeInteger(parsed) && parsed > 0
  }

  return false
}

const parseInput = input => {
  const separatorIndex = input.indexOf(':')
  const hasExplicitType = separatorIndex !== -1
  const type = hasExplicitType ? input.slice(0, separatorIndex) : undefined
  const id = hasExplicitType ? input.slice(separatorIndex + 1) : input

  return { hasExplicitType, type, id }
}

module.exports = ({ createHtmlProvider, createRedisCache, got }) => {
  const itunesSearchCache = createRedisCache({
    namespace: 'itunes-search',
    ttl: ITUNES_SEARCH_CACHE_TTL
  })

  const searchEntityId = memoize(
    async ({ query, type }) => {
      const entityConfig = APPLE_MUSIC_ENTITY_TYPES[type]
      if (!entityConfig) return null
      const { entity, idKey } = entityConfig

      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
        query
      )}&entity=${entity}&limit=1`
      const body = await got(url, {
        responseType: 'json',
        resolveBodyOnly: true
      })

      const entityId = body?.results?.[0]?.[idKey]
      return isNumericId(entityId) ? String(entityId) : null
    },
    itunesSearchCache,
    {
      key: ({ query, type }) => `${type}:${query.trim().toLowerCase()}`,
      ttl: ITUNES_SEARCH_CACHE_TTL
    }
  )

  const appleMusicURI = async input => {
    const { hasExplicitType, type, id } = parseInput(input)

    if (!hasExplicitType) {
      for (const searchType of APPLE_MUSIC_SEARCH_TYPES) {
        const entityId = await searchEntityId({ query: id, type: searchType })
        if (entityId) return `${APPLE_MUSIC_STOREFRONT}/${searchType}/${entityId}`
      }

      return `${APPLE_MUSIC_STOREFRONT}/search?term=${encodeURIComponent(id)}`
    }

    if (!APPLE_MUSIC_ENTITY_TYPES[type]) {
      return `${type}/${isNumericId(id) ? id : encodeURIComponent(id)}`
    }

    if (isNumericId(id)) return `${APPLE_MUSIC_STOREFRONT}/${type}/${id}`

    const entityId = await searchEntityId({ query: id, type })
    return `${APPLE_MUSIC_STOREFRONT}/${type}/${entityId || encodeURIComponent(id)}`
  }

  return createHtmlProvider({
    name: 'apple-music',
    url: async input => `https://music.apple.com/${await appleMusicURI(input)}`,
    getter: $ => $jsonld('image')($)
  })
}
