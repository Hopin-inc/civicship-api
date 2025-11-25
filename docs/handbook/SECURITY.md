# Security Architecture

This document describes civicship-api's security architecture, authentication flow, authorization system, and security best practices.

## Security Architecture Overview

civicship-api employs a four-tier security architecture:

1. **Authentication Layer** - User Identity Verification
2. **GraphQL Authorization Layer** - API-level Permission Checks
3. **Row-Level Security (RLS)** - Database-level Automatic Filtering
4. **Business Logic Layer** - Domain-specific Access Control

## Authentication Flow

### 1. Token Validation

**Implementation File:** `src/presentation/middleware/auth.ts`

```typescript
export async function createContext({ req }: { req: http.IncomingMessage }): Promise<IContext> {
const issuer = new PrismaClientIssuer();
const loaders: Loaders = createLoaders(issuer);
const idToken = getIdTokenFromRequest(req);
const communityId = (req.headers["x-community-id"] as string) || process.env.COMMUNITY_ID; 

if (!communityId) { 
throw new Error("Missing required header: x-community-id"); 
} 

if (!idToken) { 
return { issuer, loaders, communityId }; 
} 

const configService = container.resolve(CommunityConfigService); 
const tenantId = await configService.getFirebaseTenantId({ issuer } as IContext, communityId); 

try { 
const tenantedAuth = auth.tenantManager().authForTenant(tenantId); 
const decoded = await tenantedAuth.verifyIdToken(idToken); 
const uid = decoded.uid; 

const [currentUser, hasPermissions] = await Promise.all([ 
issuer.internal(async (tx) => tx.user.findFirst({
where: { identities: { some: { uid } } },
include: userAuthInclude,
}),
),
issuer.internal(async (tx) =>
tx.user.findFirst({
where: { identities: { some: { uid } } },
select: userAuthSelect,
}),
),
]);

return {
issuer,
loaders,
uid,
tenantId,
communityId,
currentUser,
hasPermissions,
idToken,
};
} catch {
return { communityId, issuer, loaders };
}
}
```

**Features**
- Firebase JWT token validation
- Multi-tenant support for communities
- Token expiration and renewal handling
- Custom claim validation

### 2. Creating a user context

```typescript
// Database User Search and Context Creation
const createUserContext = async (decodedToken: DecodedIdToken): Promise<IContext> => {
const user = await prisma.user.findUnique({
where: { firebaseUid: decodedToken.uid },
include: {
memberships: {
include: { community: true }
}
}
});

return {
currentUser: user,
uid: decodedToken.uid,
isAdmin: checkAdminPermissions(user),
hasPermissions: calculateUserPermissions(user),
dataloaders: createDataLoaders(prismaClientIssuer),
prisma: prismaClientIssuer
};
};
```

### 3. Permission Assignment

```typescript
// Role-Based Permission Calculation
const calculateUserPermissions = (user: User) => {
const permissions = {
memberships: user.memberships.map(membership => ({
communityId: membership.communityId,
role: membership.role,
status: membership.status
})),
isSystemAdmin: user.isSystemAdmin || false,
canAccessAdmin: checkAdminAccess(user)
};

return permissions;
};
```

## Row-Level Security (RLS)

**Implementation file:** `src/infrastructure/prisma/client.ts`

### PrismaClientIssuer implementation

```typescript
export class PrismaClientIssuer {
// Accessible only to community members
public async onlyBelongingCommunity<T>(ctx: IContext, callback: CallbackFn<T>): Promise<T> {
if (ctx.isAdmin) {
return this.public(ctx, callback);
}

const user = ctx.currentUser;
if (user) {
return await this.client.$transaction(async (tx) => {
await this.setRls(tx);
await this.setRlsConfigUserId(tx, user.id);
return await callback(tx);
});
}
throw new AuthorizationError("Not authenticated");
}

// Apply RLS configuration
private async setRls(tx: Transaction) {
await tx.$executeRawUnsafe(`SET row_security = on;`);
}

// Set user ID to RLS configuration
private async setRlsConfigUserId(tx: Transaction, userId: string | null) {
const [{ value }] = await tx.$queryRawUnsafe<[{ value: string }]>(
`SELECT set_config('app.rls_config.user_id', '${userId ?? ""}', FALSE) as value;`,
);
return value;
}

// Admin bypass
public async admin<T>(ctx: IContext, callback: CallbackFn<T>): Promise<T> {
return await this.client.$transaction(async (tx) => {
await this.setRlsBypass(tx, true);
return await callback(tx);
});
}

// RLS bypass configuration
private async setRlsBypass(tx: Transaction, bypass: boolean) {
await tx.$queryRawUnsafe(
`SELECT set_config('app.rls_bypass', '${bypass}', FALSE);`
);
}
}
```

### RLS Usage Example

```typescript
// Usage Example: Automatic filtering based on user context
const issuer = new PrismaClientIssuer();

// Retrieve only communities accessible to the user
const communities = await issuer.onlyBelongingCommunity(context, (tx) =>
tx.community.findMany()
);

// Access all data as an administrator
const allCommunities = await issuer.admin(context, (tx) =>
tx.community.findMany()
);
```

**Benefits**
- Automatic data filtering based on user context
- Prevention of unauthorized data access
- Simplified authorization logic
- Consistent security across all queries

## GraphQL Authorization Rules

**Implementation File:** `src/presentation/graphql/rule.ts`

### Authorization Rule Implementation

```typescript
import { preExecRule } from '@graphql-authz/core';

// Basic authentication rule
const IsUser = preExecRule({
error: new AuthenticationError("User must be logged in"),
})((context: IContext) => {
if (context.isAdmin) return true;
return !!context.currentUser;
});

// System administrator rule
const IsAdmin = preExecRule({
error: new AuthorizationError("Admin access required"),
})((context: IContext) => {
return context.isAdmin || context.currentUser?.isSystemAdmin;
});

// Community owner rule
const IsCommunityOwner = preExecRule({
error: new AuthorizationError("User must be community owner"),
})((context: IContext, args: { permission?: { communityId?: string } }) => {
if (context.isAdmin) return true; 

const user = context.currentUser; 
const permission = args.permission; 

if (!user || !permission?.communityId) return false; 

const membership = context.hasPermissions?.memberships?.find( 
(m) => m.communityId === permission.communityId, 
); 

return membership?.role === Role.OWNER;
});

// own operating rules
const IsSelf = preExecRule({ 
error: new AuthorizationError("User can only access their own data"),
})((context: IContext, args: { permission?: { userId?: string } }) => { 
if (context.isAdmin) return true; 

const user = context.currentUser; 
const permission = args.permission; 

return user?.id === permission?.userId;
});
```

### Application in GraphQL Schema

```typescript
// Applying Authorization Rules in GraphQL Resolver
export const permissions = shield({
Query: {
communities: IsUser,
adminUsers: IsAdmin,
userProfile: IsSelf,
},
Mutation: {
createCommunity: IsUser,
updateCommunity: IsCommunityOwner,
deleteCommunity: IsCommunityOwner,
promoteUser: IsCommunityOwner,
}
});
```

### Available Authorization Rules

```typescript
export const rules = {
IsUser, // Logged-in User
IsAdmin, // System Administrator
IsSelf, // Self Operations
IsCommunityOwner, // Community Owner
IsCommunityManager, // Community Manager
IsCommunityMember, // Community Member
IsOpportunityOwner, // Opportunity creator
CanReadPhoneNumber, // Permission to read phone numbers
} as const;
```

## API Key Authentication

### Admin Endpoint Protection

```typescript
// API Key Authentication for Administrator Endpoint
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
const apiKey = req.headers['x-api-key'];

if (!apiKey || apiKey !== process.env.CIVICSHIP_ADMIN_API_KEY) {
return res.status(401).json({
error: 'Unauthorized',
message: 'Valid API key required'
});
}

// Example
app.use('/admin', adminAuth);
app.post('/admin/users', adminController.createUser);
```

## Security Best Practices

### Authentication

- **Always validate JWT tokens**
- Strict validation using the Firebase Admin SDK
- Token expiration checks
- Issuer validation

- **Proper handling of token refreshes**
- Automatic token refresh mechanism
- Securely storing refresh tokens
- Token expiration monitoring

- **Multi-tenant authentication**
- Tenant-specific token validation
- Data isolation between tenants
- Tenant configuration validation

### Authorization

- **Role-based access control (RBAC)**
- Clear role definitions (OWNER, MANAGER, MEMBER)
- Principle of least privilege
- Privilege inheritance and delegation

- **Use GraphQL shield for declarative rules**
- Pre-execution and post-execution permission checks
- Combinable authorization rules
- Caching for improved performance

- **Applying Row-Level Security**
- Automatic Filtering at the Database Level
- Access Control Based on User Context
- Admin Bypass Feature

### Data Protection

- **Don't Log Sensitive Data**
- Exclude Passwords, Tokens, and API Keys
- Protect Personally Identifiable Information (PII)
- Filter Sensitive Data in Structured Logs

- **Sanitizing User Input**
- GraphQL Input Validation
- Preventing SQL Injection
- XSS Attack Prevention

- **Using Parameterized Queries**
- Automatic Parameterization with Prisma ORM
- Restricting Raw SQL Queries
- Properly Escaping Input Values

### API Security

- **Validating All Input**
- GraphQL Schema-Level Type Checking
- Validating Business Rules
- Input Size Limits

- **Properly Implementing CORS**
- Explicitly Setting Allowed Origins
- Handling Preflight Requests
- Controlling Requests Containing Credentials

- **Using HTTPS in Production**
- Encrypting All Communications
- Enabling HSTS (HTTP Strict Transport Security)
- Using Secure Cookies

- Implementing Rate Limiting
- Limiting API Call Frequency
- Preventing DDoS Attacks
- User and Endpoint Limits

### Monitoring and Alerting

- **Monitoring Suspicious Activity**
- Tracking Failed Authentication Attempts
- Detecting Anomalous API Access Patterns
- Monitoring Privilege Escalation Attempts

- **Security Log Recording**
- Logging Authentication and Authorization Events
- Auditing Administrator Actions
- Recording Security Violations

## Related Documentation

- [Architecture Guide](./ARCHITECTURE.md) - System Design Overview
- [Infrastructure Guide](./INFRASTRUCTURE.md) - External System Integration
- [Implementation Patterns](./PATTERNS.md) - Security Pattern Implementation Examples
- [Environment Variable Guide](./ENVIRONMENT.md) - Security-Related Environment Settings
- [Troubleshooting](TROUBLESHOOTING.md) - Solving authentication and authorization issues
