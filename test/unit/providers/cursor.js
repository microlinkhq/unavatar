'use strict'

const cheerio = require('cheerio')
const test = require('ava')

const { getAvatarUrl, getAvatar } = require('../../../src/providers/cursor')

test('.getAvatarUrl prepends @ when missing', t => {
  t.is(getAvatarUrl('kikobeats'), 'https://cursor.com/@kikobeats')
})

test('.getAvatarUrl keeps existing @ prefix', t => {
  t.is(getAvatarUrl('@kikobeats'), 'https://cursor.com/@kikobeats')
})

test('.getAvatar supports direct cdn src', t => {
  const $ = cheerio.load(`
    <div class="flex min-w-0 items-center gap-4">
      <div class="flex-shrink-0 overflow-hidden rounded-lg border border-tertiary" style="width: 48px; height: 48px;">
        <img
          alt="Kiko's Beats"
          loading="lazy"
          width="48"
          height="48"
          decoding="async"
          data-nimg="1"
          class="h-full w-full object-cover"
          src="https://workoscdn.com/images/v1/I1sX_zeoYHmkSaLu9QmC-G4D5YmKE_gV41LCcUYoJDA"
          style="color: transparent;"
        />
      </div>
      <div class="min-w-0">
        <h1 class="truncate text-xl font-semibold leading-tight text-primary">Kiko's Beats</h1>
        <div class="mt-0.5 flex flex-wrap items-center gap-2">
          <a class="text-base font-medium text-secondary hover:text-primary hover:underline" href="/dashboard/settings#profile">@kikobeats</a>
        </div>
      </div>
    </div>
  `)

  t.is(
    getAvatar($),
    'https://workoscdn.com/images/v1/I1sX_zeoYHmkSaLu9QmC-G4D5YmKE_gV41LCcUYoJDA'
  )
})

test('.getAvatar supports next image src', t => {
  const $ = cheerio.load(`
    <div class="flex min-w-0 items-center gap-4">
      <div class="flex-shrink-0 overflow-hidden rounded-lg border border-tertiary" style="width:48px;height:48px">
        <img
          alt="Eric Zakariasson"
          loading="lazy"
          width="48"
          height="48"
          decoding="async"
          data-nimg="1"
          class="h-full w-full object-cover"
          style="color:transparent"
          srcset="/_next/image?url=https%3A%2F%2Fcursor-cdn.com%2Fprofile-pictures%2F0a0087018836d4ab41793b40d4e1e3fa%2Fb9a913bc-eb36-40fa-9ec9-441057ea3bb3.jpg&amp;w=48&amp;q=75 1x, /_next/image?url=https%3A%2F%2Fcursor-cdn.com%2Fprofile-pictures%2F0a0087018836d4ab41793b40d4e1e3fa%2Fb9a913bc-eb36-40fa-9ec9-441057ea3bb3.jpg&amp;w=96&amp;q=75 2x"
          src="https://cursor.com/_next/image?url=https%3A%2F%2Fcursor-cdn.com%2Fprofile-pictures%2F0a0087018836d4ab41793b40d4e1e3fa%2Fb9a913bc-eb36-40fa-9ec9-441057ea3bb3.jpg&amp;w=96&amp;q=75"
        />
      </div>
      <div class="min-w-0">
        <h1 class="truncate text-xl font-semibold leading-tight text-primary">Eric Zakariasson</h1>
        <div class="mt-0.5 flex flex-wrap items-center gap-2">
          <p class="text-base text-secondary">@eric</p>
        </div>
      </div>
    </div>
  `)

  t.is(
    getAvatar($),
    'https://cursor-cdn.com/profile-pictures/0a0087018836d4ab41793b40d4e1e3fa/b9a913bc-eb36-40fa-9ec9-441057ea3bb3.jpg'
  )
})

test('.getAvatar matches display name with double quotes', t => {
  const $ = cheerio.load(`
    <div class="flex min-w-0 items-center gap-4">
      <div class="flex-shrink-0 overflow-hidden rounded-lg border border-tertiary" style="width: 48px; height: 48px;">
        <img
          alt="John &quot;Johnny&quot; Doe"
          loading="lazy"
          width="48"
          height="48"
          decoding="async"
          data-nimg="1"
          class="h-full w-full object-cover"
          src="https://workoscdn.com/images/v1/I1sX_zeoYHmkSaLu9QmC-G4D5YmKE_gV41LCcUYoJDA"
          style="color: transparent;"
        />
      </div>
      <div class="min-w-0">
        <h1 class="truncate text-xl font-semibold leading-tight text-primary">John "Johnny" Doe</h1>
        <div class="mt-0.5 flex flex-wrap items-center gap-2">
          <a class="text-base font-medium text-secondary hover:text-primary hover:underline" href="/dashboard/settings#profile">@kikobeats</a>
        </div>
      </div>
    </div>
  `)

  t.is(
    getAvatar($),
    'https://workoscdn.com/images/v1/I1sX_zeoYHmkSaLu9QmC-G4D5YmKE_gV41LCcUYoJDA'
  )
})

test('.getAvatar returns undefined when profile picture is missing', t => {
  const $ = cheerio.load('<html><body></body></html>')
  t.is(getAvatar($), undefined)
})
