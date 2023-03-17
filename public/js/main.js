window.$docsify = {
  name: 'unavatar',
  repo: 'microlinkhq/unavatar',
  logo: '/fallback.png',
  externalLinkRel: 'noopener noreferrer'
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.app-name-link').onclick = event => {
    event.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})
