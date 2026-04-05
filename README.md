![logo](https://unavatar.io/api/og?v=nm9v50tgm ':id=banner')

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Quick start](#quick-start)
- [Query parameters](#query-parameters)
  - [TTL](#ttl)
  - [Fallback](#fallback)
  - [JSON](#json)
- [Pricing](#pricing)
- [Providers](#providers)
  - [Apple Music](#apple-music)
  - [Bluesky](#bluesky)
  - [DeviantArt](#deviantart)
  - [Dribbble](#dribbble)
  - [DuckDuckGo](#duckduckgo)
  - [GitHub](#github)
  - [GitLab](#gitlab)
  - [LinkedIn](#linkedin)
  - [Google](#google)
  - [Instagram](#instagram)
  - [Ko-fi](#ko-fi)
  - [Medium](#medium)
  - [Microlink](#microlink)
  - [Mastodon](#mastodon)
  - [OnlyFans](#onlyfans)
  - [OpenStreetMap](#openstreetmap)
  - [Patreon](#patreon)
  - [Printables](#printables)
  - [Reddit](#reddit)
  - [SoundCloud](#soundcloud)
  - [Spotify](#spotify)
  - [Substack](#substack)
  - [Telegram](#telegram)
  - [TikTok](#tiktok)
  - [Twitch](#twitch)
  - [Vimeo](#vimeo)
  - [WhatsApp](#whatsapp)
  - [YouTube](#youtube)
- [Response Format](#response-format)
- [Response Headers](#response-headers)

---

## Table of Contents

- [Introduction](#introduction)
- [Quick start](#quick-start)
- [Query parameters](#query-parameters)
  - [TTL](#ttl)
  - [Fallback](#fallback)
  - [JSON](#json)
- [Pricing](#pricing)
- [Providers](#providers)
  - [Apple Music](#apple-music)
  - [Bluesky](#bluesky)
  - [DeviantArt](#deviantart)
  - [Dribbble](#dribbble)
  - [DuckDuckGo](#duckduckgo)
  - [GitHub](#github)
  - [GitLab](#gitlab)
  - [LinkedIn](#linkedin)
  - [Google](#google)
  - [Instagram](#instagram)
  - [Ko-fi](#ko-fi)
  - [Medium](#medium)
  - [Microlink](#microlink)
  - [Mastodon](#mastodon)
  - [OnlyFans](#onlyfans)
  - [OpenStreetMap](#openstreetmap)
  - [Patreon](#patreon)
  - [Printables](#printables)
  - [Reddit](#reddit)
  - [SoundCloud](#soundcloud)
  - [Spotify](#spotify)
  - [Substack](#substack)
  - [Telegram](#telegram)
  - [TikTok](#tiktok)
  - [Twitch](#twitch)
  - [Vimeo](#vimeo)
  - [WhatsApp](#whatsapp)
  - [YouTube](#youtube)
- [Response Format](#response-format)
- [Response Headers](#response-headers)

---

## Introduction

Welcome to **unavatar.io**, the ultimate avatar service that offers everything you need to easily retrieve user avatars:

- **Versatile**: A wide range of platforms and services including [TikTok](https://unavatar.io/docs#tiktok), [Instagram](https://unavatar.io/docs#instagram), [YouTube](https://unavatar.io/docs#youtube), [X/Twitter](https://unavatar.io/docs#xtwitter), [Gravatar](https://unavatar.io/docs#gravatar), etc., meaning you can rule all of them just querying against unavatar.

- **Speed**: Designed to be fast and efficient with a 93% cache hit rate, serving 21.7 TB of data across 728M requests.

- **Optimize**: All the images are not only compressed on-the-fly to reduce their size and save bandwith, but also optimized to maintain a high-quality ratio. They are ready for immediate use, enhancing the overall optimization of your website or application.

- **Integration**: The service seamlessly incorporates into your current applications or websites with ease. We offer straightforward documentation and comprehensive support to ensure a quick and effortless onboarding experience.

It's proudly powered by [microlink.io](https://microlink.io/), the headless browser API that handles all the heavy lifting behind the scenes to ensure your avatars are always ready.

## Quick start

The service is exposed in **unavatar.io** via provider endpoints:

- an **email**: [unavatar.io/gravatar/hello@microlink.io](https://unavatar.io/gravatar/hello@microlink.io)
- an **username**: [unavatar.io/github/kikobeats](https://unavatar.io/github/kikobeats)
- a **domain**: [unavatar.io/google/reddit.com](https://unavatar.io/google/reddit.com)

Use the `/:provider/:key` format for all lookups. You can read more about available providers in [providers](https://unavatar.io/docs#providers).

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

This is in this way to make easier consume the service from HTML markup.

In case you want to get a JSON payload as response, just pass `json=true`:

e.g., [unavatar.io/github/kikobeats?json](https://unavatar.io/github/kikobeats?json)

## Pricing

The service is **FREE** for everyone, no registration required, with a daily rate limit of **50 requests** per IP address.

For preventing abusive usage, the service has associated a daily rate limit based on requests IP address.

You can verify for your rate limit state checking the following headers in the response:

- `x-rate-limit-limit`: The maximum number of requests that the consumer is permitted to make per minute.
- `x-rate-limit-remaining`: The number of requests remaining in the current rate limit window.
- `x-rate-limit-reset`: The time at which the current rate limit window resets in UTC epoch seconds.

For higher usage, the **[PRO](https://unavatar.io/checkout)** plan is a usage-based plan billed monthly that removes rate limits and unlocks custom TTL.

Every request has a cost in tokens (**\$0.001 per token**) based on the proxy tier needed to resolve the avatar:

| Proxy tier  | Tokens | Cost    |
| ----------- | ------ | ------- |
| Origin      | 1      | \$0.001 |
| Datacenter  | +2     | \$0.003 |
| Residential | +4     | \$0.007 |

The proxy tier used is returned in the `x-proxy-tier` response header, and the total cost in the `x-unavatar-cost` header.

``` bash
$ curl -I -H "x-api-key: YOUR_API_KEY" https://[unavatar.io/instagram/kikobeats](https://unavatar.io/instagram/kikobeats)

x-pricing-tier: pro
x-proxy-tier: origin
x-unavatar-cost: 1
```

To upgrade, visit [unavatar.io/checkout](https://unavatar.io/checkout). After completing the payment, you'll receive an API key.

## Providers

### Apple Music

Get artwork for any Apple Music artist, album, or song. Search by name or look up directly by numeric Apple Music ID.

e.g., [unavatar.io/apple-music/artist:daft%20punk](https://unavatar.io/apple-music/artist:daft%20punk)

The endpoint supports explicit type as part of the input.

If explicit type is not provided, it searches `artist` and `song` (in that order).

Available URI format inputs:

- artist
  - by artist name: [unavatar.io/apple-music/artist:daft%20punk](https://unavatar.io/apple-music/artist:daft%20punk)
  - by numeric artist ID: [unavatar.io/apple-music/artist:5468295](https://unavatar.io/apple-music/artist:5468295)
- album
  - by album name: [unavatar.io/apple-music/album:discovery](https://unavatar.io/apple-music/album:discovery)
  - by album ID: [unavatar.io/apple-music/album:78691923](https://unavatar.io/apple-music/album:78691923)
- song
  - by song name: [unavatar.io/apple-music/song:harder%20better%20faster%20stronger](https://unavatar.io/apple-music/song:harder%20better%20faster%20stronger)
  - by song ID: [unavatar.io/apple-music/song:697195787](https://unavatar.io/apple-music/song:697195787)

### Bluesky

Get any Bluesky user's profile picture by their handle. Domain-style handles are supported.

Available inputs:

- User handle, e.g., [unavatar.io/bluesky/pfrazee.com](https://unavatar.io/bluesky/pfrazee.com)
- Domain handle, e.g., [unavatar.io/bluesky/bsky.app](https://unavatar.io/bluesky/bsky.app)

### DeviantArt

Get any DeviantArt user's profile picture by their username.

Available inputs:

- slug, e.g., [unavatar.io/deviantart/spyed](https://unavatar.io/deviantart/spyed)

### Dribbble

Get any Dribbble designer's profile picture by their username.

Available inputs:

- slug, e.g., [unavatar.io/dribbble/omidnikrah](https://unavatar.io/dribbble/omidnikrah)

### DuckDuckGo

Get the favicon or logo for any domain via DuckDuckGo's icon service. Useful as a fallback when a domain doesn't expose its favicon directly.

Available inputs:

- Domain, e.g., [unavatar.io/duckduckgo/microsoft.com](https://unavatar.io/duckduckgo/microsoft.com)

### GitHub

Get any GitHub user or organization's profile picture by their username.

Available inputs:

- User, e.g., [unavatar.io/github/mdo](https://unavatar.io/github/mdo)
- Organization, e.g., [unavatar.io/github/vercel](https://unavatar.io/github/vercel)

### GitLab

Get any GitLab user or organization's profile picture by their username.

Available inputs:

- User, e.g., [unavatar.io/gitlab/sytses](https://unavatar.io/gitlab/sytses)
- Organization, e.g., [unavatar.io/gitlab/inkscape](https://unavatar.io/gitlab/inkscape)

### LinkedIn

Get any LinkedIn user or company profile picture by their public profile slug.

e.g., [unavatar.io/linkedin/user:wesbos](https://unavatar.io/linkedin/user:wesbos)

The input supports a URI format `type:id`.

When no type is provided, it defaults to `user` (user profile).

Available URI format inputs:

- `user` (default): [unavatar.io/linkedin/user:wesbos](https://unavatar.io/linkedin/user:wesbos)
- `company`: [unavatar.io/linkedin/company:microlinkhq](https://unavatar.io/linkedin/company:microlinkhq)

### Google

Get the favicon or logo for any domain using Google's favicon service.

Available inputs:

- Domain, e.g., [unavatar.io/google/stremio.com](https://unavatar.io/google/stremio.com)

Get any user's avatar by their email address via Gravatar. The most widely used global avatar service — if your users have a Gravatar set up, this is the fastest way to retrieve it.

Available inputs:

- Email address, e.g., [unavatar.io/gravatar/hello@microlink.io](https://unavatar.io/gravatar/hello@microlink.io)

### Instagram

Get any Instagram user's profile picture by their username. No authentication or API tokens needed — just pass the username.

Available inputs:

- slug, e.g., [unavatar.io/instagram/willsmith](https://unavatar.io/instagram/willsmith)

### Ko-fi

Get any Ko-fi page's profile picture by their public creator page slug.

Available inputs:

- Page slug, e.g., [unavatar.io/ko-fi/geekshock](https://unavatar.io/ko-fi/geekshock)

### Medium

Get any Medium author's profile picture by their username.

Available inputs:

- slug, e.g., [unavatar.io/medium/juancalmaraz](https://unavatar.io/medium/juancalmaraz)

### Microlink

Extract the logo or representative image from any URL. The page is rendered and the best available image is selected — useful for getting brand logos from any website.

Available inputs:

- Domain, e.g., [unavatar.io/microlink/microlink.io](https://unavatar.io/microlink/microlink.io)

### Mastodon

Get any Mastodon user's profile picture from any instance using the public account lookup API. Pass the handle as `user@server` so the account resolves on the correct home instance.

Available inputs:

- user@server, e.g., [unavatar.io/mastodon/kpwags@hachyderm.io](https://unavatar.io/mastodon/kpwags@hachyderm.io)

### OnlyFans

Get any OnlyFans creator's profile picture by their username.

Available inputs:

- slug, e.g., [unavatar.io/onlyfans/amandaribas](https://unavatar.io/onlyfans/amandaribas)

### OpenStreetMap

Get any OpenStreetMap contributor's profile picture. Accepts either a numeric user ID or a username.

Available inputs:

- Numeric user ID, e.g., [unavatar.io/openstreetmap/98672](https://unavatar.io/openstreetmap/98672)
- slug, e.g., [unavatar.io/openstreetmap/Terence%20Eden](https://unavatar.io/openstreetmap/Terence%20Eden)

### Patreon

Get any Patreon creator's profile picture by their username.

Available inputs:

- slug, e.g., [unavatar.io/patreon/gametestro](https://unavatar.io/patreon/gametestro)

### Printables

Get any Printables user's profile picture by their username.

Available inputs:

- slug, e.g., [unavatar.io/printables/DukeDoks](https://unavatar.io/printables/DukeDoks)

### Reddit

Get any Reddit user's avatar by their username.

Available inputs:

- slug, e.g., [unavatar.io/reddit/kikobeats](https://unavatar.io/reddit/kikobeats)

### SoundCloud

Get any SoundCloud artist's profile picture by their username.

Available inputs:

- slug, e.g., [unavatar.io/soundcloud/gorillaz](https://unavatar.io/soundcloud/gorillaz)

### Spotify

Get artwork for any Spotify entity — users, artists, albums, playlists, shows, episodes, or tracks. Look up by username or Spotify ID.

e.g., [unavatar.io/spotify/album:7I9Wh2IgvI3Nnr8Z1ZSWby](https://unavatar.io/spotify/album:7I9Wh2IgvI3Nnr8Z1ZSWby)

The endpoint supports explicit type as part of the input.

If explicit type is not provided, it defaults to `user`.

Available URI format inputs:

- `album`: [unavatar.io/spotify/album:7I9Wh2IgvI3Nnr8Z1ZSWby](https://unavatar.io/spotify/album:7I9Wh2IgvI3Nnr8Z1ZSWby)
- `artist`: [unavatar.io/spotify/artist:1vCWHaC5f2uS3yhpwWbIA6](https://unavatar.io/spotify/artist:1vCWHaC5f2uS3yhpwWbIA6)
- `episode`: [unavatar.io/spotify/episode:1YNm34Q8ofC2CDTYYLaFMj](https://unavatar.io/spotify/episode:1YNm34Q8ofC2CDTYYLaFMj)
- `playlist`: [unavatar.io/spotify/playlist:37i9dQZF1DZ06evO3KIUZW](https://unavatar.io/spotify/playlist:37i9dQZF1DZ06evO3KIUZW)
- `show`: [unavatar.io/spotify/show:0iykbhPkRz53QF8LR2UyNO](https://unavatar.io/spotify/show:0iykbhPkRz53QF8LR2UyNO)
- `track`: [unavatar.io/spotify/track:4OROzZUy6gOWN4UGQVaZMF](https://unavatar.io/spotify/track:4OROzZUy6gOWN4UGQVaZMF)
- `user` (default): [unavatar.io/spotify/user:kikobeats](https://unavatar.io/spotify/user:kikobeats)

### Substack

Get any Substack author's profile picture by their publication username.

Available inputs:

- Publication username, e.g., [unavatar.io/substack/bankless](https://unavatar.io/substack/bankless)

### Telegram

Get any Telegram user's profile picture by their username.

Available inputs:

- slug, e.g., [unavatar.io/telegram/drsdavidsoft](https://unavatar.io/telegram/drsdavidsoft)

### TikTok

Get any TikTok user's profile picture by their username. No authentication or API tokens needed — just pass the username.

Available inputs:

- slug, e.g., [unavatar.io/tiktok/carlosazaustre](https://unavatar.io/tiktok/carlosazaustre)

### Twitch

Get any Twitch streamer's profile picture by their username.

Available inputs:

- slug, e.g., [unavatar.io/twitch/midudev](https://unavatar.io/twitch/midudev)

### Vimeo

Get any Vimeo user's profile picture by their username.

Available inputs:

- slug, e.g., [unavatar.io/vimeo/ladieswithlenses](https://unavatar.io/vimeo/ladieswithlenses)

### WhatsApp

Get the profile picture for a WhatsApp phone number, channel, chat, or group.

e.g., [unavatar.io/whatsapp/phone:34660021551](https://unavatar.io/whatsapp/phone:34660021551)

The input supports a URI format `type:id`.

When no type is provided, it defaults to `phone`.

Available URI format inputs:

- `phone` (default): [unavatar.io/whatsapp/phone:34660021551](https://unavatar.io/whatsapp/phone:34660021551)
- `channel`: [unavatar.io/whatsapp/channel:0029VaARuQ7KwqSXh9fiMc0m](https://unavatar.io/whatsapp/channel:0029VaARuQ7KwqSXh9fiMc0m)
- `chat`: [unavatar.io/whatsapp/chat:D2FFycjQXrEIKG8qQjbwZz](https://unavatar.io/whatsapp/chat:D2FFycjQXrEIKG8qQjbwZz)

Get any X (formerly Twitter) user's profile picture by their username.

Available inputs:

- slug, e.g., [unavatar.io/x/kikobeats](https://unavatar.io/x/kikobeats)

### YouTube

Get any YouTube channel's thumbnail by their handle, legacy username, or channel ID.

e.g., [unavatar.io/youtube/casey](https://unavatar.io/youtube/casey)

The endpoint supports specific input formats.

If the input starts with `UC` and has 24 characters, it is treated as a channel ID. Otherwise, it is treated as a handle.

Available inputs:

- `username`: [unavatar.io/youtube/casey](https://unavatar.io/youtube/casey) or [unavatar.io/youtube/@casey](https://unavatar.io/youtube/@casey)
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
| 429  | `ERATE`              | Free-tier daily rate limit exceeded         |
| 500  | `ECHECKOUT`          | Stripe checkout session creation failed     |
| 500  | `EAPIKEYFAILED`      | API key retrieval after checkout failed     |
| 500  | `EINTERNAL`          | Unexpected internal server failure          |

## Contact

If you have any suggestion or bug to report, please contact to ust mailing to [hello@unavatar.io](mailto:hello@unavatar.io).