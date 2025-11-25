# Performance Guide

This document describes performance optimization strategies, query optimization, caching strategies, and monitoring/observability for civicship-api.

## Performance Optimization Strategies

### 1. DataLoader Pattern

**Purpose:** Prevent the N+1 query problem in GraphQL

For detailed implementation information, see the "DataLoader Pattern" section in [Implementation Patterns](PATTERNS.md).

#### Key Optimization Points

``` typescript
// Efficient batch processing
export const createUserDataLoader = (issuer: PrismaClientIssuer) => {
return new DataLoader<string, PrismaUser | null>(
async (userIds: readonly string[]) => {
/ Retrieve multiple users in a single query
const users = await issuer.internal((tx) =>
tx.user.findMany({
where: { id: { in: [...userIds] } },
include: {
memberships: {
include: { community: true }
}
}
}),
);

/ Mapping while preserving ID order
return userIds.map(id => users.find(user => user.id === id) || null);
},
{
/ Caching within the request lifecycle
cache: true,
maxBatchSize: 100,
batchScheduleFn: callback => setTimeout(callback, 10)
}
);
};
```

Performance Improvements:
- Reduces N+1 queries to a single query
- Eliminates data duplication within a request
- Significantly reduces database load

### 2. Database Views

Purpose: Precalculate complex aggregate queries

Note: Some materialized views have been converted to regular views (see migration `20250403080546_convert_mv_to_view`). The current point balance view is implemented as a regular view.

#### Current Point Balance View

```sql
-- current_point_view: Real-time point balance (converted to a normal view)
CREATE VIEW current_point_view AS
SELECT
wallet_id,
SUM(
CASE
WHEN transaction_type = 'CREDIT' THEN amount
WHEN transaction_type = 'DEBIT' THEN -amount
ELSE 0
END
) as current_balance,
COUNT(*) as transaction_count,
MAX(created_at) as last_transaction_at
FROM transactions
WHERE status = 'COMPLETED'
GROUP BY wallet_id;
```

#### Remaining Slot Capacity View

```sql
-- mv_accumulated_points: Accumulated Earned Points
CREATE MATERIALIZED VIEW mv_accumulated_points AS
SELECT
wallet_id,
SUM(amount) as total_earned, 
COUNT(*) as earning_transactions, 
MIN(created_at) as first_earned_at, 
MAX(created_at) as last_earned_at
FROM transactions
WHERE transaction_type = 'CREDIT' 
AND status = 'COMPLETED' 
AND reason IN ('POINT_ISSUED', 'GRANT', 'REWARD')
GROUP BY wallet_id;
````

#### Opportunity Participation Statistics View

```sql
-- mv_opportunity_participation_stats: Opportunity participation statistics
CREATE MATERIALIZED VIEW mv_opportunity_participation_stats AS
SELECT 
opportunity_id, 
COUNT(DISTINCT user_id) as total_participants, 
COUNT(CASE WHEN status = 'PARTICIPATING' THEN 1 END) as active_participants, COUNT(CASE WHEN evaluation_status = 'PASSED' THEN 1 END) as passed_participants,
AVG(CASE WHEN evaluation_score IS NOT NULL THEN evaluation_score END) as average_score
FROM participations
GROUP BY opportunity_id;
```

#### View Features

**Advantages of Regular Views**
- Real-time data reflection
- Automatic updates (no manual refresh required)
- Reduced storage usage

**Cautions**
- Calculations occur during query execution
- Complex queries may affect performance
- Appropriate index design is important

### 3. Database Index Optimization

#### Primary Indexes

```prisma
// Index definition in schema.prisma
model User {
id String @id
email String @unique
createdAt DateTime @default(now())
  
// Performance-optimized index
@@index([email])
@@index([createdAt])
@@index([email, createdAt])
}

model Transaction {
id String @id
walletId String
amount Int
transactionType TransactionType
status TransactionStatus
createdAt DateTime @default(now())

// Index for frequent queries
@@index([walletId])
@@index([walletId, status])
@@index([walletId, createdAt])
@@index([status, createdAt])
@@index([transactionType, status])
}

model Participation {
id String @id
userId String
opportunityId String
status ParticipationStatus
createdAt DateTime @default(now())

// Index for participation statistics
@@index([opportunityId])
@@index([userId, status])
@@index([opportunityId, status])
@@index([createdAt])
}
```

#### Monitoring Index Usage

```sql
-- Check Index Usage Statistics
SELECT
schemaname,
tablename,
indexname,
idx_scan,
idx_tup_read,
idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Identify Unused Indexes
SELECT
schemaname,
tablename,
indexname,
idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

## Query Optimization

### 1. Efficient Data Retrieval

```typescript
// Bad Example: N+1 Query
const communities = await prisma.community.findMany();
for (const community of communities) {
const members = await prisma.membership.findMany({
where: { communityId: community.id }
});
}

// Good example: Include related data
const communities = await prisma.community.findMany({
include: {
memberships: {
include: {
user: true
}
}
}
});
```

### 2. Selective Field Retrieval

``` typescript
// Select only the fields you need
const users = await prisma.user.findMany({
select: {
id: true,
name: true,
email: true,
// Exclude unnecessary large fields
}
});
```

### 3. Pagination

``` typescript
// Cursor-based pagination
const getOpportunities = async (cursor?: string, limit = 20) => {
return prisma.opportunity.findMany({
take: limit,
skip: cursor ? 1 : 0,
cursor: cursor ? { id: cursor } : undefined,
orderBy: { createdAt: 'desc' }
});
};
```

## Caching Strategies

### 1. Request-Level Caching

``` typescript
// In-Request Caching with DataLoader
export const createDataLoaders = (issuer: PrismaClientIssuer) => ({
user: createUserDataLoader(issuer),
community: createCommunityDataLoader(issuer),
wallet: createWalletDataLoader(issuer),
// Automatic Caching within the Request Lifecycle
});
```

### 2. Application-Level Caching

``` typescript
// Session Caching Using Redis
import Redis from 'ioredis';

const redis = new Redis({
host: process.env.REDIS_HOST,
port: parseInt(process.env.REDIS_PORT || '6379'),
});

export const cacheUserSession = async (userId: string, sessionData: any) => {
await redis.setex(`session:${userId}`, 3600, JSON.stringify(sessionData));
};

export const getUserSession = async (userId: string) => {
const cached = await redis.get(`session:${userId}`);
return cached ? JSON.parse(cached) : null;
};
```

### 3. Database-Level Caching

```sql
-- PostgreSQL Query Result Cache Settings
SET shared_preload_libraries = 'pg_stat_statements';
SET track_activity_query_size = 2048;
SET pg_stat_statements.track = all;
```

### 4. CDN Caching

``` typescript
// Serving Static Assets with Google Cloud Storage
export const uploadWithCacheHeaders = async (file: Buffer, fileName: string) => {
const fileUpload = bucket.file(fileName);

await fileUpload.save(file, {
metadata: {
cacheControl: 'public, max-age=31536000', // Cache for 1 year
contentType: 'image/jpeg'
}
});

return fileUpload.publicUrl();
};
```

## Monitoring and Observability

### 1. Application Metrics

``` typescript
// Custom Metric Collection
export const trackBusinessMetrics = {
communityCreated: () => {
logger.info('Business metric: Community created', {
metric: 'community_created',
timestamp: new Date().toISOString()
});
},

opportunityParticipation: (opportunityId: string, userId: string) => {
logger.info('Business metric: Opportunity participation', {
metric: 'opportunity_participation',
opportunityId,
userId,
timestamp: new Date().toISOString()
});
},

pointsTransferred: (amount: number, fromWallet: string, toWallet: string) => {
logger.info('Business metric: Points transferred', {
metric: 'points_transferred',
amount,
fromWallet,
toWallet,
timestamp: new Date().toISOString()
});
}
};
```

### 2. Database Monitoring

```Typescript
// Database Query Performance Monitoring
const queryMiddleware = async (params: any, next: any) => {
const start = Date.now();
const result = await next(params);
const duration = Date.now() - start;

if (duration > 1000) {
logger.warn('Slow query detected', {
model: params.model,
action: params.action,
duration,
args: JSON.stringify(params.args)
});
}

/ Metric Collection
logger.info('Database query executed', {
model: params.model,
action: params.action,
duration
});

return result;
};

// Register Prisma Middleware
prisma.$use(queryMiddleware);
```

### 3. Error Tracking

``` typescript
// Comprehensive Error Logging and Alerting
export const errorTracker = {
logError: (error: Error, context: any) => {
logger.error('Application error', {
error: error.message,
stack: error.stack,
context,
timestamp: new Date().toISOString(),
severity: 'error'
});
},

logWarning: (message: string, context: any) => {
logger.warn('Application warning', {
message,
context,
timestamp: new Date().toISOString(),
severity: 'warning'
});
}
};
```

### 4. Performance Monitoring

``` typescript
// Request Latency and Throughput Tracking
export const performanceTracker = (req: Request, res: Response, next: NextFunction) => {
const start = Date.now();

res.on('finish', () => {
const duration = Date.now() - start;

logger.info('Request completed', {
method: req.method,
url: req.url,
statusCode: res.statusCode,
duration,
userAgent: req.get('User-Agent'),
ip: req.ip
});

/ Slow Request Alert
if (duration > 5000) {
logger.warn('Slow request detected', {
method: req.method,
url: req.url,
duration
});
}
});

next();
};
```

## Performance Testing

### 1. Load Testing

```typescript
// Example of a Jest performance test
describe('Performance Tests', () => {
it('should handle concurrent user creation', async () => {
const startTime = Date.now();

const promises = Array.from({ length: 100 }, () =>
UserFactory.create()
);

await Promise.all(promises);

const duration = Date.now() - startTime;
expect(duration).toBeLessThan(5000); // Within 5 seconds
});

it('should efficiently load community members', async () => {
const community = await CommunityFactory.create();
await Promise.all(
Array.from({ length: 50 }, () =>
MembershipFactory.create({ transientCommunity: community })
)
);

const startTime = Date.now();
const members = await prisma.membership.findMany({
where: { communityId: community.id },
include: { user: true }
});
const duration = Date.now() - startTime;

expect(members).toHaveLength(50);
expect(duration).toBeLessThan(1000); // Within 1 second
});
});
```

### 2. Memory Usage Monitoring

```bash
# Node.js Memory Usage Monitoring
node --inspect --max-old-space-size=4096 dist/index.js

# Memory Profiling with Chrome DevTools
# Open chrome://inspect and run profiling
```

## Optimization Best Practices

### 1. Database Optimization

- **Appropriate Index Design**
- **Regularly Review Query Plans**
- **Regularly Clean Up Unnecessary Data**
- **Utilize Database Views**

### 2. Application Optimization

- **Consistently Use the DataLoader Pattern**
- **Efficient GraphQL Query Design**
- **Appropriate Caching Strategy**
- **Utilize Asynchronous Processing**

### 3. Infrastructure Optimization

- **Appropriate Resource Allocation**
- **Autoscaling Configuration**
- **Utilize a CDN**
- **Database Connection Pooling**

## Related Documentation

- [Architecture Guide](./ARCHITECTURE.md) - System Design Overview
- [Implementation Patterns](PATTERNS.md) - DataLoader and Performance Patterns
- [Infrastructure Guide](INFRASTRUCTURE.md) - Database and Cache Configuration
- [Deployment Guide](./DEPLOYMENT.md) - Production Environment Optimization
- [Troubleshooting](TROUBLESHOOTING.md) - Resolving performance issues
