---
name: provider-naming
description: Enforces consistent naming for provider auxiliary functions in src/providers/. Use when creating, renaming, or reviewing provider modules or their tests.
---

# Provider Naming

All provider auxiliary functions in `src/providers/` must use consistent names:

- `getAvatarUrl(input)` — builds the URL to visit/scrape from user input (input → URL string). Passed as `url` to `createHtmlProvider` or `createApiProvider`.
- `getAvatar($)` — extracts the avatar URL from fetched HTML markup (cheerio $ → URL string). Passed as `getter` to `createHtmlProvider`.
- `getAvatar({ body, NOT_FOUND })` — reads the avatar URL from a JSON API response. `createApiProvider` calls the getter with the response only, so the factory injects `NOT_FOUND` from its own context: `getter: ({ body }) => getAvatar({ body, NOT_FOUND })`.
- `isBlocked({ body, statusCode })` — recognizes an anti-bot or quota answer the API sends with its own payload (e.g. zhihu `40352`, bilibili `-352`). Passed as `isBlocked` to `createApiProvider`. 403 and 429 are already treated as blocks.
- `parseInput(input)` — parses input when multiple formats are supported (e.g. "type:id"). Never prefix with provider name.

## HTML or JSON provider

Use `createHtmlProvider` when the avatar comes from a page, `createApiProvider` when it comes from a JSON API. Both run through the `onFetch` hook, so a blocked request is retried through the proxy tiers. Never call `got` directly for the avatar request: it skips that fallback.

A `createApiProvider` getter returns one of three things, and the choice decides proxy cost:

- a URL string — found.
- `NOT_FOUND` — the account does not exist or has no avatar. Never retried, so it spends no proxy tier. Use it only for answers the API gives about the account itself (a 404, a "user missing" code, a placeholder avatar).
- `undefined` — the response is not recognizable. Retried through the next proxy tier.

A response with status 404 is `NOT_FOUND`, 403/429 or a non-JSON 200 is blocked, and any other status ≥ 400 is retried, all before the getter runs. Inputs the upstream rejects on their shape (e.g. deezer 403s on whitespace) should resolve to `undefined` before any request, so they never reach a paid proxy tier.

Exports should be `module.exports.getAvatarUrl`, `module.exports.getAvatar`, `module.exports.parseInput` (and `isBlocked` for JSON providers). Update corresponding test files in `test/unit/providers/` when renaming.
