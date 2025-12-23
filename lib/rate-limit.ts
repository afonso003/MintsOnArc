// Rate limiting simples (em produção, usar Redis)
import { LRUCache } from "lru-cache"

// Tipos para LRUCache
type RateLimitCache = LRUCache<string, number[], unknown>

interface RateLimitOptions {
  interval: number // em milissegundos
  uniqueTokenPerInterval: number // número máximo de requisições por intervalo
}

const rateLimitStore: RateLimitCache = new LRUCache<string, number[]>({
  max: 10000,
  ttl: 60000, // 1 minuto
})

export function rateLimit(options: RateLimitOptions) {
  return {
    check: (limit: number, token: string): Promise<boolean> =>
      Promise.resolve(checkLimit(limit, token, options)),
  }
}

function checkLimit(limit: number, token: string, options: RateLimitOptions): boolean {
  const now = Date.now()
  const windowStart = now - options.interval

  const timestamps = rateLimitStore.get(token) || []
  const validTimestamps = timestamps.filter((ts) => ts > windowStart)

  if (validTimestamps.length >= limit) {
    return false
  }

  validTimestamps.push(now)
  rateLimitStore.set(token, validTimestamps)

  return true
}

// Rate limiter específico para mints
export const mintRateLimiter = rateLimit({
  interval: 60000, // 1 minuto
  uniqueTokenPerInterval: 10, // 10 mints por minuto por IP/wallet
})

