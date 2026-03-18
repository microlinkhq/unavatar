'use strict'

const providersBy = {
  email: ['gravatar'],
  username: [
    'apple-music',
    'bluesky',
    'deviantart',
    'dribbble',
    'github',
    'gitlab',
    'instagram',
    'linkedin',
    'onlyfans',
    'openstreetmap',
    'patreon',
    'reddit',
    'soundcloud',
    'spotify',
    'substack',
    'telegram',
    'tiktok',
    'twitch',
    'vimeo',
    'x',
    'youtube'
  ],
  domain: ['microlink']
}

module.exports = ctx => {
  const providers = {
    'apple-music': require('./apple-music')(ctx),
    bluesky: require('./bluesky')(ctx),
    deviantart: require('./deviantart')(ctx),
    dribbble: require('./dribbble')(ctx),
    duckduckgo: require('./duckduckgo')(ctx),
    github: require('./github')(ctx),
    gitlab: require('./gitlab')(ctx),
    google: require('./google')(ctx),
    gravatar: require('./gravatar')(ctx),
    instagram: require('./instagram')(ctx),
    linkedin: require('./linkedin')(ctx),
    microlink: require('./microlink')(ctx),
    onlyfans: require('./onlyfans')(ctx),
    openstreetmap: require('./openstreetmap')(ctx),
    patreon: require('./patreon')(ctx),
    reddit: require('./reddit')(ctx),
    soundcloud: require('./soundcloud')(ctx),
    spotify: require('./spotify')(ctx),
    substack: require('./substack')(ctx),
    telegram: require('./telegram')(ctx),
    tiktok: require('./tiktok')(ctx),
    twitch: require('./twitch')(ctx),
    vimeo: require('./vimeo')(ctx),
    whatsapp: require('./whatsapp')(ctx),
    x: require('./x')(ctx),
    youtube: require('./youtube')(ctx)
  }

  return { providers, providersBy }
}
