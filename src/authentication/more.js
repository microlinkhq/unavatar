const message = `
Hello,

I want to upgrade to pay-as-you-go pricing, which includes:

- Charges are based on API usage.
-  Only successful non-cached avatar resolutions are counted.
-  It’s completely free while in testing.

Can you tell me how to proceed?
`.trim()

const email = 'hello@microlink.io'
const subject = encodeURIComponent('[unavatar] pay-as-you-go pricing')
const body = encodeURIComponent(message)

module.exports = `mailto:${email}?subject=${subject}&body=${body}`
