# Server Usage

Use `unavatar` as a self-hosted HTTP server.

From [`./server.js`](./server.js).

## Routes

| Route                 | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `GET /:provider/:key` | Resolve avatar from a specific provider              |
| `GET /:key`           | Auto-resolve by input type (email, domain, username) |

Append `?json` to any route to get the avatar URL as JSON instead of a `302` redirect.

## Run

```bash
node docs/server/server.js
```

## Try it

```bash
# Redirect to the avatar image
curl -L http://localhost:3000/github/kikobeats

# Get the avatar URL as JSON
curl http://localhost:3000/github/kikobeats?json

# Auto-resolve from email
curl http://localhost:3000/hello@microlink.io?json
```
