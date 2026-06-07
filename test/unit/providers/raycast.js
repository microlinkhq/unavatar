'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const { getAvatarUrl, getAvatar } = require('../../../src/providers/raycast')

test('.getAvatarUrl builds raycast profile URL', t => {
  t.is(getAvatarUrl('kikobeats'), 'https://www.raycast.com/kikobeats')
})

test('.getAvatarUrl strips @ prefix', t => {
  t.is(getAvatarUrl('@kikobeats'), 'https://www.raycast.com/kikobeats')
})

test('.getAvatar supports next image src', t => {
  const $ = cheerio.load(`
    <div class="OwnerDetails_avatarAndName__M9xi3">
      <img
        alt="Avatar"
        loading="lazy"
        width="224"
        height="224"
        decoding="async"
        data-nimg="1"
        class="Avatar_avatar__UnKOO"
        style="color:transparent"
        srcset="/_next/image?url=https%3A%2F%2Ffiles.raycast.com%2Fd5uljy2flvjvc6gdiq4uro6ym4jy&amp;w=256&amp;q=70 1x, /_next/image?url=https%3A%2F%2Ffiles.raycast.com%2Fd5uljy2flvjvc6gdiq4uro6ym4jy&amp;w=640&amp;q=70 2x"
        src="/_next/image?url=https%3A%2F%2Ffiles.raycast.com%2Fd5uljy2flvjvc6gdiq4uro6ym4jy&amp;w=640&amp;q=70"
      />
      <div class="OwnerDetails_nameAndHandle__cJ1tZ">
        <h1 style="font-size:20px">Kiko Beats</h1>
        <div class="OwnerDetails_handle__LWp6b">
          <h2 style="font-size:16px;font-family:monospace;font-weight:normal">@kikobeats</h2>
        </div>
      </div>
    </div>
  `)

  t.is(getAvatar($), 'https://files.raycast.com/d5uljy2flvjvc6gdiq4uro6ym4jy')
})

test('.getAvatar supports direct cdn src', t => {
  const $ = cheerio.load(`
    <img alt="Avatar" src="https://files.raycast.com/d5uljy2flvjvc6gdiq4uro6ym4jy" />
  `)

  t.is(getAvatar($), 'https://files.raycast.com/d5uljy2flvjvc6gdiq4uro6ym4jy')
})

test('.getAvatar returns undefined when avatar is missing', t => {
  const $ = cheerio.load('<html><body></body></html>')
  t.is(getAvatar($), undefined)
})
