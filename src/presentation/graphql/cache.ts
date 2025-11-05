import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';

export function createApolloCache() {
  return new InMemoryLRUCache({
    maxSize: 50 * 1024 * 1024, // 50MB
  });
}
