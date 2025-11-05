import responseCachePlugin from '@apollo/server-plugin-response-cache';
import type { IContext } from '@/types/server';
import logger from '@/infrastructure/logging';
import { getCorrelationId } from '@/infrastructure/observability/als';

const CACHEABLE_OPERATIONS = new Set([
  'getTransactions',
]);

const CACHE_SAMPLE_RATE = 1.0;

let cacheEligible = 0;
let cacheBypasses = 0;

setInterval(() => {
  const total = cacheEligible + cacheBypasses;
  if (total > 0) {
    logger.info('[apollo-cache] Metrics', {
      eligible: cacheEligible,
      bypasses: cacheBypasses,
      sampleRate: CACHE_SAMPLE_RATE,
    });
    cacheEligible = 0;
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
    const correlationId = getCorrelationId() || '';
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
    sessionId: async (requestContext) => {
      const ctx = requestContext.contextValue as IContext;
      if ('communityId' in ctx && 'uid' in ctx) {
        const communityId = ctx.communityId ?? 'public';
        const uid = ctx.uid ?? 'anon';
        return `${communityId}:${uid}`;
      }
      return 'public:anon';
    },

    shouldReadFromCache: async (requestContext) => {
      const shouldCache = shouldCacheRequest(requestContext);
      if (shouldCache) {
        cacheEligible++;
      }
      return shouldCache;
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

      return true;
    },
  });
}
