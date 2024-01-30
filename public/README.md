![logo](https://unavatar.io/banner.png ':id=banner')

Welcome to **unavatar.io**, the ultimate avatar service that offers everything you need to easily retrieve user avatars:

- **Versatile**: A wide range of platforms and services including Facebook, Instagram, YouTube, Twitter, Gravatar, etc., meaning you can rule all of them just querying against unavatar.

- **Speed**: Designed to be fast and efficient, all requests are being cached and delivered +200 global datacenters, allowing you to consume avatars instantly, counting more than 20 millions requests per month.

- **Optimize**: All the images are not only compressed on-the-fly to reduce their size and save bandwith, but also optimized to maintain a high-quality ratio. They are ready for immediate use, enhancing the overall optimization of your website or application.

- **Integration**: The service seamlessly incorporates into your current applications or websites with ease. We offer straightforward documentation and comprehensive support to ensure a quick and effortless onboarding experience.

In summary, **unavatar.io** provides versatility, speed, optimization, and effortless integration, making it the ultimate avatar retrieval service.

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

or even an static image:

e.g., https://unavatar.io/github/37t?fallback=https://avatars.githubusercontent.com/u/66378906?v=4

You can pass `fallback=false` for explicitly disable this behavior. In that case, a *404 Not Found* HTTP status code will returned when is not possible to get the user avatar.

### JSON

The service returns media content by default.

This is in this way to make easier consume the service from HTML markup.

In case you want to get a JSON payload as response, just pass `json=true`:

e.g., https://unavatar.io/kikobeats?json

## Limitations

For preventing abusive usage, the service has associated a daily rate limit based on requests IP address.

You can verify for your rate limit state checking the following headers in the response:

- `x-rate-limit-limit`: The maximum number of requests that the consumer is permitted to make per minute.
- `x-rate-limit-remaining`: The number of requests remaining in the current rate limit window.
- `x-rate-limit-reset`: The time at which the current rate limit window resets in UTC epoch seconds.

When you reach the API quota limit, you will experience HTTP 429 errors, meaning you need to wait until the API quota reset. If you need more quota, <a target="_blank" rel="noopener noreferrer" href="mailto:hello@microlink.io?subject=unavatar.io%20API%20key&amp;body=Hello%2C%0D%0A%0D%0AWe%20wanted%20unlimited%20usage%20for%20unavatar.io.%0D%0A%0D%0APlease%2C%20tell%20us%20how%20to%20proceed.">contact us</a>.

## Providers

With **unavatar.io**, you can retrieve user avatars based on an **email**, **domain**, or **username**.

The providers are grouped based on which kind of input they can resolve.

Based on that, a subset of providers will be used for resolving the user query, being the avatar resolved the fastest provider that resolve the query successfully.

Alternatively, you can query for an individual provider.

### DeviantArt

Type: `username`

It resolves user avatar against **deviantart.com**.

e.g., https://unavatar.io/deviantart/spyed

### Dribbble

Type: `username`

It resolves user avatar against **dribbble.com**.

e.g., https://unavatar.io/dribbble/omidnikrah

### DuckDuckGo

Type: `domain`

It resolves user avatar using **duckduckgo.com**.

e.g., https://unavatar.io/duckduckgo/gummibeer.dev

### GitHub

Type: `username`

It resolves user avatar against **github.com**.

e.g., https://unavatar.io/github/mdo

### Google

Type: `domain`

It resolves user avatar using **google.com**.

e.g., https://unavatar.io/google/netflix.com

### Gravatar

Type: `email`

It resolves user avatar against **gravatar.com**.

e.g., https://unavatar.io/gravatar/sindresorhus@gmail.com

### Instagram

Type: `username`

It resolves user avatar against **instagram.com**.

e.g., https://unavatar.io/instagram/willsmith

### Microlink

Type: `domain`

It resolves user avatar using **microlink.io**.

e.g., https://unavatar.io/microlink/microlink.io

### Read.cv

Type: `username`

It resolves user avatar against **read.cv**.

e.g., https://unavatar.io/readcv/elenatorro

### Reddit

Type: `username`

It resolves user avatar against **reddit.com**.

e.g., https://unavatar.io/reddit/kikobeats

### SoundCloud

Type: `username`

It resolves user avatar against **soundcloud.com**.

e.g., https://unavatar.io/soundcloud/gorillaz

### Substack

Type: `username`

It resolves user avatar against **substack.com**.

e.g., https://unavatar.io/substack/bankless

### Telegram

Type: `username`

It resolves user avatar against **telegram.com**.

e.g., https://unavatar.io/telegram/drsdavidsoft

### Twitter

Type: `username`

It resolves user avatar against **twitter.com**.

e.g., https://unavatar.io/twitter/kikobeats

### YouTube

Type: `username`

It resolves user avatar against **youtube.com**.

e.g., https://unavatar.io/youtube/casey
