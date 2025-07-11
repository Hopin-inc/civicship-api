# 環境変数設定ガイド

## 必須環境変数

このガイドでは、civicship-api を実行するために必要なすべての環境変数について説明します。設定を簡単にするため、変数はカテゴリ別に整理されています。

### コアデータベース・認証

```env
# データベース接続（PostgreSQL 16.4、ポート 15432）
DATABASE_URL=postgresql://username:password@database_host:15432/civicship_dev

# 管理者 API 認証
CIVICSHIP_ADMIN_API_KEY=your_admin_api_key_here

# 環境設定
ENV=LOCAL                    # 環境識別子（LOCAL/DEV/PROD）
NODE_ENV=development        # Node.js 環境
PORT=3000                   # サーバーポート
NODE_HTTPS=true            # 開発時の HTTPS 有効化
```

### Firebase 認証

```env
# Firebase プロジェクト設定
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----"
FIREBASE_TOKEN_API_KEY=your_firebase_web_api_key
FIREBASE_ISSUER=https://securetoken.google.com/your_project_id
FIREBASE_AUDIENCE=your_project_id
```

### Google Cloud Storage

```env
# ファイルアップロード用 GCS 設定
GCS_SERVICE_ACCOUNT_BASE64=base64_encoded_service_account_json
GCS_BUCKET_NAME=your_storage_bucket_name
GCP_PROJECT_ID=your_gcp_project_id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### セキュリティ・CORS

```env
# クロスオリジンリソース共有
ALLOWED_ORIGINS=http://your-domain:3000,https://your-domain:3000

# セッション管理
EXPRESS_SESSION_SECRET=your_session_secret_key
```

### リッチメニュー設定

```env
# LINE リッチメニュー ID（管理画面で設定）
RICH_MENU_ID_ADMIN_MANAGE=rich_menu_id_for_admin_management
RICH_MENU_ID_ADMIN_USER=rich_menu_id_for_admin_users  
RICH_MENU_ID_PUBLIC=rich_menu_id_for_public_users
```

### 追加設定

```env
# リクエスト設定
HTTP_TIMEOUT=30000          # HTTP リクエストタイムアウト（ミリ秒）
AUTH_MODE=firebase          # 認証モード

# プロセス管理
PROCESS_TYPE=web           # プロセスタイプ識別子
BATCH_PROCESS_NAME=your_batch_name  # バッチ処理識別子

# Redis 設定（該当する場合）
REDIS_HOST=redis_host
REDIS_PORT=6379

# 追加 API
API_KEY=your_general_api_key
KYOSO_ISSUER_API_KEY=your_kyoso_api_key
IDENTUS_API_SALT=your_api_salt
IDENTUS_CLOUD_AGENT_URL=https://your-cloud-agent.example.com
IDENTUS_API_URL=https://your-identus-api.example.com
```

## Environment File Setup

### Development Environment

1. **Copy the template:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in all required values** using the variables listed above

3. **Important Notes:**
   - Ensure Firebase private key has proper line breaks (`\n`)
   - Use port 15432 for PostgreSQL (not the default 5432)
   - Set `NODE_HTTPS=true` for development HTTPS server

### Test Environment  

1. **Create test file:**
   ```bash
   cp .env.test .env.test.local
   ```

2. **Configure test-specific values:**
   - Use separate Firebase project for testing
   - Use test database URL
   - Configure test-specific API keys

### Production Environment

1. **Use environment-specific values:**
   - Production Firebase project
   - Production database connection
   - Production GCS bucket
   - Production API endpoints

2. **Security considerations:**
   - Use strong, unique secrets for each environment
   - Rotate API keys and secrets regularly
   - Ensure minimal required permissions for service accounts

## Environment Variable Categories Explained

### Database Variables
- `DATABASE_URL`: PostgreSQL connection string with credentials and database name
- Used by Prisma ORM for all database operations

### Firebase Variables
- `FIREBASE_PROJECT_ID`: Your Firebase project identifier
- `FIREBASE_CLIENT_EMAIL`: Service account email for server-side authentication
- `FIREBASE_PRIVATE_KEY`: Service account private key (must include `\n` line breaks)
- `FIREBASE_TOKEN_API_KEY`: Web API key for token validation
- `FIREBASE_ISSUER`/`FIREBASE_AUDIENCE`: JWT token validation parameters

### Google Cloud Storage Variables
- `GCS_SERVICE_ACCOUNT_BASE64`: Base64-encoded service account JSON
- `GCS_BUCKET_NAME`: Storage bucket for file uploads
- `GCP_PROJECT_ID`: Google Cloud project identifier
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account JSON file

### LINE Integration Variables
- Rich menu IDs are stored in the database and configured via admin interface
- LINE channel credentials (LIFF, messaging) are also database-stored
- Only rich menu IDs need to be set as environment variables

### Security Variables
- `CIVICSHIP_ADMIN_API_KEY`: Protects admin endpoints
- `ALLOWED_ORIGINS`: CORS configuration for web clients
- `EXPRESS_SESSION_SECRET`: Session encryption key

## Security Best Practices

### Secret Management
- **Never commit `.env` files** to version control
- Use different values for each environment (dev/staging/prod)
- Store production secrets in secure secret management systems
- Rotate API keys and secrets regularly

### Firebase Security
- Use service accounts with minimal required permissions
- Enable Firebase Authentication security rules
- Configure proper CORS origins for web clients
- Monitor Firebase usage and authentication logs

### Database Security
- Use strong database passwords
- Restrict database access to necessary IP ranges
- Enable SSL/TLS for database connections
- Regular database backups and security updates

### API Security
- Protect admin endpoints with strong API keys
- Implement rate limiting for public endpoints
- Monitor API usage and authentication attempts
- Use HTTPS for all external communications

## Troubleshooting Environment Issues

### Common Problems

**Database Connection Issues:**
- Verify DATABASE_URL format and credentials
- Check if PostgreSQL container is running on port 15432
- Ensure database exists and is accessible

**Firebase Authentication Errors:**
- Verify all Firebase environment variables are set
- Check that FIREBASE_PRIVATE_KEY has proper line breaks (`\n`)
- Ensure Firebase project has Authentication enabled
- Verify service account permissions

**GCS Upload Failures:**
- Check GCS_SERVICE_ACCOUNT_BASE64 is properly encoded
- Verify GCS bucket exists and is accessible
- Ensure service account has Storage Object Admin permissions
- Check GCP_PROJECT_ID matches your Google Cloud project

**CORS Issues:**
- Verify ALLOWED_ORIGINS includes your client domains
- Check protocol (http vs https) matches your setup
- Ensure no trailing slashes in origin URLs

### Validation Commands

```bash
# Test database connection
pnpm db:studio

# Verify Firebase configuration
# Check server logs for Firebase initialization messages

# Test GCS connectivity
# Upload test file through GraphQL mutation

# Validate environment variables
node -e "console.log(process.env.DATABASE_URL ? 'DB OK' : 'DB Missing')"
```

## Related Documentation

- [Setup Guide](./SETUP.md) - Complete installation procedures
- [Troubleshooting](./TROUBLESHOOTING.md) - Detailed problem resolution
- [Development Workflow](./DEVELOPMENT.md) - Daily development procedures
- [Architecture Guide](./ARCHITECTURE.md) - System design overview
