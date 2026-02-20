![logo](https://unavatar.io/banner.png ':id=banner')

- [Quick start](#quick-start)
- [Query parameters](#query-parameters)
  - [TTL](#ttl)
  - [Fallback](#fallback)
  - [JSON](#json)
- [Pricing](#pricing)
- [Providers](#providers)
  - [Bluesky](#bluesky)
  - [DeviantArt](#deviantart)
  - [Dribbble](#dribbble)
  - [DuckDuckGo](#duckduckgo)
  - [GitHub](#github)
  - [GitLab](#gitlab)
  - [Google](#google)
  - [Gravatar](#gravatar)
  - [Instagram](#instagram)
  - [Microlink](#microlink)
  - [OnlyFans](#onlyfans)
  - [OpenStreetMap](#openstreetmap)
  - [Reddit](#reddit)
  - [SoundCloud](#soundcloud)
  - [Spotify](#spotify)
  - [Substack](#substack)
  - [Telegram](#telegram)
  - [TikTok](#tiktok)
  - [Twitch](#twitch)
  - [Vimeo](#vimeo)
  - [WhatsApp](#whatsapp)
  - [X/Twitter](#xtwitter)
  - [YouTube](#youtube)
- [Response Format](#response-format)
- [Response Headers](#response-headers)
- [Response Errors](#response-errors)
- [Contact](#contact)

---

Welcome to **unavatar.io**, the ultimate avatar service that offers everything you need to easily retrieve user avatars:

- **Versatile**: A wide range of platforms and services including [TikTok](#tiktok), [Instagram](#instagram), [YouTube](#youtube), [X/Twitter](#xtwitter), [Gravatar](#gravatar), etc., meaning you can rule all of them just querying against unavatar.

- **Speed**: Designed to be fast and efficient, all requests are being cached and delivered +200 global datacenters, allowing you to consume avatars instantly, counting more than 20 millions requests per month.

- **Optimize**: All the images are not only compressed on-the-fly to reduce their size and save bandwith, but also optimized to maintain a high-quality ratio. They are ready for immediate use, enhancing the overall optimization of your website or application.

- **Integration**: The service seamlessly incorporates into your current applications or websites with ease. We offer straightforward documentation and comprehensive support to ensure a quick and effortless onboarding experience.

It's proudly powered by [microlink.io](https://microlink.io), the headless browser API that handles all the heavy lifting behind the scenes to ensure your avatars are always ready.

## Quick start

The service is a single endpoint exposed in **unavatar.io** that can resolve:

- an **email**: https://unavatar.io/sindresorhus@gmail.com
- an **username**: https://unavatar.io/kikobeats
- a **domain**: https://unavatar.io/reddit.com

So, no matter what type of query you use, **unavatar.io** has you covered. You can read more about that in [providers](#providers).

## Query parameters

### TTL

Type: `number`|`string`<br/>
Default: `'24h'`<br/>
Range: from `'1h'` to `'28d'`

It determines the maximum quantity of time an avatar is considered fresh.

e.g., https://unavatar.io/kikobeats?ttl=1h

When you look up for a user avatar for the very first time, the service will determine it and cache it respecting TTL value.

The same resource will continue to be used until reach TTL expiration. After that, the resource will be computed, and cache as fresh, starting the cycle.

### Fallback

Type: `string`|`boolean`

When it can't be possible to get a user avatar, a fallback image is returned instead, and it can be personalized to fit better with your website or application style.

You can get one from **boringavatars.com**:

e.g., https://unavatar.io/github/37t?fallback=https://source.boringavatars.com/marble/120/1337_user?colors=264653r,2a9d8f,e9c46a,f4a261,e76f51

or **avatar.vercel.sh**:

e.g., https://unavatar.io/github/37t?fallback=https://avatar.vercel.sh/37t?size=400

or a static image:

e.g., https://unavatar.io/github/37t?fallback=https://avatars.githubusercontent.com/u/66378906?v=4

or even a base64 encoded image. This allows you to return a transparent, base64 encoded 1x1 pixel GIF, which can be useful when you want to use your own background colour or image as a fallback.

e.g., https://unavatar.io/github/37t?fallback=data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==

You can pass `fallback=false` to explicitly disable this behavior. In this case, a *404 Not Found* HTTP status code will returned when is not possible to get the user avatar.

### JSON

The service returns media content by default.

This is in this way to make easier consume the service from HTML markup.

In case you want to get a JSON payload as response, just pass `json=true`:

e.g., https://unavatar.io/kikobeats?json

## Pricing

The service is **FREE** for everyone, no registration required, with a daily rate limit of **50 requests** per IP address. 

For preventing abusive usage, the service has associated a daily rate limit based on requests IP address.

You can verify for your rate limit state checking the following headers in the response:

- `x-rate-limit-limit`: The maximum number of requests that the consumer is permitted to make per minute.
- `x-rate-limit-remaining`: The number of requests remaining in the current rate limit window.
- `x-rate-limit-reset`: The time at which the current rate limit window resets in UTC epoch seconds.

For higher usage, the **[PRO](https://unavatar.io/checkout)** plan is a usage-based plan billed monthly that removes rate limits and unlocks custom TTL.

Every request has a cost in tokens (**$0.001 per token**) based on the proxy tier needed to resolve the avatar:

| Proxy tier  | Tokens |  Cost  |
| ----------- | :----: | :----: |
| Origin      |   1    | $0.001 |
| Datacenter  |   +2   | $0.003 |
| Residential |   +4   | $0.007 |

The proxy tier used is returned in the `x-proxy-tier` response header, and the total cost in the `x-unavatar-cost` header.

```bash
$ curl -I -H "x-api-key: YOUR_API_KEY" https://unavatar.io/instagram/kikobeats

x-pricing-tier: pro
x-proxy-tier: origin
x-unavatar-cost: 1
```

To upgrade, visit [unavatar.io/checkout](https://unavatar.io/checkout). After completing the payment, you'll receive an API key.

## Providers

The providers are grouped based on which kind of input they can resolve.

Based on that, a subset of providers will be used for resolving the user query, being the avatar resolved the fastest provider that resolve the query successfully.

Alternatively, you can query for an individual provider.

| Provider                        | email | username | domain | phone |
| ------------------------------- | :---: | :------: | :----: | :---: |
| [Bluesky](#bluesky)             |       |    ✓     |        |       |
| [DeviantArt](#deviantart)       |       |    ✓     |        |       |
| [Dribbble](#dribbble)           |       |    ✓     |        |       |
| [DuckDuckGo](#duckduckgo)       |       |          |   ✓    |       |
| [GitHub](#github)               |       |    ✓     |        |       |
| [GitLab](#gitlab)               |       |    ✓     |        |       |
| [Google](#google)               |       |          |   ✓    |       |
| [Gravatar](#gravatar)           |   ✓   |          |        |       |
| [Instagram](#instagram)         |       |    ✓     |        |       |
| [Microlink](#microlink)         |       |          |   ✓    |       |
| [OnlyFans](#onlyfans)           |       |    ✓     |        |       |
| [OpenStreetMap](#openstreetmap) |       |    ✓     |        |       |
| [Reddit](#reddit)               |       |    ✓     |        |       |
| [SoundCloud](#soundcloud)       |       |    ✓     |        |       |
| [Spotify](#spotify)             |       |    ✓     |        |       |
| [Substack](#substack)           |       |    ✓     |        |       |
| [Telegram](#telegram)           |       |    ✓     |        |       |
| [TikTok](#tiktok)               |       |    ✓     |        |       |
| [Twitch](#twitch)               |       |    ✓     |        |       |
| [Vimeo](#vimeo)                 |       |    ✓     |        |       |
| [WhatsApp](#whatsapp)           |       |          |        |   ✓   |
| [X/Twitter](#xtwitter)          |       |    ✓     |        |       |
| [YouTube](#youtube)             |       |    ✓     |        |       |

### Bluesky

**supported**: `username`

It resolves user avatar against **bsky.app**.

e.g., https://unavatar.io/bluesky/pfrazee.com

### DeviantArt

**supported**: `username`

It resolves user avatar against **deviantart.com**.

e.g., https://unavatar.io/deviantart/spyed

### Dribbble

**supported**: `username`

It resolves user avatar against **dribbble.com**.

e.g., https://unavatar.io/dribbble/omidnikrah

### DuckDuckGo

**supported**: `domain`

It resolves user avatar using **duckduckgo.com**.

e.g., https://unavatar.io/duckduckgo/gummibeer.dev

### GitHub

**supported**: `username`

It resolves user avatar against **github.com**.

e.g., https://unavatar.io/github/mdo

### GitLab

**supported**: `username`

It resolves user avatar against **gitlab.com**.

e.g., https://unavatar.io/gitlab/inkscape

### Google

**supported**: `domain`

It resolves user avatar using **google.com**.

e.g., https://unavatar.io/google/netflix.com

### Gravatar

**supported**: `email`

It resolves user avatar against **gravatar.com**.

e.g., https://unavatar.io/gravatar/sindresorhus@gmail.com

### Instagram

**supported**: `username`

It resolves user avatar against **instagram.com**.

e.g., https://unavatar.io/instagram/willsmith

### Microlink

**supported**: `domain`

It resolves user avatar using **microlink.io**.

e.g., https://unavatar.io/microlink/microlink.io

### OnlyFans

**supported**: `username`

It resolves user avatar using **onlyfans.com**.

e.g., https://unavatar.io/onlyfans/amandaribas

### OpenStreetMap

**supported**: `username`

It resolves user avatar using **openstreetmap.org**.

The input accepts:

- Numeric user ID (API): https://unavatar.io/openstreetmap/98672
- Username (profile page): https://unavatar.io/openstreetmap/Terence%20Eden

e.g., https://unavatar.io/openstreetmap/98672

### Reddit

**supported**: `username`

It resolves user avatar against **reddit.com**.

e.g., https://unavatar.io/reddit/kikobeats

### SoundCloud

**supported**: `username`

It resolves user avatar against **soundcloud.com**.

e.g., https://unavatar.io/soundcloud/gorillaz

### Spotify

**supported**: `username`

It resolves user avatar against **open.spotify.com**.

The input supports a URI format `type:id`. When no type is provided, it defaults to `user`.

- `user` (default): https://unavatar.io/spotify/kikobeats
- `artist`: https://unavatar.io/spotify/artist:6sFIWsNpZYqbRiDnNOkZCA
- `playlist`: https://unavatar.io/spotify/playlist:37i9dQZF1DXcBWIGoYBM5M
- `album`: https://unavatar.io/spotify/album:4aawyAB9vmqN3uQ7FjRGTy
- `show`: https://unavatar.io/spotify/show:6UCtBYL29hRg064d4i5W2i
- `episode`: https://unavatar.io/spotify/episode:512ojhOuo1ktJprKbVcKyQ
- `track`: https://unavatar.io/spotify/track:11dFghVXANMlKmJXsNCbNl

### Substack

**supported**: `username`

It resolves user avatar against **substack.com**.

e.g., https://unavatar.io/substack/bankless

### Telegram

**supported**: `username`

It resolves user avatar against **telegram.com**.

e.g., https://unavatar.io/telegram/drsdavidsoft

### TikTok

**supported**: `username`

It resolves user avatar against **tiktok.com**.

e.g., https://unavatar.io/tiktok/carlosazaustre

### Twitch

**supported**: `username`

It resolves user avatar against **twitch.tv**.

e.g., https://unavatar.io/twitch/midudev

### Vimeo

**supported**: `username`

It resolves user avatar against **vimeo.com**.

e.g., https://unavatar.io/vimeo/staff

### WhatsApp

**supported**: `phone`

It resolves user avatar against **whatsapp.com**.

The input supports a URI format `type:id`. When no type is provided, it defaults to `phone`.

- `phone` (default): https://unavatar.io/whatsapp/34612345678
- `channel`: https://unavatar.io/whatsapp/channel:0029VaABC1234abcDEF56789
- `chat`: https://unavatar.io/whatsapp/chat:ABC1234DEFghi
- `group`: https://unavatar.io/whatsapp/group:ABC1234DEFghi

### X/Twitter

**supported**: `username`

It resolves user avatar against **x.com**.

e.g., https://unavatar.io/x/kikobeats

### YouTube

**supported**: `username`

It resolves user avatar against **youtube.com**.

e.g., https://unavatar.io/youtube/casey

## Response Format

A response is returning the user avatar by default.

However, you can get a [json](#json) as response payload.

When an endpoint returns JSON, the shape is predictable so you can parse it reliably in your app:

| Field     | Type           | Present in                    | Description                                      |
| --------- | -------------- | ----------------------------- | ------------------------------------------------ |
| `status`  | `string`       | all JSON responses            | One of: `success`, `fail`, `error`.              |
| `message` | `string`       | all JSON responses            | Human-readable summary for display/logging.      |
| `data`    | `object`       | `success`                     | Response payload for successful requests.        |
| `code`    | `string`       | `fail`, `error`               | Stable machine-readable error code.              |
| `more`    | `string (URL)` | most `fail`/`error` responses | Documentation URL with troubleshooting details.  |
| `report`  | `string`       | some `error` responses        | Support contact channel (for example `mailto:`). |

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
| 429  | `ERATE`              | Free-tier daily rate limit exceeded         |
| 500  | `ECHECKOUT`          | Stripe checkout session creation failed     |
| 500  | `EAPIKEYFAILED`      | API key retrieval after checkout failed     |
| 500  | `EINTERNAL`          | Unexpected internal server failure          |

## Contact

If you have any suggestion or bug to report, please contact to ust mailing to hello@unavatar.io.
