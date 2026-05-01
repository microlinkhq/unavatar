![logo](https://unavatar.io/api/og ':id=banner')

## Table of Contents

- [Introduction](#introduction)
- [Quick start](#quick-start)
- [Attribution](#attribution)
  - [How to add attribution](#how-to-add-attribution)
  - [Remove attribution](#remove-attribution)
- [Authentication](#authentication)
- [Pricing](#pricing)
- [Cache](#cache)
- [Query parameters](#query-parameters)
  - [TTL](#ttl)
  - [Fallback](#fallback)
  - [JSON](#json)
- [Providers](#providers)
  - [Apple Music](#apple-music)
  - [Apple Store](#apple-store)
  - [Behance](#behance)
  - [Bluesky](#bluesky)
  - [Buy Me a Coffee](#buy-me-a-coffee)
  - [DeviantArt](#deviantart)
  - [Discord](#discord)
  - [Domain](#domain)
  - [Dribbble](#dribbble)
  - [DuckDuckGo](#duckduckgo)
  - [Email](#email)
  - [Facebook](#facebook)
  - [Flickr](#flickr)
  - [GitHub](#github)
  - [GitLab](#gitlab)
  - [Google](#google)
  - [Google Play](#google-play)
  - [Gravatar](#gravatar)
  - [Instagram](#instagram)
  - [Ko-fi](#ko-fi)
  - [LinkedIn](#linkedin)
  - [Mastodon](#mastodon)
  - [Medium](#medium)
  - [Microlink](#microlink)
  - [OnlyFans](#onlyfans)
  - [OpenStreetMap](#openstreetmap)
  - [Patreon](#patreon)
  - [Pinterest](#pinterest)
  - [Printables](#printables)
  - [PSN Profiles](#psn-profiles)
  - [Reddit](#reddit)
  - [Snapchat](#snapchat)
  - [SoundCloud](#soundcloud)
  - [Spotify](#spotify)
  - [Stack Overflow](#stack-overflow)
  - [Steam](#steam)
  - [Substack](#substack)
  - [Telegram](#telegram)
  - [Threads](#threads)
  - [TikTok](#tiktok)
  - [Tumblr](#tumblr)
  - [Twitch](#twitch)
  - [Vimeo](#vimeo)
  - [WhatsApp](#whatsapp)
  - [X/Twitter](#xtwitter)
  - [Xbox Gamertag](#xbox-gamertag)
  - [YouTube](#youtube)
- [Response Format](#response-format)
- [Response Headers](#response-headers)
- [Response Errors](#response-errors)

---

## Introduction

Welcome to **unavatar.io**, the ultimate avatar service that offers everything you need to easily retrieve user avatars:

It's proudly powered by [microlink.io](https://microlink.io/), the headless browser API that handles all the heavy lifting behind the scenes to ensure your avatars are always ready.

## Quick start

The service is exposed in **unavatar.io** via endpoints.

An endpoint determines how the avatar is looked up and what parameters are required.

For example, you can get an avatar for:

- an **email**: [unavatar.io/email/hello@microlink.io](https://unavatar.io/email/hello@microlink.io)
- an **username**: [unavatar.io/github/kikobeats](https://unavatar.io/github/kikobeats)
- a **domain**: [unavatar.io/domain/reddit.com](https://unavatar.io/domain/reddit.com)

Read [providers](https://unavatar.io/docs#providers) to know more. Each provider can accept different parameters.

## Attribution

Free plans require attribution. Upgrade to any paid plan to remove this requirement.

Attribution ensures proper domain verification and helps us keep unavatar.io free for the community.

Your attribution link:

- Must be on your production site (not staging or localhost).
- Must be publicly accessible and viewable in browsers.
- Must not use rel="nofollow", redirects, or obfuscation.

### How to add attribution

Add this link on any page or surface displaying unavatar.io avatars:

```html
[Avatars provided by Unavatar](https://unavatar.io)
```

**Example**

```html

  ![Kiko](https://unavatar.io/github/kikobeats)

  ![Joseba](https://unavatar.io/x/josebaseba)

<p class="attribution">

  [Avatars provided by Unavatar](https://unavatar.io)

</p>
```

**Valid placements**

Site footer, about page, credits page, or any page that renders avatars.

**Mobile apps and non-web products**

If avatars are displayed in a mobile app, desktop app, browser extension, email, or any non-web surface, add the attribution link on your app's marketing site, app store listing description, or credits screen.

**Requirements for attribution to be valid**

We reserve the right to revoke free-tier access for any website or product that does not comply with the attribution requirements described in this document:

- Double-check the href. It must point to [https://unavatar.io](https://unavatar.io/) directly — no redirects, no URL shorteners, no tracking wrappers.
- Make sure it's crawlable. The link must be present in the rendered HTML and not blocked by robots.txt, authentication, or region gating.
- Avoid nofollow or noindex. We need a standard, followable link.
- target="\_blank" is allowed.

### Remove attribution

Attribution is only required on the free plan. [Upgrade to the PRO plan](https://unavatar.io/checkout) to remove the requirement.

## Authentication

Anonymous requests work without authentication. They are limited to 25 requests/day per IP address.

For [PRO](https://unavatar.io/checkout) users, the requests must include the API key as the `x-api-key` request header:

```bash
curl "https://unavatar.io/github/kikobeats" -H "x-api-key: YOUR_API_KEY"
```

```javascript
await fetch('https://unavatar.io/github/kikobeats', {

  headers: {

    'x-api-key': 'YOUR_API_KEY'

  }

})
```

```python
import requests

response = requests.get(

  'https://unavatar.io/github/kikobeats',

  headers={'x-api-key': 'YOUR_API_KEY'}

)
```

```golang
package main

import "net/http"

func main() {

  req, _ := http.NewRequest("GET", "https://unavatar.io/github/kikobeats", nil)

  req.Header.Set("x-api-key", "YOUR_API_KEY")

  resp, _ := http.DefaultClient.Do(req)

  defer resp.Body.Close()

}
```

```ruby
require 'net/http'

require 'uri'

uri = URI('https://unavatar.io/github/kikobeats')

request = Net::HTTP::Get.new(uri)

request['x-api-key'] = 'YOUR_API_KEY'

response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|

  http.request(request)

end
```

```php
$ch = curl_init('https://unavatar.io/github/kikobeats');

curl_setopt($ch, CURLOPT_HTTPHEADER, [

  'x-api-key: YOUR_API_KEY',

]);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);

curl_close($ch);
```

If the API key is invalid, the service returns `401` with code `EAPIKEY`.

Rate limit status can be verified using these response headers:

| Header                   | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| `x-rate-limit-limit`     | Maximum anonymous requests allowed in the current daily window |
| `x-rate-limit-remaining` | Requests remaining in the current window                       |
| `x-rate-limit-reset`     | UTC epoch seconds when the current window resets               |

```bash
$ curl -I https://unavatar.io/github/kikobeats

x-rate-limit-limit: 25

x-rate-limit-remaining: 24

x-rate-limit-reset: 1744243200
```

## Pricing

Unavatar pricing is simple: you can start on the anonymous free tier, then authenticate with `x-api-key` to get additional included usage and metered billing for higher volume.

| Scenario                                     | Included free usage    | Billing                          |
| -------------------------------------------- | ---------------------- | -------------------------------- |
| Anonymous (no API key)                       | 25 requests/day per IP | Free                             |
| Authenticated origin requests (`x-api-key`)  | 50 origin requests/day | Metered monthly after free quota |
| Proxy requests (`datacenter`, `residential`) | None                   | Always metered                   |

For higher usage, the **[PRO](https://unavatar.io/checkout)** plan is usage-based billing that includes the 50 free daily origin requests, metered overage, and custom TTL.

Every request has a cost in tokens (**\$0.005 per token**) based on the proxy tier needed to resolve the avatar:

| Proxy tier  | Tokens | Cost    |
| ----------- | :----: | :-----: |
| Origin      | 1      | \$0.005 |
| Datacenter  | +2     | \$0.015 |
| Residential | +4     | \$0.025 |

The proxy tier used is returned in the `x-proxy-tier` response header, and the total cost in the `x-unavatar-cost` header.

```bash
$ curl -I -H "x-api-key: YOUR_API_KEY" https://unavatar.io/instagram/kikobeats

x-pricing-tier: pro

x-proxy-tier: origin

x-unavatar-cost: 1
```

To upgrade, visit [unavatar.io/checkout](https://unavatar.io/checkout). After completing the payment, you'll receive an API key.

## Cache

Unavatar caches avatar lookups to make repeated requests fast and stable:

- The first request for a resource fetches the avatar from upstream and stores it in cache
- Following requests are served from cache until the [TTL](https://unavatar.io/docs#ttl) expires.

For example, if you set `ttl=1h`, the cache behavior looks like this:

| Time  | Request                 | Cache status                        | Plan impact                |
| ----- | ----------------------- | ----------------------------------- | -------------------------- |
| 10:00 | `GET /github/kikobeats` | MISS (fetched from upstream)        | Counts as 1 origin request |
| 10:05 | `GET /github/kikobeats` | HIT (served from cache)             | No usage consumed, no cost |
| 10:40 | `GET /github/kikobeats` | HIT (served from cache)             | No usage consumed, no cost |
| 11:02 | `GET /github/kikobeats` | MISS (TTL expired, cache refreshed) | Counts as 1 origin request |
| 11:10 | `GET /github/kikobeats` | HIT (served from cache)             | No usage consumed, no cost |

To check the cache status in real requests, inspect these response headers:

| Header           | What to look for                                                                        |
| ---------------- | --------------------------------------------------------------------------------------- |
| `x-cache-status` | `HIT` means served from cache. `MISS` means fetched/refreshed from upstream.            |
| `cache-control`  | Shows cache policy and effective TTL (for example `public, max-age=3600` for `ttl=1h`). |

```bash
$ curl -I -H "x-api-key: YOUR_API_KEY" "https://unavatar.io/github/kikobeats?ttl=1h"

cache-control: public, max-age=3600

x-cache-status: HIT
```

The same rule applies to anonymous requests: cache hits are free and do not consume the `25 requests/day` limit.

After TTL expiration, the next request refreshes the cache and is billed/rate-limited according to the request tier (`anonymous`, `origin`, `datacenter`, or `residential`).

## Query parameters

### TTL

Type: `number` or `string`\
Default: `'24h'`\
Range: from `'1h'` to `'28d'`

It determines the maximum quantity of time an avatar is considered fresh.

e.g., [unavatar.io/github/kikobeats?ttl=1h](https://unavatar.io/github/kikobeats?ttl=1h)

When you look up for a user avatar for the very first time, the service will determine it and cache it respecting TTL value.

The same resource will continue to be used until reach TTL expiration. After that, the resource will be computed, and cache as fresh, starting the cycle.

### Fallback

Type: `string` or `boolean`

When it can't be possible to get a user avatar, a fallback image is returned instead, and it can be personalized to fit better with your website or application style.

You can get one from **boringavatars.com**:

e.g., [unavatar.io/github/37t?fallback=https://source.boringavatars.com/marble/120/1337_user?colors=264653r,2a9d8f,e9c46a,f4a261,e76f51](https://unavatar.io/github/37t?fallback=https://source.boringavatars.com/marble/120/1337_user?colors=264653r,2a9d8f,e9c46a,f4a261,e76f51)

or **avatar.vercel.sh**:

e.g., [unavatar.io/github/37t?fallback=https://avatar.vercel.sh/37t?size=400](https://unavatar.io/github/37t?fallback=https://avatar.vercel.sh/37t?size=400)

or a static image:

e.g., [unavatar.io/github/37t?fallback=https://avatars.githubusercontent.com/u/66378906?v=4](https://unavatar.io/github/37t?fallback=https://avatars.githubusercontent.com/u/66378906?v=4)

or even a base64 encoded image. This allows you to return a transparent, base64 encoded 1x1 pixel GIF, which can be useful when you want to use your own background colour or image as a fallback.

e.g., [unavatar.io/github/37t?fallback=data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==](https://unavatar.io/github/37t?fallback=data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==)

You can pass `fallback=false` to explicitly disable this behavior. In this case, a *404 Not Found* HTTP status code will returned when is not possible to get the user avatar.

### JSON

The service returns media content by default.

This makes the service easier to consume directly from HTML markup.

In case you want to get a JSON payload as response, just pass `json=true`:

e.g., [unavatar.io/github/kikobeats?json](https://unavatar.io/github/kikobeats?json)

## Providers

### Apple Music

Get artwork for any Apple Music artist, album, or song. Search by name or look up directly by numeric Apple Music ID.

The endpoint supports explicit type as part of the input.

If explicit type is not provided, it searches `artist` and `song` (in that order).

Available inputs:

- artist
  - by artist name: [unavatar.io/apple-music/artist:daft%20punk](https://unavatar.io/apple-music/artist:daft%20punk)
  - by numeric artist ID: [unavatar.io/apple-music/artist:5468295](https://unavatar.io/apple-music/artist:5468295)
- album
  - by album name: [unavatar.io/apple-music/album:discovery](https://unavatar.io/apple-music/album:discovery)
  - by album ID: [unavatar.io/apple-music/album:78691923](https://unavatar.io/apple-music/album:78691923)
- song
  - by song name: [unavatar.io/apple-music/song:harder%20better%20faster%20stronger](https://unavatar.io/apple-music/song:harder%20better%20faster%20stronger)
  - by song ID: [unavatar.io/apple-music/song:697195787](https://unavatar.io/apple-music/song:697195787)

### Apple Store

Get the icon for any iOS or macOS app on the App Store by numeric Apple ID.

The endpoint supports explicit type as part of the input.

If explicit type is not provided, it defaults to `id`.

Available inputs:

- `id` (default): [unavatar.io/apple-store/id:529479190](https://unavatar.io/apple-store/id:529479190) or [unavatar.io/apple-store/id:6474323148@es](https://unavatar.io/apple-store/id:6474323148@es)
- `name`: [unavatar.io/apple-store/name:pokemon%20go](https://unavatar.io/apple-store/name:pokemon%20go)

### Behance

Get any Behance user's profile picture by their username.

e.g., [unavatar.io/behance/vitormatosinhos](https://unavatar.io/behance/vitormatosinhos)

### Bluesky

Get any Bluesky user's profile picture by their handle. Domain-style handles are supported.

Available inputs:

- User handle, e.g., [unavatar.io/bluesky/pfrazee.com](https://unavatar.io/bluesky/pfrazee.com)
- Domain handle, e.g., [unavatar.io/bluesky/bsky.app](https://unavatar.io/bluesky/bsky.app)

### Buy Me a Coffee

Get any Buy Me a Coffee creator's profile picture by their username.

e.g., [unavatar.io/buymeacoffee/mikebarnesdrums](https://unavatar.io/buymeacoffee/mikebarnesdrums)

### DeviantArt

Get any DeviantArt user's profile picture by their username.

e.g., [unavatar.io/deviantart/spyed](https://unavatar.io/deviantart/spyed)

### Discord

Get a Discord server's icon by server name or server ID.

Available inputs:

- Server name, e.g., [unavatar.io/discord/lilnasx](https://unavatar.io/discord/lilnasx)
- Server ID, e.g., [unavatar.io/discord/uW6Hyf3E9r](https://unavatar.io/discord/uW6Hyf3E9r)

### Domain

Retrieve logos and favicons from any hostname with a single URL. Domain-shaped paths try DuckDuckGo, Google, Microlink in order until one returns an image, same as the explicit `/domain/:key` route.

e.g., [unavatar.io/domain/microlink.io](https://unavatar.io/domain/microlink.io)

### Dribbble

Get any Dribbble designer's profile picture by their username.

e.g., [unavatar.io/dribbble/omidnikrah](https://unavatar.io/dribbble/omidnikrah)

### DuckDuckGo

Get the favicon or logo for any domain via DuckDuckGo's icon service. Useful as a fallback when a domain doesn't expose its favicon directly.

e.g., [unavatar.io/duckduckgo/microsoft.com](https://unavatar.io/duckduckgo/microsoft.com)

### Email

Resolve user avatars from an email address with a single URL. The `/email/:key` route uses the same provider chain as a bare `/user@domain` path: the service tries Gravatar, GitHub in order until one returns an image. No API keys and no SDK are required.

When the path looks like an email, unavatar walks that chain until a provider succeeds. You can also skip the chain and call a named email provider directly when you know where the avatar should come from.

Automatic resolution

Pass the address as the only path segment, or prefix it with `email/`. The API auto-detects email-shaped inputs and runs the same chain (Gravatar, GitHub).

- Typed route `unavatar.io/email/{email}`: [unavatar.io/email/hello@microlink.io](https://unavatar.io/email/hello@microlink.io)
- Bare path `unavatar.io/{email}`: [unavatar.io/hello@microlink.io](https://unavatar.io/hello@microlink.io)

Explicit providers

Target a specific provider when you know where the avatar comes from.

- Gravatar (`unavatar.io/gravatar/{email-or-hash}`) — email is normalized and SHA-256 hashed; 64-hex SHA-256 or 32-hex MD5 passes through. Example: [unavatar.io/gravatar/hello@microlink.io](https://unavatar.io/gravatar/hello@microlink.io)
- GitHub (`unavatar.io/github/{email}`) — public profile email or commit history: [unavatar.io/github/sindresorhus@gmail.com](https://unavatar.io/github/sindresorhus@gmail.com)

e.g., [unavatar.io/email/hello@microlink.io](https://unavatar.io/email/hello@microlink.io)

### Facebook

Get any Facebook user, page, or group profile picture by their username or ID.

Available inputs:

- Username, e.g., [unavatar.io/facebook/zuck](https://unavatar.io/facebook/zuck)
- Page, e.g., [unavatar.io/facebook/windtodayco](https://unavatar.io/facebook/windtodayco)
- Group ID, e.g., [unavatar.io/facebook/1426378481098002](https://unavatar.io/facebook/1426378481098002)

### Flickr

Get any Flickr user's buddy icon or group icon by username or group slug.

The input supports a URI format `type:id`.

When no type is provided, it defaults to `user` (user profile).

Available inputs:

- `user` (default): [unavatar.io/flickr/user:elizabethgadd](https://unavatar.io/flickr/user:elizabethgadd)
- `group`: [unavatar.io/flickr/group:allthingsearthy](https://unavatar.io/flickr/group:allthingsearthy)

### GitHub

Get any GitHub user or organization's profile picture by username, or resolve an avatar from a public email via GitHub search when the address matches a profile or commit history.

Available inputs:

- User, e.g., [unavatar.io/github/mdo](https://unavatar.io/github/mdo)
- Organization, e.g., [unavatar.io/github/vercel](https://unavatar.io/github/vercel)
- Email address, e.g., [unavatar.io/github/sindresorhus@gmail.com](https://unavatar.io/github/sindresorhus@gmail.com)

### GitLab

Get any GitLab user or organization's profile picture by their username.

Available inputs:

- User, e.g., [unavatar.io/gitlab/sytses](https://unavatar.io/gitlab/sytses)
- Organization, e.g., [unavatar.io/gitlab/inkscape](https://unavatar.io/gitlab/inkscape)

### Google

Get the favicon or logo for any domain using Google's favicon service.

e.g., [unavatar.io/google/stremio.com](https://unavatar.io/google/stremio.com)

### Google Play

Get the icon for any Android app on Google Play by its package name, or get a developer icon by numeric ID.

The input supports a URI format `type:id`.

When no type is provided, the input is treated as a package name (`app`).

Available inputs:

- `app` (default): [unavatar.io/google-play/app:com.devolver.grispaid](https://unavatar.io/google-play/app:com.devolver.grispaid)
- `dev`: [unavatar.io/google-play/dev:6592603558263828430](https://unavatar.io/google-play/dev:6592603558263828430)

### Gravatar

Resolve avatars via Gravatar using a plain email or a precomputed hash. Emails are trimmed, lowercased, and hashed with SHA-256 for the Gravatar URL; 64-hex SHA-256 and 32-hex MD5 values are passed through (normalized to lowercase).

Available inputs:

- Email address, e.g., [unavatar.io/gravatar/hello@microlink.io](https://unavatar.io/gravatar/hello@microlink.io)
- SHA-256 hash, e.g., [unavatar.io/gravatar/b1f507c7a29adfa84eaa521036774b0577c58f23f2f3f42e068d6ac256cffae2](https://unavatar.io/gravatar/b1f507c7a29adfa84eaa521036774b0577c58f23f2f3f42e068d6ac256cffae2)
- MD5 hash, e.g., [unavatar.io/gravatar/3f293df98a473eae038deabe430a1e30](https://unavatar.io/gravatar/3f293df98a473eae038deabe430a1e30)

### Instagram

Get any Instagram user's profile picture by their username. No authentication or API tokens needed — just pass the username.

e.g., [unavatar.io/instagram/willsmith](https://unavatar.io/instagram/willsmith)

### Ko-fi

Get any Ko-fi page's profile picture by the creator username.

e.g., [unavatar.io/ko-fi/geekshock](https://unavatar.io/ko-fi/geekshock)

### LinkedIn

Get any LinkedIn user or company profile picture by username or company slug.

The endpoint supports explicit type as part of the input.

Available inputs:

- `user` (default): [unavatar.io/linkedin/user:wesbos](https://unavatar.io/linkedin/user:wesbos)
- `company`: [unavatar.io/linkedin/company:microlinkhq](https://unavatar.io/linkedin/company:microlinkhq)

### Mastodon

Get any Mastodon user's profile picture from any instance using the public account lookup API. Pass the handle as `user@server` so the account resolves on the correct home instance.

e.g., [unavatar.io/mastodon/kpwags@hachyderm.io](https://unavatar.io/mastodon/kpwags@hachyderm.io)

### Medium

Get any Medium author's profile picture by their username.

e.g., [unavatar.io/medium/juancalmaraz](https://unavatar.io/medium/juancalmaraz)

### Microlink

Extract the logo or representative image from any URL. The page is rendered and the best available image is selected — useful for getting brand logos from any website.

e.g., [unavatar.io/microlink/microlink.io](https://unavatar.io/microlink/microlink.io)

### OnlyFans

Get any OnlyFans creator's profile picture by their username.

e.g., [unavatar.io/onlyfans/amandaribas](https://unavatar.io/onlyfans/amandaribas)

### OpenStreetMap

Get any OpenStreetMap contributor's profile picture. Accepts either a numeric user ID or a username.

Available inputs:

- Numeric user ID, e.g., [unavatar.io/openstreetmap/98672](https://unavatar.io/openstreetmap/98672)
- Username, e.g., [unavatar.io/openstreetmap/Terence%20Eden](https://unavatar.io/openstreetmap/Terence%20Eden)

### Patreon

Get any Patreon creator's profile picture by their username.

e.g., [unavatar.io/patreon/gametestro](https://unavatar.io/patreon/gametestro)

### Pinterest

Get any Pinterest user's profile picture by their username.

e.g., [unavatar.io/pinterest/ohjoy](https://unavatar.io/pinterest/ohjoy)

### Printables

Get any Printables user's profile picture by their username.

e.g., [unavatar.io/printables/DukeDoks](https://unavatar.io/printables/DukeDoks)

### PSN Profiles

Get any PlayStation Network user's profile picture by their PSN username.

e.g., [unavatar.io/psnprofiles/Duff85](https://unavatar.io/psnprofiles/Duff85)

### Reddit

Get any Reddit user's avatar by their username.

Available inputs:

- Username, e.g., [unavatar.io/reddit/thisisbillgates](https://unavatar.io/reddit/thisisbillgates)
- Organization, e.g., [unavatar.io/reddit/nasa](https://unavatar.io/reddit/nasa)

### Snapchat

Get any Snapchat user's profile picture by their username.

e.g., [unavatar.io/snapchat/teddysdaytoday](https://unavatar.io/snapchat/teddysdaytoday)

### SoundCloud

Get any SoundCloud artist's profile picture by their username.

e.g., [unavatar.io/soundcloud/gorillaz](https://unavatar.io/soundcloud/gorillaz)

### Spotify

Get artwork for any Spotify entity — users, artists, albums, playlists, shows, episodes, or tracks. Look up by username or Spotify ID.

The endpoint supports explicit type as part of the input.

If explicit type is not provided, it defaults to `user`.

Available inputs:

- `album`: [unavatar.io/spotify/album:7I9Wh2IgvI3Nnr8Z1ZSWby](https://unavatar.io/spotify/album:7I9Wh2IgvI3Nnr8Z1ZSWby)
- `artist`: [unavatar.io/spotify/artist:1vCWHaC5f2uS3yhpwWbIA6](https://unavatar.io/spotify/artist:1vCWHaC5f2uS3yhpwWbIA6)
- `episode`: [unavatar.io/spotify/episode:1YNm34Q8ofC2CDTYYLaFMj](https://unavatar.io/spotify/episode:1YNm34Q8ofC2CDTYYLaFMj)
- `playlist`: [unavatar.io/spotify/playlist:37i9dQZF1DZ06evO3KIUZW](https://unavatar.io/spotify/playlist:37i9dQZF1DZ06evO3KIUZW)
- `show`: [unavatar.io/spotify/show:0iykbhPkRz53QF8LR2UyNO](https://unavatar.io/spotify/show:0iykbhPkRz53QF8LR2UyNO)
- `track`: [unavatar.io/spotify/track:4OROzZUy6gOWN4UGQVaZMF](https://unavatar.io/spotify/track:4OROzZUy6gOWN4UGQVaZMF)
- `user` (default): [unavatar.io/spotify/user:kikobeats](https://unavatar.io/spotify/user:kikobeats)

### Stack Overflow

Get any Stack Overflow user's profile picture by their numeric user ID only (slug paths are not supported).

e.g., [unavatar.io/stackoverflow/19082](https://unavatar.io/stackoverflow/19082)

### Steam

Get any Steam player or community group profile picture by public profile name, numeric account ID, or group name.

The input supports a URI format `type:value`.

When no type is provided, it defaults to `id` (player profile name).

Available inputs:

- `id` (default): [unavatar.io/steam/id:gabelogannewell](https://unavatar.io/steam/id:gabelogannewell)
- `profile`: [unavatar.io/steam/profile:76561198044605749](https://unavatar.io/steam/profile:76561198044605749)
- `group`: [unavatar.io/steam/group:murcia-gaming](https://unavatar.io/steam/group:murcia-gaming)

### Substack

Get any Substack author's profile picture by their publication username.

e.g., [unavatar.io/substack/bankless](https://unavatar.io/substack/bankless)

### Telegram

Get any Telegram user's profile picture by their username.

e.g., [unavatar.io/telegram/drsdavidsoft](https://unavatar.io/telegram/drsdavidsoft)

### Threads

Get any Threads user's profile picture by their username.

e.g., [unavatar.io/threads/zuck](https://unavatar.io/threads/zuck)

### TikTok

Get any TikTok user's profile picture by their username. No authentication or API tokens needed — just pass the username.

e.g., [unavatar.io/tiktok/carlosazaustre](https://unavatar.io/tiktok/carlosazaustre)

### Tumblr

Get any Tumblr blog's profile picture by their username.

e.g., [unavatar.io/tumblr/nasa](https://unavatar.io/tumblr/nasa)

### Twitch

Get any Twitch streamer's profile picture by their username.

e.g., [unavatar.io/twitch/midudev](https://unavatar.io/twitch/midudev)

### Vimeo

Get any Vimeo user's profile picture by their username.

e.g., [unavatar.io/vimeo/ladieswithlenses](https://unavatar.io/vimeo/ladieswithlenses)

### WhatsApp

Get the profile picture for a WhatsApp channel or chat by ID.

The input supports a URI format `type:id`.

If no type is provided, the input is treated as a phone number.

Available inputs:

- `phone`: [unavatar.io/whatsapp/phone:34660021551](https://unavatar.io/whatsapp/phone:34660021551)
- `channel`: [unavatar.io/whatsapp/channel:0029VaARuQ7KwqSXh9fiMc0m](https://unavatar.io/whatsapp/channel:0029VaARuQ7KwqSXh9fiMc0m)
- `chat`: [unavatar.io/whatsapp/chat:D2FFycjQXrEIKG8qQjbwZz](https://unavatar.io/whatsapp/chat:D2FFycjQXrEIKG8qQjbwZz)

### X/Twitter

Get any X (formerly Twitter) user's profile picture by their username.

e.g., [unavatar.io/x/elonmusk](https://unavatar.io/x/elonmusk)

### Xbox Gamertag

Get any Xbox player's profile picture by their gamertag.

e.g., [unavatar.io/xboxgamertag/GD-BerserkerTTD](https://unavatar.io/xboxgamertag/GD-BerserkerTTD)

### YouTube

Get any YouTube channel's thumbnail by their handle, legacy username, or channel ID.

The endpoint supports specific input formats.

If the input starts with `UC` and has 24 characters, it is treated as a channel ID. Otherwise, it is treated as a handle.

Available inputs:

- `username`: [unavatar.io/youtube/casey](https://unavatar.io/youtube/casey)
- `channel`: [unavatar.io/youtube/UC_x5XG1OV2P6uZZ5FSM9Ttw](https://unavatar.io/youtube/UC_x5XG1OV2P6uZZ5FSM9Ttw)

## Response Format

A response is returning the user avatar by default.

However, you can get a [json](https://unavatar.io/docs#json) as response payload.

When an endpoint returns JSON, the shape is predictable so you can parse it reliably in your app:

| Field     | Type           | Present in                      | Description                                      |
| --------- | -------------- | ------------------------------- | ------------------------------------------------ |
| `status`  | `string`       | all JSON responses              | One of: `success`, `fail`, `error`.              |
| `message` | `string`       | all JSON responses              | Human-readable summary for display/logging.      |
| `data`    | `object`       | `success`                       | Response payload for successful requests.        |
| `code`    | `string`       | `fail`, `error`                 | Stable machine-readable error code.              |
| `more`    | `string (URL)` | most `fail` / `error` responses | Documentation URL with troubleshooting details.  |
| `report`  | `string`       | some `error` responses          | Support contact channel (for example `mailto:`). |

## Response Headers

These headers help you understand pricing, limits, and request diagnostics.

| Header                   | Purpose                                                   |
| ------------------------ | --------------------------------------------------------- |
| `x-pricing-tier`         | `free` or `pro` — the plan used for this request          |
| `x-timestamp`            | Server timestamp when request was received                |
| `x-unavatar-cost`        | Token cost of the request (avatar routes only)            |
| `x-proxy-tier`           | Proxy tier used: `origin`, `datacenter`, or `residential` |
| `x-rate-limit-limit`     | Maximum requests allowed per window (free tier only)      |
| `x-rate-limit-remaining` | Remaining requests in current window (free tier only)     |
| `x-rate-limit-reset`     | UTC epoch seconds when window resets (free tier only)     |
| `retry-after`            | Seconds until rate limit resets (only on 429 responses)   |

```bash
$ curl -I -H "x-api-key: YOUR_API_KEY" https://unavatar.io/github/kikobeats

x-pricing-tier: pro

x-timestamp: 1744209600

x-unavatar-cost: 1

x-proxy-tier: origin

x-rate-limit-limit: 50

x-rate-limit-remaining: 49

x-rate-limit-reset: 1744243200
```

## Response Errors

Expected errors are known operational cases returned with stable codes.

- **Client-side issues** return `status: "fail"` (HTTP `4xx`).
- **Service-side issues** return `status: "error"` (HTTP `5xx`).
- Unknown failures return `EINTERNAL` (HTTP `500`).
- Use the `code` for programmatic handling in clients.
- Use the `message` to show user-facing feedback.
- `more` links to documentation for common fixes.
- `report` (when present) indicates how to contact support for server errors.

| HTTP | Code                 | Typical trigger                             |
| ---- | -------------------- | ------------------------------------------- |
| 400  | `ESESSIONID`         | Missing `session_id` in `/checkout/success` |
| 400  | `ESESSION`           | Checkout session not paid or not found      |
| 400  | `ESIGNATURE`         | Missing `stripe-signature` header           |
| 400  | `EWEBHOOK`           | Invalid/failed Stripe webhook processing    |
| 400  | `EAPIKEYVALUE`       | Missing `apiKey` query parameter            |
| 400  | `EAPIKEYLABEL`       | Missing `label` query parameter             |
| 401  | `EEMAIL`             | Invalid or missing authenticated email      |
| 401  | `EUSERUNAUTHORIZED`  | Missing/invalid auth for protected routes   |
| 401  | `EAPIKEY`            | Invalid `x-api-key`                         |
| 403  | `ETTL`               | Custom `ttl` requested without pro plan     |
| 403  | `EPRO`               | Provider restricted to pro plan             |
| 404  | `ENOTFOUND`          | Route not found                             |
| 404  | `EAPIKEYNOTFOUND`    | API key not found                           |
| 409  | `EAPIKEYEXISTS`      | Custom API key already exists               |
| 409  | `EAPIKEYLABELEXISTS` | API key label already exists                |
| 409  | `EAPIKEYMIN`         | Attempt to remove last remaining key        |
| 429  | `ERATE`              | Anonymous daily rate limit exceeded         |
| 500  | `ECHECKOUT`          | Stripe checkout session creation failed     |
| 500  | `EAPIKEYFAILED`      | API key retrieval after checkout failed     |
| 500  | `EINTERNAL`          | Unexpected internal server failure          |

## Contact

If you have any suggestion or bug to report, please contact to ust mailing to [hello@unavatar.io](mailto:hello@unavatar.io).