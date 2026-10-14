'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const getOgImage = require('../../../src/util/get-og-image')
const createHtmlProviderFactory = require('../../../src/util/html-provider')

const { parseInput, getAvatarUrl } = require('../../../src/providers/goodreads')

const USER_PHOTO = 'https://images.gr-assets.com/users/1506617226p5/1.jpg'
const AUTHOR_PHOTO = 'https://images.gr-assets.com/authors/1616277702p8/4.jpg'
const USER_NO_PHOTO =
  'https://s.gr-assets.com/assets/nophoto/user/f_200x266-3061b784cc8e7f021c6430c9aba94587.png'

const ogImageHtml = content =>
  `<html><head><meta property="og:image" content="${content}"/></head></html>`

const createGoodreads = pages => {
  const requestedUrls = []
  const getHTML = async url => {
    requestedUrls.push(url)
    const { statusCode = 200, html = '' } = pages[url] ?? { statusCode: 404 }
    return { $: cheerio.load(html), statusCode }
  }
  const ctx = createHtmlProviderFactory({ PROXY_TIMEOUT: 8000, getHTML })
  const goodreads = require('../../../src/providers/goodreads')({
    ...ctx,
    getOgImage
  })
  return { goodreads, requestedUrls }
}

test('.parseInput defaults to user type', t => {
  t.deepEqual(parseInput('otis'), { type: 'user', id: 'otis' })
  t.deepEqual(parseInput('author:4'), { type: 'author', id: '4' })
})

test('.getAvatarUrl routes numeric user ids to the user show page', t => {
  t.is(getAvatarUrl('1'), 'https://www.goodreads.com/user/show/1')
  t.is(
    getAvatarUrl('1-otis-chandler'),
    'https://www.goodreads.com/user/show/1-otis-chandler'
  )
  t.is(
    getAvatarUrl('user:1-otis-chandler'),
    'https://www.goodreads.com/user/show/1-otis-chandler'
  )
})

test('.getAvatarUrl routes vanity usernames to the vanity URL', t => {
  t.is(getAvatarUrl('otis'), 'https://www.goodreads.com/otis')
  t.is(getAvatarUrl('123abc'), 'https://www.goodreads.com/123abc')
  t.is(getAvatarUrl('a/b?c'), 'https://www.goodreads.com/a%2Fb%3Fc')
})

test('.getAvatarUrl routes authors to the author show page', t => {
  t.is(getAvatarUrl('author:4'), 'https://www.goodreads.com/author/show/4')
  t.is(
    getAvatarUrl('author:4.Douglas_Adams'),
    'https://www.goodreads.com/author/show/4.Douglas_Adams'
  )
})

test('.getAvatarUrl rejects unknown types', t => {
  t.throws(() => getAvatarUrl('group:1'), {
    message: 'Unsupported Goodreads type: group'
  })
})

test('resolves a vanity username to the largest user photo', async t => {
  const { goodreads, requestedUrls } = createGoodreads({
    'https://www.goodreads.com/otis': { html: ogImageHtml(USER_PHOTO) }
  })

  t.is(
    await goodreads('otis'),
    'https://images.gr-assets.com/users/1506617226p8/1.jpg'
  )
  t.deepEqual(requestedUrls, ['https://www.goodreads.com/otis'])
})

test('resolves a numeric user id to the largest user photo', async t => {
  const { goodreads } = createGoodreads({
    'https://www.goodreads.com/user/show/1': { html: ogImageHtml(USER_PHOTO) }
  })

  t.is(
    await goodreads('1'),
    'https://images.gr-assets.com/users/1506617226p8/1.jpg'
  )
})

test('resolves an author id to the author photo', async t => {
  const { goodreads } = createGoodreads({
    'https://www.goodreads.com/author/show/4': {
      html: ogImageHtml(AUTHOR_PHOTO)
    }
  })

  t.is(
    await goodreads('author:4'),
    'https://images.gr-assets.com/authors/1616277702p8/4.jpg'
  )
})

test('treats the nophoto placeholder as a miss', async t => {
  const { goodreads } = createGoodreads({
    'https://www.goodreads.com/user/show/4': {
      html: ogImageHtml(USER_NO_PHOTO)
    }
  })

  t.is(await goodreads('4'), undefined)
})

test('.parseInput rejects empty or surplus fields', t => {
  t.is(parseInput('author:'), undefined)
  t.is(parseInput(':4'), undefined)
  t.is(parseInput('author:4:5'), undefined)
})

test('returns undefined for malformed input without fetching', async t => {
  const { goodreads, requestedUrls } = createGoodreads({})

  t.is(await goodreads('author:'), undefined)
  t.is(await goodreads('author:4:5'), undefined)
  t.deepEqual(requestedUrls, [])
})

test('returns undefined for a missing user', async t => {
  const { goodreads } = createGoodreads({
    'https://www.goodreads.com/thisuserdoesnotexist12345xyz': {
      statusCode: 404,
      html: '<html><head><title>Page not found</title></head></html>'
    }
  })

  t.is(await goodreads('thisuserdoesnotexist12345xyz'), undefined)
})
