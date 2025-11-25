# civicship-api
![logo.svg](./docs/asset/logo.svg)

## Overview

`civicship-api` is a GraphQL API server built with TypeScript following **Domain-Driven Design (DDD)** and **Clean Architecture** principles. It provides a comprehensive platform for community engagement with integrated point-based rewards, opportunity management, and LINE messaging integration.

**Key Features:**
- 👤 User & Community Management
- 🎯 Opportunity & Participation Tracking  
- 🎫 Point-based Reward System
- 📱 LINE Integration & Notifications
- 📝 Content & Media Management

For detailed features, see [FEATURES.md](./docs/handbook/FEATURES.md).

## Quick Start

### Prerequisites
- Node.js 20+, pnpm, Docker

### Setup Commands
```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL container (port 15432)
pnpm container:up

# 3. Initialize database
pnpm db:generate
pnpm db:seed-master
pnpm db:seed-domain

# 4. Generate GraphQL types & start server
pnpm gql:generate
pnpm dev:https
```

🚀 **API Available at:** GraphQL endpoint on port 3000

### Environment Setup

Create a `.env` file with required environment variables:

```env
# Core Configuration
DATABASE_URL=postgresql://user:password@host:15432/civicship_dev
ENV=LOCAL
NODE_ENV=development
PORT=3000

# Firebase Authentication (required)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Google Cloud Storage (required)
GCS_SERVICE_ACCOUNT_BASE64=base64_encoded_service_account_json
GCS_BUCKET_NAME=your_bucket_name
GCP_PROJECT_ID=your_gcp_project_id
```

## Architecture Overview

This project follows **Domain-Driven Design (DDD)** and **Clean Architecture** principles.

### High-Level Structure
```
src/
├── application/domain/     # 🏗️ Business Logic (7 core domains)
├── infrastructure/        # 🔌 Database & External Services  
├── presentation/         # 🌐 GraphQL API & Middleware
└── types/               # 📝 Shared Types
```

### Core Business Domains
- **account/** - User, Community, Membership, Wallet Management
- **experience/** - Opportunities, Reservations, Participation Tracking  
- **content/** - Articles, Media Management
- **reward/** - Utilities, Tickets, Point-based Rewards
- **transaction/** - Point Transfers, Financial Operations
- **notification/** - LINE Messaging Integration
- **location/** - Geographic Data Management

## 📖 Documentation

### 🚀 Getting Started
- 🔧 [Setup Guide](./docs/handbook/SETUP.md) - Complete installation & configuration
- 🌍 [Environment Variables](./docs/handbook/ENVIRONMENT.md) - Configuration reference
- 🔍 [Troubleshooting](./docs/handbook/TROUBLESHOOTING.md) - Common issues & solutions

### 🏗️ Architecture & Development  
- 🏗️ [Architecture Guide](./docs/handbook/ARCHITECTURE.md) - System design overview
- 🔒 [Security Architecture](./docs/handbook/SECURITY.md) - Authentication & authorization
- 🔌 [Infrastructure Guide](./docs/handbook/INFRASTRUCTURE.md) - External systems & database
- ⚡ [Performance Guide](./docs/handbook/PERFORMANCE.md) - Optimization strategies
- 🎯 [Implementation Patterns](./docs/handbook/PATTERNS.md) - Code patterns & best practices
- 👨‍💻 [Development Workflow](./docs/handbook/DEVELOPMENT.md) - Daily development procedures

### 📊 Reference & Operations
- ✨ [Features](./docs/handbook/FEATURES.md) - Complete feature overview
- 🗄️ [Database Schema](./docs/handbook/ERD.md) - Entity relationship diagram
- 🧪 [Testing](./docs/handbook/TESTING.md) - Test strategy & execution
- 🚀 [Deployment](./docs/handbook/DEPLOYMENT.md) - Production deployment guide
- 💻 [Commands Reference](./docs/handbook/COMMANDS.md) - All available commands

## 🎯 Quick Navigation by Role

### For New Developers
1. [Setup Guide](./docs/handbook/SETUP.md) → [Environment Variables](./docs/handbook/ENVIRONMENT.md)
2. [Architecture Guide](./docs/handbook/ARCHITECTURE.md) → [Development Workflow](./docs/handbook/DEVELOPMENT.md)
3. [Implementation Patterns](./docs/handbook/PATTERNS.md) → [Testing](./docs/handbook/TESTING.md)

### For System Administrators  
1. [Infrastructure Guide](./docs/handbook/INFRASTRUCTURE.md) → [Security Architecture](./docs/handbook/SECURITY.md)
2. [Deployment Guide](./docs/handbook/DEPLOYMENT.md) → [Performance Guide](./docs/handbook/PERFORMANCE.md)
3. [Environment Variables](./docs/handbook/ENVIRONMENT.md) → [Troubleshooting](./docs/handbook/TROUBLESHOOTING.md)

### For API Users
1. [Features](./docs/handbook/FEATURES.md) → [Database Schema](./docs/handbook/ERD.md)
2. [Commands Reference](./docs/handbook/COMMANDS.md) → [Testing](./docs/handbook/TESTING.md)

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).
See [GNU GPL v3.0](https://www.gnu.org/licenses/gpl-3.0.html) for more details.
