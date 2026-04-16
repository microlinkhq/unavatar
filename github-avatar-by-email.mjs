// github-avatar-by-email.mjs
const email = 'josefrancisco.verdu@gmail.com'

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'unavatar-email-example'
}

const getJson = async url => {
  const res = await fetch(url, { headers })

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${url}`)
  }

  return res.json()
}

const searchUsers = async email => {
  const url = `https://api.github.com/search/users?q=${encodeURIComponent(
    email
  )}&per_page=10`

  const data = await getJson(url)
  return data.items ?? []
}

const getUser = async login =>
  getJson(`https://api.github.com/users/${encodeURIComponent(login)}`)

const searchCommitsByEmail = async email => {
  const q = `author-email:${email}`
  const url = `https://api.github.com/search/commits?q=${encodeURIComponent(
    q
  )}&per_page=20`

  const data = await getJson(url)
  return data.items ?? []
}

const findExactPublicProfileMatch = async email => {
  const candidates = await searchUsers(email)

  for (const candidate of candidates) {
    const user = await getUser(candidate.login)

    if (user.email?.toLowerCase() === email.toLowerCase()) {
      return {
        strategy: 'public-profile-email',
        confidence: 1,
        login: user.login,
        avatarUrl: user.avatar_url,
        profileUrl: user.html_url
      }
    }
  }

  return null
}

const buildCommitCandidate = item => {
  const linkedUser = item.author || item.committer

  if (!linkedUser?.login || !linkedUser?.avatar_url || !linkedUser?.html_url) {
    return null
  }

  return {
    login: linkedUser.login,
    avatarUrl: linkedUser.avatar_url,
    profileUrl: linkedUser.html_url,
    commitUrl: item.html_url,
    repo: item.repository?.full_name ?? null
  }
}

const findCommitConsensusMatch = async email => {
  const commits = await searchCommitsByEmail(email)
  const candidates = commits.map(buildCommitCandidate).filter(Boolean)

  if (candidates.length === 0) return null

  const counts = new Map()

  for (const candidate of candidates) {
    const entry = counts.get(candidate.login) ?? {
      count: 0,
      candidate
    }

    entry.count += 1
    counts.set(candidate.login, entry)
  }

  const [winner] = [...counts.values()].sort((left, right) => {
    return right.count - left.count
  })

  const confidence = winner.count / candidates.length

  return {
    strategy: 'commit-author-email',
    confidence,
    matches: winner.count,
    totalLinkedCommits: candidates.length,
    ...winner.candidate
  }
}

const getGithubAvatarByEmail = async email => {
  const directMatch = await findExactPublicProfileMatch(email)
  if (directMatch) return directMatch

  return findCommitConsensusMatch(email)
}

const result = await getGithubAvatarByEmail(email)

if (!result) {
  console.log('No GitHub avatar found for this email.')
} else {
  console.log(JSON.stringify(result, null, 2))
}
