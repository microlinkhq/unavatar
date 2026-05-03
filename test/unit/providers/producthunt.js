'use strict'

const test = require('ava')
const cheerio = require('cheerio')

const {
  parseInput,
  isProductInput,
  getAvatarUrl,
  getProductHuntProductAvatar,
  getProductHuntPayloadAvatar,
  getProductHuntAvatar
} = require('../../../src/providers/producthunt')

test('.parseInput defaults to user input', t => {
  t.is(parseInput('kikobeats'), '@kikobeats')
})

test('.parseInput supports explicit user input', t => {
  t.is(parseInput('user:kikobeats'), '@kikobeats')
})

test('.parseInput supports explicit product input', t => {
  t.is(parseInput('product:optimo'), 'products/optimo')
})

test('.parseInput supports products shorthand input', t => {
  t.is(parseInput('products:yc'), 'products/yc')
})

test('.parseInput preserves products/ product input', t => {
  t.is(parseInput('product:products/optimo'), 'products/optimo')
})

test('.parseInput supports products/ product input', t => {
  t.is(parseInput('products/optimo'), 'products/optimo')
})

test('.isProductInput detects Product Hunt product inputs', t => {
  t.true(isProductInput('product:optimo'))
  t.true(isProductInput('products:yc'))
  t.true(isProductInput('products/optimo'))
  t.false(isProductInput('kikobeats'))
  t.false(isProductInput('product'))
  t.false(isProductInput('products'))
})

test('.getAvatarUrl returns Product Hunt profile URL', t => {
  t.is(getAvatarUrl('kikobeats'), 'https://www.producthunt.com/@kikobeats')
})

test('.getAvatarUrl preserves @ prefix from input', t => {
  t.is(getAvatarUrl('@kikobeats'), 'https://www.producthunt.com/@kikobeats')
})

test('.getAvatarUrl returns Product Hunt product URL', t => {
  t.is(
    getAvatarUrl('product:optimo'),
    'https://www.producthunt.com/products/optimo'
  )
})

test('.getAvatarUrl returns Product Hunt products shorthand URL', t => {
  t.is(getAvatarUrl('products:yc'), 'https://www.producthunt.com/products/yc')
})

test('.getProductHuntPayloadAvatar extracts avatarUrl from Apollo payload', t => {
  const html = `
    <html>
      <body>
        <script>
          (window[Symbol.for("ApolloSSRDataTransport")] ??= []).push({"rehydrate":{"_R_iv5ubrhj9ivb_":{"data":{"profile":{"__typename":"User","id":"7779","avatarUrl":"https://ph-avatars.imgix.net/7779/9ebe4123-985b-42ae-8a64-4dc597b7e666.png"}}}}})
        </script>
      </body>
    </html>
  `

  const $ = cheerio.load(html)

  t.is(
    getProductHuntPayloadAvatar($),
    'https://ph-avatars.imgix.net/7779/9ebe4123-985b-42ae-8a64-4dc597b7e666.png'
  )
})

test('.getProductHuntPayloadAvatar strips avatarUrl query params', t => {
  const html = `
    <html>
      <body>
        <script>
          window.__DATA__ = {"user":{"avatarUrl":"https://ph-avatars.imgix.net/7779/9ebe4123-985b-42ae-8a64-4dc597b7e666.png?auto=compress&codec=mozjpeg"}}
        </script>
      </body>
    </html>
  `

  const $ = cheerio.load(html)

  t.is(
    getProductHuntPayloadAvatar($),
    'https://ph-avatars.imgix.net/7779/9ebe4123-985b-42ae-8a64-4dc597b7e666.png'
  )
})

test('.getProductHuntAvatar extracts payload avatarUrl', t => {
  const html = `
    <html>
      <body>
        <script>
          window.__DATA__ = {"user":{"avatarUrl":"https://ph-avatars.imgix.net/7779/9ebe4123-985b-42ae-8a64-4dc597b7e666.png"}}
        </script>
      </body>
    </html>
  `

  const $ = cheerio.load(html)

  t.is(
    getProductHuntAvatar($),
    'https://ph-avatars.imgix.net/7779/9ebe4123-985b-42ae-8a64-4dc597b7e666.png'
  )
})

test('.getProductHuntProductAvatar extracts product logoUuid by slug', t => {
  const html = `
    <html>
      <body>
        <script>
          (window[Symbol.for("ApolloSSRDataTransport")] ??= []).push({"rehydrate":{"_R_product_":{"data":{"profile":{"selectedBylineProduct":{"__typename":"Product","id":"107939","name":"Y Combinator","logoUuid":"11da97b2-de36-4a3a-b394-66ad581b766c.png"}},"newProducts":{"edges":[{"node":{"__typename":"Product","id":"1179830","name":"GStack","slug":"gstack","logoUuid":"e85203b2-9ad1-42cc-9be9-5f3f2317e3af.svg"}},{"node":{"__typename":"Product","id":"107939","name":"Y Combinator","slug":"yc","logoUuid":"11da97b2-de36-4a3a-b394-66ad581b766c.png"}}]}}}}})
        </script>
      </body>
    </html>
  `

  const $ = cheerio.load(html)

  t.is(
    getProductHuntProductAvatar($, 'products:yc'),
    'https://ph-files.imgix.net/11da97b2-de36-4a3a-b394-66ad581b766c.png'
  )
})

test('.getProductHuntAvatar returns undefined when avatar is missing', t => {
  const $ = cheerio.load(
    '<html><body><img src="/assets/logo.png" /></body></html>'
  )
  t.is(getProductHuntAvatar($), undefined)
})
