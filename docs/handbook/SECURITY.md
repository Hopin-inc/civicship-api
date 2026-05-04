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

## Container Image Scanning (Trivy)

Cloud Run にデプロイされる image は、`docker push` 直後 / `gcloud run deploy` 前に
[Trivy](https://github.com/aquasecurity/trivy-action) で vulnerability scan を行う。
対象 workflow は以下:

- `.github/workflows/_deploy-cloud-run.yml` (internal API + batch)
- `.github/workflows/_deploy-external-api.yml` (external API)

### Severity Policy

| Severity | exit-code | 振る舞い                                                          |
| -------- | --------- | ----------------------------------------------------------------- |
| CRITICAL | `0`       | **advisory** (deploy も PR も block しない)。件数を `::warning::` で surface + Security タブに sarif upload |
| HIGH     | `0`       | advisory。同上                                                    |
| その他   | -         | scan 対象外 (MEDIUM 以下は雑音になりやすい)                       |

**なぜ advisory に下げているか**: Trivy DB は日次で更新されるため、昨日まで
clean だった image が今日 CRITICAL を抱える、というドリフトが日常的に起きる。
上流 fix を待つしかない CVE のために自動で deploy を止めると、無関係な fix も
含めた全 deploy が stall するため、現状は「人間が必ず気付く可視化」を備えた
上で advisory にしている。再 blocking の条件は下記参照。

両 severity の結果は SARIF として GitHub の **Security → Code scanning alerts**
タブに upload される (`github/codeql-action/upload-sarif`)。`category` を
`trivy-critical` / `trivy-high` (external API は `trivy-external-*`) で
分けることで、severity 別に alert を追える。

`ignore-unfixed: true` を付けているため、upstream で fix が未公開の CVE は
対象外となる。

#### 3-layer visibility (PR + deploy + Security tab)

同じ Trivy scan を **PR の CI** (`ci.yml:trivy` job) と **deploy workflow**
(`_deploy-{cloud-run,external-api}.yml`) の両方で走らせ、結果は 3 経路で surface
する:

1. **PR CI** (`ci.yml:trivy`): build job が `--cache-to` で書いた layer cache
   を再利用して runtime image を rebuild → scan。CRITICAL 件数を
   `::warning::` annotation で PR checks 概要に出す。`build` から分離した独立
   ジョブなので CI 全体の必須 check (`ci` aggregator) では advisory 扱い
   (never gate) とし、Trivy DB の transient エラーで PR が永久 red にならない
   ようにしてある。
2. **Deploy CI**: registry に push した image を再 scan。Trivy DB が PR 時点
   から更新されて新規 CVE が増えていてもここで surface される。同様に
   `::warning::` を出すが、deploy は止めない。
3. **Security tab**: 両 workflow が sarif を Code Scanning に upload。category
   別に alert を追える。

#### CRITICAL の対処フロー (advisory mode)

1. PR / deploy run の `::warning::` annotation または step log で CVE-ID + 該当
   パッケージを確認。Security タブの該当 category でも同じ情報が見える。
2. 次のいずれかを実施:
   - **Fix 可能**: base image / dependency を bump する PR を別途出す
     (Dependabot が自動で開いてる場合あり)。
   - **Fix 不可 / 不到達**: `.trivyignore` に追記 (下記運用ルール)。
3. **重要**: advisory mode のため対処しなくても deploy は止まらない。だから
   こそ「気付いて対処する」運用を週次 review で担保する必要がある (下記
   "Re-escalation conditions" 参照)。

#### Re-escalation conditions (再 blocking 化の条件)

advisory はあくまで暫定運用で、以下を **全て** 満たしたら CRITICAL を blocking
(`exit-code: '1'`) に戻す:

1. 4 週間以上、両 image で CRITICAL 件数 0 を維持できている (PR / deploy 両
   workflow の `::warning::` 履歴で確認)。
2. `.trivyignore` に **期限切れ entry が無い** (月次棚卸しを完了している)。
3. 週次の Trivy review 体制 (担当者 + 議事録 / 議題) が確立している。

戻すときは:
- `_deploy-cloud-run.yml` / `_deploy-external-api.yml` の
  `Scan image (Trivy CRITICAL — advisory)` を `exit-code: '1'` に変更し step 名
  を "blocking" に戻す。
- `ci.yml:trivy` を必須 (`needs: [..., trivy]` の case 文で `failure)` を error
  扱いに) する。
- 本表 (Severity Policy) の CRITICAL 行を `1` / "block" に戻し、上記 advisory
  のセクションを削除。

### `.trivyignore`

リポジトリ root の [.trivyignore](../../.trivyignore) で、誤検知や対応保留の
CVE を一時的に除外できる。**追加時は必ず以下を併記**:

1. 1 行 1 CVE (`CVE-YYYY-NNNNN`)。`#` から行末はコメント。
2. 直前のコメントで影響範囲・ignore 理由・再評価期限 (`expires: YYYY-MM-DD`)
   を明示する。
3. 月次で棚卸しし、期限切れまたは不要になったエントリは削除する。

### Local 検証

PR を出す前に手元で同じ scan を回したい場合 (advisory mode と同じ
`exit-code 0`):

```bash
# CRITICAL の一覧を確認
trivy image --severity CRITICAL --exit-code 0 --ignore-unfixed \
  asia-northeast1-docker.pkg.dev/<project>/<repo>/<image>:latest

# HIGH の一覧を確認
trivy image --severity HIGH --exit-code 0 --ignore-unfixed \
  asia-northeast1-docker.pkg.dev/<project>/<repo>/<image>:latest
```

### CVE 検出時の対処

PR / deploy run で `::warning::` が出た、または Security タブに新規 alert が
追加されたら、以下の優先順で対応する (advisory なので緊急停止はしないが、
**気付いた時点で対処する**):

1. **Base image / dependency の bump** で fix 済み version に上げる (推奨)。
   Dependabot が自動で PR を開いている場合はそれを優先 merge。
2. **multi-stage build (`Dockerfile`) で当該パッケージを最終ステージから外す**。
3. 上記が現実的でない場合のみ、`.trivyignore` に追記して暫定回避し、
   別 issue で恒久対応をトラックする。

## Related Documentation

- [Architecture Guide](./ARCHITECTURE.md) - System Design Overview
- [Infrastructure Guide](./INFRASTRUCTURE.md) - External System Integration
- [Implementation Patterns](./PATTERNS.md) - Security Pattern Implementation Examples
- [Environment Variable Guide](./ENVIRONMENT.md) - Security-Related Environment Settings
- [Troubleshooting](TROUBLESHOOTING.md) - Solving authentication and authorization issues
