# Library Usage

Use `unavatar` as a Node.js library to resolve avatars programmatically.

## Basic usage

From [`./basic.js`](./basic.js):

```js
const unavatar = require('@unavatar/core')()

// Resolve with explicit input type
const result = await unavatar.email('hello@microlink.io')

// Domain resolution
const domainResult = await unavatar.domain('reddit.com')

// Specific provider
const githubResult = await unavatar.github('kikobeats')
```

Run it:

```bash
node docs/library/basic.js
```

## Custom constants

Pass custom constants to override defaults:

```js
const unavatar = require('@unavatar/core')({
  constants: {
    AVATAR_SIZE: 200,
    REQUEST_TIMEOUT: 10000
  }
})
```

## Result shape

Every result returns `{ type, data, provider }`:

| Field      | Description                                           |
| ---------- | ----------------------------------------------------- |
| `type`     | `'url'` for a regular URL, `'buffer'` for a data URI |
| `data`     | The avatar URL or data URI                            |
| `provider` | The provider name that resolved the avatar            |

## Providers helper example

From [`./providers.js`](./providers.js):

- List providers
- Group providers by input type
- Detect input types
- Iterate over multiple providers

Run it:

```bash
node docs/library/providers.js
```

## Configuration reference

All settings are passed via the `constants` object during initialization:

```js
const unavatar = require('@unavatar/core')({
  constants: {
    AVATAR_SIZE: 400,
    REQUEST_TIMEOUT: 25000,
    TTL_DEFAULT: 2419200000,
    MICROLINK_API_KEY: 'your-key'
  }
})
```

| Constant            | Default                | Description                                   |
| ------------------- | ---------------------- | --------------------------------------------- |
| `AVATAR_SIZE`       | `400`                  | Default avatar size in pixels                 |
| `REQUEST_TIMEOUT`   | `25000`                | Maximum time (ms) for a provider request      |
| `TTL_DEFAULT`       | `2419200000` (28 days) | Default cache TTL in milliseconds             |
| `MICROLINK_API_KEY` | -                      | API key for the Microlink provider (optional) |
| `TMP_FOLDER`        | `/dev/shm` or `/tmp`   | Temp folder for puppeteer data                |

Calling `require('@unavatar/core')()` with no arguments uses all defaults.
