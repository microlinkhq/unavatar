import { IncomingMessage, ServerResponse } from 'http'

export type Provider =
  | 'bluesky'
  | 'deviantart'
  | 'dribbble'
  | 'duckduckgo'
  | 'github'
  | 'gitlab'
  | 'google'
  | 'gravatar'
  | 'instagram'
  | 'microlink'
  | 'onlyfans'
  | 'openstreetmap'
  | 'reddit'
  | 'soundcloud'
  | 'spotify'
  | 'substack'
  | 'telegram'
  | 'tiktok'
  | 'twitch'
  | 'vimeo'
  | 'whatsapp'
  | 'x'
  | 'twitter'
  | 'youtube'

export interface UnavatarOptions {
  /**
   * The port to listen on.
   * @default 3000
   */
  port?: number

  /**
   * The host to bind to.
   * @default '0.0.0.0'
   */
  host?: string

  /**
   * Enable debug logging.
   * @default false
   */
  debug?: boolean

  /**
   * API key for authenticated requests.
   */
  apiKey?: string

  /**
   * Storage adapter to use (e.g., 'redis', 'memory').
   * @default 'memory'
   */
  storage?: 'redis' | 'memory'
}

export interface UnavatarRequest {
  provider: Provider
  key: string
}

export interface UnavatarResponse {
  url: string
  provider: Provider
  cache: {
    ttl: number
    since: string
  }
}

export interface UnavatarError {
  statusCode: number
  message: string
  headers?: Record<string, string>
}

declare function createServer(options?: UnavatarOptions): ReturnType<typeof import('http').createServer>
export default createServer
