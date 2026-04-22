# CLI Usage

The package ships binaries that connect to a running unavatar server and display the avatar in your terminal.

## Binaries

| Binary         | Server                             |
| -------------- | ---------------------------------- |
| `unavatar`     | `https://unavatar.io` (production) |
| `unavatar-dev` | `http://[::]:3000` (local)         |

## Examples

```bash
# Typed input routes
unavatar email/hello@microlink.io
unavatar domain/reddit.com

# Specific provider
unavatar github/kikobeats
unavatar x/kikobeats

# Health check
unavatar ping
```

## API key

Pass an API key with `--apiKey`:

```bash
unavatar github/kikobeats --apiKey YOUR_KEY
```
