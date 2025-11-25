# Infrastructure Guide

This document describes civicship-api's external system integration, database configuration, and infrastructure components.

## Infrastructure Layer (`src/infrastructure/`)

**Purpose:** Integration with external systems, data persistence, and technical concerns

```
infrastructure/
├── prisma/ # Database ORM
│ ├── schema.prisma # Database schema definition
│ ├── migrations/ # Database migrations
│ ├── seeds/ # Development and test data
│ └── factories/ # Test data factory
└── libs/ # External service integration
├── firebase.ts # Firebase Admin SDK
├── storage.ts # Google Cloud Storage
├── line.ts # LINE Messaging API
└── did.ts # IDENTUS DID/VC integration
```

## Database configuration

### Prisma ORM configuration

**Configuration files:** `src/infrastructure/prisma/schema.prisma`

```prisma
generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}
```

**Key Features:**
- Integration with PostgreSQL 16.4
- Type-safe database access
- Automatic migration management
- Row-Level Security (RLS) support

### Database connection

**Development environment:**
```bash
# Launch PostgreSQL 16.4 via Docker Compose
DATABASE_URL=postgresql://civicship:civicship@localhost:15432/civicship
```

**Production environment:**
- Google Cloud SQL PostgreSQL
- SSL/TLS encrypted connections
- Connection pooling
- Automatic backups

## External system integration

### Firebase Authentication

**Implementation File:** `src/infrastructure/libs/firebase.ts`

```Typescript
import admin from "firebase-admin";
import { App } from "firebase-admin/lib/app";

let app: App | undefined = undefined;
if (!admin.apps.length) {
app = admin.initializeApp({
credential: admin.credential.cert({
projectId: process.env.FIREBASE_PROJECT_ID,
clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}),
});
}

export const auth = admin.auth(app);
```

**Features:**
- JWT token validation
- Multi-Tenant Authentication
- Custom Claims Management
- User Management API

### Google Cloud Storage

**Implementation file:** `src/infrastructure/libs/storage.ts`

```typescript
import { Storage } from "@google-cloud/storage";
import logger from "@/infrastructure/logging";

const base64Encoded = process.env.GCS_SERVICE_ACCOUNT_BASE64;
const credentials = base64Encoded
? JSON.parse(Buffer.from(base64Encoded, "base64").toString("utf-8"))
: undefined;

export const gcsBucketName = process.env.GCS_BUCKET_NAME!;
export const storage = new Storage({
projectId: process.env.GCP_PROJECT_ID,
credentials,
});

export async function generateSignedUrl(
fileName: string,
folderPath?: string,
bucketName?: string,
): Promise<string> {
try {
bucketName = bucketName ?? gcsBucketName;
const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
const options = {
version: "v4" as const,
action: "read" as const,
expires: Date.now() + 15 * 60 * 1000, // Valid for 15 minutes
};

const [url] = await storage.bucket(bucketName).file(filePath).getSignedUrl(options);
return url;
} catch (e) {
logger.warn(e);
return "";
}
}
```

**Features**
- Image and file upload
- Public URL generation
- Metadata management
- Access control

### LINE Messaging API

**Implementation file:** `src/infrastructure/libs/line.ts`

```typescript
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { container } from "tsyringe";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import { messagingApi } from "@line/bot-sdk";
import logger from "@/infrastructure/logging";

export async function createLineClient( 
communityId: string,
): Promise<messagingApi.MessagingApiClient> { 
const issuer = new PrismaClientIssuer(); 
const ctx = { issuer } as IContext; 

const configService = container.resolve(CommunityConfigService); 
const { accessToken } = await configService.getLineMessagingConfig(ctx, communityId); 

logger.info("LINE client created", { 
communityId, 
tokenPreview: accessToken.slice(0, 10), 
}); 

return new messagingApi.MessagingApiClient({ channelAccessToken: accessToken });
}
````

**Features**
- Sending push messages
- Rich menu management
- LIFF (LINE Front-end Framework) integration
- Getting user profiles

### IDENTUS DID/VC integration

**Implementation file:** `src/infrastructure/libs/did.ts`

```typescript
import axios from "axios";
import { injectable } from "tsyringe";
import { IDENTUS_API_URL } from "@/consts/utils";
import logger from "@/infrastructure/logging";

@injectable()
export class DIDVCServerClient {
async call<T>(
uid: string,
token: string,
endpoint: string,
method: "GET" | "POST" | "PUT" | "DELETE",
data?: Record<string, unknown>,
): Promise<T> {
const url = `${IDENTUS_API_URL}${endpoint}`; 
const headers = { 
"x-api-key": process.env.API_KEY, 
Authorization: `Bearer ${token}`, 
"Content-Type": "application/json", 
}; 

logger.debug(`[DIDVClient] ${method} ${url} for uid=${uid}`); 

try { 
let response; 
switch (method) { 
case "GET": 
response = await axios.get(url, { headers }); 
break; 
case "POST": 
response = await axios.post(url, data, { headers }); 
break; 
case "PUT": 
response = await axios.put(url, data, { headers }); 
break; 
case "DELETE": 
response = await axios.delete(url, { headers });
break;
}

return response?.data as T;
} catch (error) {
logger.error(`Error calling DID/VC server at ${endpoint}:`, error);
throw error;
}
}
}
}
```

**Features**
- Decentralized Identity (DID) Creation
- Verifiable Credential (VC) Issuance
- Blockchain Integration
- Digital Identity Management

## Environment Variable Settings

For detailed environment variable settings, see the [Environment Variable Guide](./ENVIRONMENT.md).

### Required Infrastructure Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:15432/civicship

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Cloud Storage
GCP_PROJECT_ID=your-gcp-project
GCS_BUCKET_NAME=your-bucket-name
GCS_SERVICE_ACCOUNT_BASE64=base64-encoded-service-account

# LINE API (default values ​​for development and testing)
LINE_MESSAGING_CHANNEL_ACCESS_TOKEN=your-default-channel-access-token
LINE_MESSAGING_CHANNEL_SECRET=your-default-channel-secret
LIFF_ID=your-default-liff-id

# IDENTUS
IDENTUS_API_URL=https://your-identus-instance.com
IDENTUS_API_SALT=your-api-salt
```

## Database Migration

### Migration Management

```bash
# Create a new migration
pnpm db:migrate

# Apply migration
pnpm db:migrate deploy

# Check migration status
pnpm db:migrate status
```

### Seed Data

```bash
# Import master data (city and state data)
pnpm db:seed-master

# Domain data input (user/community)
pnpm db:seed-domain
```

## Monitoring and Logging

### Application Logging

``` typescript
import logger from "@/infrastructure/logging";

// Structured Logging
logger.info('Database connection established', {
host: 'localhost',
port: 15432,
database: 'civicship'
});

logger.error('External API call failed', {
service: 'firebase',
error: error.message,
userId: context.currentUser?.id
});
```

### Performance Monitoring

- Database Query Execution Time
- External API Response Time
- Memory Usage
- Error Rates and Alerts

## Troubleshooting

See the [Troubleshooting Guide](../TROUBLESHOOTING.md) for solutions to common infrastructure issues.

### Database connection issues

``` bash
# Check PostgreSQL container status
docker ps | grep postgres

# Database connection test
pnpm db:studio
```

### Firebase authentication issues

``` bash
# Check Firebase settings
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_CLIENT_EMAIL

# Check private key format (line breaks included correctly)
echo $FIREBASE_PRIVATE_KEY | grep "BEGIN PRIVATE KEY"
```

## Related documentation

- [Architecture Guide](./ARCHITECTURE.md) - System design overview
- [Security Guide](../SECURITY.md) - Authentication and authorization architecture
- [Deployment Guide](./DEPLOYMENT.md) - Production environment configuration
- [Environment Variable Guide](./ENVIRONMENT.md) - Detailed environment settings
- [Setup Guide](../SETUP.md) - Building a development environment