All provider auxiliary functions in `src/providers/` must use consistent names:

- `getAvatarUrl(input)` — builds the URL to visit/scrape from user input (input → URL string). Passed as `url` to `createHtmlProvider`.
- `getAvatar($)` — extracts the avatar URL from fetched HTML markup (cheerio $ → URL string). Passed as `getter` to `createHtmlProvider`.
- `parseInput(input)` — parses input when multiple formats are supported (e.g. "type:id"). Never prefix with provider name.

Exports should be `module.exports.getAvatarUrl`, `module.exports.getAvatar`, `module.exports.parseInput`. Update corresponding test files in `test/unit/providers/` when renaming.
