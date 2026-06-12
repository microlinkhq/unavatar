'use strict'

const getAvatarUrl = input =>
  /^\d+$/.test(input)
    ? `https://m.weibo.cn/u/${input}`
    : `https://m.weibo.cn/n/${encodeURIComponent(input)}`

// The profile avatar is served as a signed, expiring crop
// (`/crop.0.0.W.H.180/file?ssig=…`); rewriting it to `/large/file` yields a
// stable, unsigned, full-resolution URL. Default avatars live under
// `/default/`, which is treated as a miss.
const getAvatar = ({ $, NOT_FOUND }) => {
  const src = $('.m-avatar-box img').attr('src')
  if (!src) return

  const url = new URL(src, 'https://m.weibo.cn')
  if (url.pathname.includes('/default/')) return NOT_FOUND

  const filename = url.pathname.slice(url.pathname.lastIndexOf('/'))
  return `${url.origin}/large${filename}`
}

// The page sits behind Weibo's visitor gate (a JS cookie-setting redirect)
// and the avatar is injected after hydration, so it must be prerendered.
module.exports = ({ createHtmlProvider, NOT_FOUND }) =>
  createHtmlProvider({
    name: 'weibo',
    url: getAvatarUrl,
    getter: $ => getAvatar({ $, NOT_FOUND }),
    htmlOpts: () => ({
      prerender: true
    })
  })

module.exports.getAvatarUrl = getAvatarUrl
module.exports.getAvatar = getAvatar
