'use strict'

const PRODUCT_HUNT_FILES_URL = 'https://ph-files.imgix.net'
const PRODUCT_HUNT_PROVIDER = 'producthunt'

const getPayloadValue = (text, key) => {
  const [, value] = text.split(`"${key}":"`)
  return value ? value.split('"')[0].split('?')[0] : undefined
}

const getScripts = $ => $('script').toArray()

const parseInput = input => {
  const [first, ...rest] = input.split(':')
  const type = rest.length > 0 ? first : 'user'
  const id = rest.length > 0 ? rest.join(':') : first

  if (input.startsWith('products/')) return input
  if (type === 'product' || type === 'products') {
    return `products/${id.replace(/^products\//, '')}`
  }
  if (type === 'user') return id.startsWith('@') ? id : `@${id}`

  return input
}

const isProductInput = input => {
  const [type, ...rest] = input.split(':')
  const hasType = rest.length > 0

  if (!hasType) return input.startsWith('products/')
  if (type === 'product' || type === 'products') return true
  return false
}

const getAvatarUrl = input => `https://www.producthunt.com/${parseInput(input)}`

const getProductHuntSlug = input => parseInput(input).replace(/^products\//, '')

const getProductHuntPayloadAvatar = $ => {
  for (const el of getScripts($)) {
    const text = $(el).html() || ''
    const avatarUrl = getPayloadValue(text, 'avatarUrl')

    if (avatarUrl) return avatarUrl
  }

  return undefined
}

const getProductHuntProductAvatar = ($, input) => {
  const slug = getProductHuntSlug(input)

  for (const el of getScripts($)) {
    const text = $(el).html() || ''
    const slugIndex = text.indexOf(`"slug":"${slug}"`)
    const productText =
      slugIndex === -1
        ? text.split('"selectedBylineProduct":')[1]
        : text.slice(slugIndex)
    const imageUuid = productText && getPayloadValue(productText, 'logoUuid')

    if (imageUuid) return `${PRODUCT_HUNT_FILES_URL}/${imageUuid}`
  }

  return undefined
}

const getProductHuntAvatar = getProductHuntPayloadAvatar

module.exports = ({ createHtmlProvider }) => {
  const userProvider = createHtmlProvider({
    name: PRODUCT_HUNT_PROVIDER,
    url: getAvatarUrl,
    getter: getProductHuntAvatar
  })

  const provider = (input, context) => {
    if (!isProductInput(input)) return userProvider(input, context)

    return createHtmlProvider({
      name: PRODUCT_HUNT_PROVIDER,
      url: getAvatarUrl,
      getter: $ => getProductHuntProductAvatar($, input)
    })(input, context)
  }

  provider.getUrl = getAvatarUrl
  return provider
}

module.exports.parseInput = parseInput
module.exports.isProductInput = isProductInput
module.exports.getAvatarUrl = getAvatarUrl
module.exports.getProductHuntSlug = getProductHuntSlug
module.exports.getProductHuntPayloadAvatar = getProductHuntPayloadAvatar
module.exports.getProductHuntAvatar = getProductHuntAvatar
module.exports.getProductHuntProductAvatar = getProductHuntProductAvatar
