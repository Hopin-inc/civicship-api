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
| CRITICAL | `1`       | **blocking** (PR / deploy 双方で fail)。件数を `::error::` annotation で surface + Security タブに sarif upload |
| HIGH     | `0`       | **advisory** (deploy も PR も block しない)。件数を `::warning::` で surface + Security タブに sarif upload |
| その他   | -         | scan 対象外 (MEDIUM 以下は雑音になりやすい)                       |

**CRITICAL を blocking にしている理由**: 緩い severity policy は
「気付かないまま CVE を本番投入する」リスクを直接的に高める。CRITICAL は通常
upstream で迅速に fix されるか、`ignore-unfixed: true` で除外されるため、
blocking 化のコストは限定的。一時的な false-positive や緊急 fix 待ちの
CRITICAL に対しては `.trivyignore` に時限 entry (`expires:` 必須) を追加して
回避する。

**HIGH を advisory のままにしている理由**: HIGH は CRITICAL に比べて drift
量が大きく (Trivy DB の日次更新で件数が頻繁に変動)、blocking にすると
無関係な fix まで含めた deploy が stall しやすい。Security タブと
`::warning::` annotation で可視化のみ行い、ゲートは CRITICAL に絞る。

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
   を再利用して runtime image を rebuild → scan。CRITICAL 件数 > 0 で
   `::error::` annotation を出して job を fail させ、aggregator (`ci`) も
   `failure` で落とす。CI 全体の必須 check として branch protection で要求
   する。
2. **Deploy CI**: registry に push した image を再 scan。Trivy DB が PR 時点
   から更新されて新規 CVE が増えていてもここで surface され、CRITICAL 件数
   > 0 ならその時点で deploy を中断する (Cloud Run revision は作られない)。
   HIGH は `::warning::` で警告のみ。
3. **Security tab**: 両 workflow が sarif を Code Scanning に upload。
   `if: always()` で CRITICAL fail 後でも upload するので、blocking で落ちた
   CVE も Security タブで追跡できる。category 別に alert を追える。

#### CRITICAL がヒットしたときの対処フロー (blocking mode)

deploy / PR が落ちている前提で、優先度順に:

1. PR / deploy run の `::error::` annotation または step log で CVE-ID + 該当
   パッケージを確認。Security タブの該当 category でも同じ情報が見える。
2. 次のいずれかを実施:
   - **Fix 可能**: base image / dependency を bump する PR を別途出す
     (Dependabot が自動で開いている場合あり)。fix が merge されれば次の
     CI / deploy run で green に戻る。
   - **Fix 不可 / 不到達 (false-positive 含む)**: `.trivyignore` に時限
     entry を追加 (下記運用ルール参照)。`expires:` 必須。期限切れ後は
     月次棚卸しで再評価。
3. **緊急 deploy で blocking を bypass したいケース** (例: CRITICAL を
   抱えるが顧客障害で先に別の hotfix を出したい): `.trivyignore` に
   短期 expiry (例: 翌週) で entry を追加 → 該当 CVE をその場で除外して
   pipeline を通す → 翌週の棚卸しで根本対応する。`exit-code` の workflow
   直接書き換えは行わない (政策が無言で advisory に戻る事故を防ぐ)。

#### Rollback conditions (advisory に戻す条件)

blocking に昇格したあとは原則戻さないが、以下のような状況では advisory に
一時降格する判断もありうる:

- 4 週間以上にわたり CRITICAL の上流 fix が出ず、`.trivyignore` で扱いきれない
  (大量の transient false-positive など)。
- Trivy DB / Code Scanning 連携で繰り返し infrastructure failure が出て、
  blocking が事実上の deploy 不能状態を引き起こしている。

降格手順 (元に戻すときの参照点):
- `_deploy-cloud-run.yml` / `_deploy-external-api.yml` の
  `Scan image (Trivy CRITICAL — blocking)` step を `exit-code: '0'` に変更し
  step 名を "advisory" に戻す。
- `ci.yml:trivy` の `Surface CRITICAL count + top hits` step を `::warning::`
  + 末尾の `exit 1` 削除に戻す。
- aggregator (`ci`) の判定ループから `trivy` を外して advisory 扱いにする。
- 本表 (Severity Policy) の CRITICAL 行を `0` / "advisory" に戻し、本セクション
  と上記 blocking フローを advisory フローに置き換える。

### `.trivyignore`

リポジトリ root の [.trivyignore](../../.trivyignore) で、誤検知や対応保留の
CVE を一時的に除外できる。**追加時は必ず以下を併記**:

1. 1 行 1 CVE (`CVE-YYYY-NNNNN`)。`#` から行末はコメント。
2. 直前のコメントで影響範囲・ignore 理由・再評価期限 (`expires: YYYY-MM-DD`)
   を明示する。
3. 月次で棚卸しし、期限切れまたは不要になったエントリは削除する。

### Local 検証

PR を出す前に手元で同じ scan を回したい場合 (CI と同じ severity policy で
回す。CRITICAL は `--exit-code 1` で本番同様に fail させる):

```bash
# CRITICAL — CI と同じ blocking 挙動 (見つかれば exit 1)
trivy image --severity CRITICAL --exit-code 1 --ignore-unfixed \
  asia-northeast1-docker.pkg.dev/<project>/<repo>/<image>:latest

# HIGH — advisory なので exit-code 0 で一覧確認
trivy image --severity HIGH --exit-code 0 --ignore-unfixed \
  asia-northeast1-docker.pkg.dev/<project>/<repo>/<image>:latest
```

### CVE 検出時の対処

PR / deploy run で `::error::` (CRITICAL) または `::warning::` (HIGH) が
出た、または Security タブに新規 alert が追加されたら、以下の優先順で
対応する。CRITICAL は deploy が止まっているので即対応が必要:

1. **Base image / dependency の bump** で fix 済み version に上げる (推奨)。
   Dependabot が自動で PR を開いている場合はそれを優先 merge。
2. **multi-stage build (`Dockerfile`) で当該パッケージを最終ステージから外す**。
3. 上記が現実的でない場合のみ、`.trivyignore` に時限 entry (`expires:` 必須)
   を追加して暫定回避し、別 issue で恒久対応をトラックする。CRITICAL の
   時限 ignore は最長 2 週間目安。

### Image attestation (SBOM + provenance)

deploy workflow の `docker buildx build` は `--sbom=true` と
`--provenance=mode=max` を付けており、push される image manifest には以下が
attestation として attach される:

- **SPDX SBOM**: `apt` / `pnpm` 経由で含まれる全パッケージの inventory。
- **SLSA build provenance**: ビルド source (commit SHA / workflow run / triggered actor)
  の機械可読な記録。

検証は次のいずれかで行える:

```bash
# SBOM を取得
docker buildx imagetools inspect <image>:sha-<sha> --format '{{ json .SBOM }}'

# Provenance を取得
docker buildx imagetools inspect <image>:sha-<sha> --format '{{ json .Provenance }}'

# Artifact Registry の vulnerability scanning と組み合わせる
gcloud artifacts docker images describe <image>:sha-<sha> \
  --show-package-vulnerability
```

Cosign keyless 署名は将来的に検討するが、現状は GitHub Actions OIDC で
build provenance を保持する形で十分とする (cosign 署名追加時は
`sigstore/cosign-installer` + `cosign sign --yes` を deploy workflow に追加)。

## npm Supply Chain Hardening (`pnpm.minimumReleaseAge`)

`package.json` の `pnpm.minimumReleaseAge: 4320` (= **3 日**, 分単位) で、
publish 後 3 日経過していない npm package version は install 対象から
除外する。これは pnpm 10.16+ の supply chain hardening 機能。

### 何を防ぐか / 防げないか

| 脅威 | 防御 |
|---|---|
| 既知 CVE (古い lib) | Trivy / Dependabot / `pnpm.overrides` で対処 |
| postinstall 型 malware | pnpm 10 default-deny + `onlyBuiltDependencies` allowlist (現状未定義 = 全 lifecycle script 無効) |
| **publish 直後の runtime 混入型 malware** | **`minimumReleaseAge`** で attack window を短縮 |

`pnpm audit` / Trivy は **既知 CVE** の検知が前提で、`chalk` / `debug` の hijack
(2025-09) のように publish 直後で発見前の malware が混入したケースは原理的に
検知できない。npm の supply chain 攻撃の大半は publish 後 24〜72h 以内に検知 →
unpublish されるので、3 日待つだけで window の大半を回避できる
(cf. ua-parser-js, event-stream, eslint-scope, chalk/debug の各事案)。

### 緊急バイパス: `minimumReleaseAgeExclude`

緊急 CVE で fresh patch を 3 日待たず即時取り込みたい場合は、
`package.json` の `pnpm` block に `minimumReleaseAgeExclude` を追加して
特定 package のみ release age 制限を bypass できる:

```json
"pnpm": {
  "minimumReleaseAge": 4320,
  "minimumReleaseAgeExclude": [
    "axios"
  ],
  "overrides": { ... }
}
```

運用ルール:

1. bypass entry を追加するときは、PR description / commit message に以下を併記する:
   - 対象 CVE / GHSA ID
   - なぜ 3 日待てないか (active exploitation / 重大 impact 等)
   - 該当 fix を取り込む PR / 期限の見込み
2. fix を取り込んで lockfile が更新できたら、bypass entry は **すぐ削除する**。
   恒久的な exclude は supply chain hardening を骨抜きにするので避ける。
3. 月次棚卸しで残存 entry を確認 (`.trivyignore` の expires policy と同じ運用)。

### 既知の副作用

- Dependabot / 手動 bump PR で **publish 直後の version** が指定されると、
  install が解決失敗相当になることがある。3 日後に自然解消するため
  運用負荷は小さいが、急ぎの場合は上記 `minimumReleaseAgeExclude` で
  対象 package を bypass する。
- 内部 (registry private) package は通常 publish 直後でも信頼できるため、
  必要なら同じく `minimumReleaseAgeExclude` に追加して対象外化する。

## Related Documentation

- [Architecture Guide](./ARCHITECTURE.md) - System Design Overview
- [Infrastructure Guide](./INFRASTRUCTURE.md) - External System Integration
- [Implementation Patterns](./PATTERNS.md) - Security Pattern Implementation Examples
- [Environment Variable Guide](./ENVIRONMENT.md) - Security-Related Environment Settings
- [Troubleshooting](TROUBLESHOOTING.md) - Solving authentication and authorization issues
