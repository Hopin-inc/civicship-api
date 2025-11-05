import responseCachePlugin from '@apollo/server-plugin-response-cache';
import type { IContext } from '@/types/server';
import logger from '@/infrastructure/logging';

const CACHEABLE_OPERATIONS = new Set([
  'getTransactions',
]);

const CACHE_SAMPLE_RATE = 1.0;

const DEFAULT_TTL = 2;

let cacheHits = 0;
let cacheMisses = 0;
let cacheWrites = 0;
let cacheBypasses = 0;

setInterval(() => {
  const total = cacheHits + cacheMisses + cacheBypasses;
  if (total > 0) {
    const hitRate = total > 0 ? (cacheHits / (cacheHits + cacheMisses) * 100).toFixed(2) : '0.00';
    logger.info('[apollo-cache] Metrics', {
      hits: cacheHits,
      misses: cacheMisses,
      bypasses: cacheBypasses,
      writes: cacheWrites,
      hitRate: `${hitRate}%`,
      sampleRate: CACHE_SAMPLE_RATE,
    });
    cacheHits = 0;
    cacheMisses = 0;
    cacheWrites = 0;
    cacheBypasses = 0;
  }
}, 60_000);

function shouldCacheRequest(requestContext: any): boolean {
  const bypassHeader = requestContext.request.http?.headers.get('x-bypass-response-cache');
  if (bypassHeader === '1') {
    cacheBypasses++;
    return false;
  }

  const operation = requestContext.operation?.operation;
  if (operation !== 'query') {
    return false;
  }

  const operationName = requestContext.request.operationName;
  if (!operationName || !CACHEABLE_OPERATIONS.has(operationName)) {
    return false;
  }

  if (CACHE_SAMPLE_RATE < 1.0) {
    const ctx = requestContext.contextValue as IContext;
    const correlationId = ctx?.correlationId || '';
    const lastChar = correlationId.slice(-1);
    const hash = parseInt(lastChar, 16) || 0;
    if (hash / 16 > CACHE_SAMPLE_RATE) {
      return false;
    }
  }

  return true;
}

export function createResponseCachePlugin() {
  return responseCachePlugin({
    defaultMaxAge: DEFAULT_TTL,
    
    sessionId: (requestContext) => {
      const ctx = requestContext.contextValue as IContext;
      const communityId = ctx?.communityId ?? 'public';
      const uid = ctx?.uid ?? 'anon';
      return `${communityId}:${uid}`;
    },

    shouldReadFromCache: async (requestContext) => {
      if (!shouldCacheRequest(requestContext)) {
        return false;
      }

      const cacheKey = requestContext.cache.keyFor(requestContext.request);
      const cached = await requestContext.cache.get(cacheKey);
      
      if (cached) {
        cacheHits++;
      } else {
        cacheMisses++;
      }

      return true;
    },

    shouldWriteToCache: async (requestContext) => {
      if (!shouldCacheRequest(requestContext)) {
        return false;
      }

      const response = requestContext.response;
      const hasErrors = 
        response?.body?.kind === 'single' && 
        response.body.singleResult.errors?.length;

      if (hasErrors) {
        return false;
      }

      cacheWrites++;
      return true;
    },

    async willSendResponse(requestContext) {
      if (process.env.NODE_ENV === 'development') {
        const ctx = requestContext.contextValue as IContext;
        const bypassHeader = requestContext.request.http?.headers.get('x-bypass-response-cache');
        
        let cacheStatus = 'MISS';
        if (bypassHeader === '1') {
          cacheStatus = 'BYPASS';
        } else if (shouldCacheRequest(requestContext)) {
          const cacheKey = requestContext.cache.keyFor(requestContext.request);
          const cached = await requestContext.cache.get(cacheKey);
          if (cached) {
            cacheStatus = 'HIT';
          }
        }

        requestContext.response.http?.headers.set(
          'X-Apollo-Response-Cache',
          cacheStatus
        );
        requestContext.response.http?.headers.set(
          'X-Apollo-Cache-Key',
          `${ctx?.communityId}:${ctx?.uid}`
        );
      }
    },
  });
}
