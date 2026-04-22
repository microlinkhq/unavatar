# Server Usage

Use `unavatar` as a self-hosted HTTP server.

From [`./server.js`](./server.js).

## Routes

| Route                 | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `GET /email/:key`     | Resolve with email providers                         |
| `GET /domain/:key`    | Resolve with domain providers                        |

Append `?json` to any route to get the avatar URL as JSON instead of a `302` redirect.

## Run

```bash
node docs/server/server.js
```

## Try it

```bash
# Redirect to the avatar image
curl -L http://localhost:3000/email/hello@microlink.io

# Get the avatar URL as JSON from explicit input type
curl http://localhost:3000/email/hello@microlink.io?json
curl http://localhost:3000/domain/reddit.com?json
```
