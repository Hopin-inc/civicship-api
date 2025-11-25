# Troubleshooting Guide

This guide explains common issues you may encounter while developing with civicship-api and how to resolve them.

## Database-related issues

### PostgreSQL container won't start

**Symptoms**
- `pnpm container:up` fails
- "Port already in use" error
- Container immediately exits

**Solution**

1. **Check if port 15432 is in use:**
```bash
lsof -i :15432
# or
netstat -tulpn | grep 15432
```

2. **End the process using the port:**
```bash
# Check the PID and terminate
kill -9 <PID>
```

3. **Remove existing containers:**
```bash
docker ps -a | grep postgres
docker rm -f <container_name>
```

4. **Clean up Docker resources:**
```bash
docker system prune -f
docker volume prune -f
```

### Database connection error

**Symptoms**
- "Connection refused" error
- "Database does not exist" error
- Prisma client connection timeout

**Solution**

1. **Check the DATABASE_URL format:**
```env
# Correct format (note port 15432, not 5432)
DATABASE_URL=postgresql://postgres:password@host:15432/civicship_dev
```

2. **Check the container status:**
```bash
docker ps | grep postgres
docker logs <container_name>
```

3. **Test direct connection:**
```bash
docker exec -it <container_name> psql -U postgres -d civicship_dev
```

4. **Recreate the database:**
```bash
pnpm db:reset
pnpm db:seed-master 
pnpm db:seed-domain 
````

### Migration Issues

**Symptoms**
- "Migration failed" error
- Schema drift warning
- Prisma generate failed

**Solution**

1. **Reset the database and migrations:**
```bash
pnpm db:reset
pnpm db:generate
```

2. **Check migration status:**
```bash
pnpm db:migrate status
```

3. **Force migration:**
```bash
pnpm db:migrate deploy
```

## Authentication Issues

### Firebase Authentication Error

**Symptoms**
- "Firebase Admin SDK initialization failed"
- "Invalid private key" error
- Auth middleware failure

**Solution**

1. **Check Firebase environment variables:**
```bash
# Verify required variables are set
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_CLIENT_EMAIL
# Do not echo the private key for security reasons
```

2. **Verify the format of your private key:**
```env
# Include appropriate newline characters (\n)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key_Here\n-----END PRIVATE KEY-----"
```

3. **Verify your Firebase project settings:**
- Verify that your project ID matches the one in the Firebase console
- Verify that authentication is enabled
- Verify the service account permissions

4. **Test your Firebase connection:**
```bash
# Check the server log for Firebase initialization messages
pnpm dev:https | grep -i firebase
```

### JWT token validation error

**Symptoms:**
- "Invalid token" error
- "Token expired" error
- Authentication context not created

**Solution:**

1. **Check token format:**
```javascript
// Include the token in the Authorization header
Authorization: Bearer <firebase_jwt_token>
```

## Google Cloud Storage Issues

### File Upload Failed

**Symptoms**
- "Access Denied" Error When Uploading a File
- "Bucket Not Found" Error
- "Invalid Credentials" Error

**Solution**

1. **Check the GCS Environment Variables:**
```bash
echo $GCS_BUCKET_NAME
echo $GCP_PROJECT_ID
# For security reasons, do not echo the service account.
```

2. **Check the Service Account Permissions:**
- Check whether the service account has the "Storage Object Admin" role.
- Check bucket-level IAM permissions.
- Check project-level permissions.

3. **Test the GCS Connection:**
```bash
# Test Access with the gcloud CLI
gcloud auth activate-service-account --key-file=path/to/service-account.json
gsutil ls gs://your-bucket-name
```

## Development Server Issues

### Port Conflict

**Symptoms**
- "Port 3000 already in use" error
- Server startup failure
- EADDRINUSE error

**Solution**

1. **Check the process using the port:**
```bash
lsof -i :3000
netstat -tulpn | grep 3000
```

2. **End the process:**
```bash
kill -9 <PID>
# or
pkill -f "node.*3000"
```

3. **Use a different port:**
```env
PORT=3001
```

### HTTPS Certificate Issue

**Symptoms**
- "Certificate not trusted" warning
- SSL/TLS connection error
- Browser security warning

**Solution**

1. **Accept the self-signed certificate:**
- Click "Advanced" in the browser warning
- Select "Continue to site"
- Add a security exception

2. **Use HTTP during development:**
```bash
# Use HTTP instead of HTTPS
pnpm dev
```

3. **If the certificate doesn't work, regenerate it:**
- Generate a self-signed certificate by referring to the following Qiita article
  [Creating a Self-Certified Authority and Adding it to the Certificate List - Qiita](https://qiita.com/k_kind/items/b87777efa3d29dcc4467#%E8%87%AA%E5%B7%B1%E8%AA%8D%E8%A8%BC%E5%B1%80%E3%81%AE%E4%BD%9C%E6%88%90%E8%A8%BC%E6%98%8E%E6%9B%B8%E3%83%AA%E3%82%B9%E3%83%88%E3%81%B8%E3%81%AE%E8%BF%BD%E5%8A%A0)
- Two generated key files:
- A file containing `-----BEGIN CERTIFICATE-----` → `localhost.pem`
- `-----BEGIN PRIVATE Files containing KEY-----` → `localhost-key.pem`
- Place the above two files under `.certificates/`
- Restart the server and verify that HTTPS works properly.

## GraphQL Issues

### Schema Generation Error

**Symptoms**
- "GraphQL schema generation failed"
- Type definition conflict
- Codegen error

**Solution**

1. **Clear generated files**
```bash
rm -rf src/types/graphql.ts
pnpm gql:generate
```

2. **Verify schema syntax**
```bash
# Validate GraphQL schema file
find src -name "*.graphql" -exec graphql-schema-linter {} \;
```

## Test-Related Issues

### Test Database Issues

**Symptoms**
- Tests fail with database connection errors
- Tests fail with "Database "not found" Error
- Test Data Conflict

**Solution:**

1. **Check the test environment:**
```bash
# Check if .env.test.local exists
ls -la .env.test*
```

2. **Reset the test database:**
```bash
NODE_ENV=TEST pnpm db:reset
NODE_ENV=TEST pnpm db:seed-master
```

## Performance Issues

### Slow Query Execution

**Symptoms:**
- GraphQL Queries Take a Long Time
- Database Timeout
- High Memory Usage

**Solution:**

1. **Check the Use of DataLoader:**
```typescript
// Use DataLoader for Related Data
const users = await context.dataloaders.user.loadMany(userIds);
```

2. **Analyze Database Queries:**
```bash
# Prisma Enable query logging
DEBUG=prisma:query pnpm dev:https
```

## Environment-specific issues

### Differences between development and production environments

**Symptoms**
- Works in development but fails in production
- Environment variable issues
- Differences in behavior between environments

**Solution**

1. **Compare environment variables**
```bash
# Compare environment variables
env | grep -E "(FIREBASE|GCS|DATABASE)" | sort
```

2. **Test the production build locally**
```bash
NODE_ENV=production pnpm build
NODE_ENV=production node dist/index.js
```

## Getting Additional Support

### Debugging Steps

1. **Enable debug logging:**
```bash
DEBUG=* pnpm dev:https
```

2. **Check server logs:**
```bash
# Monitor logs in real time
tail -f logs/app.log
```

3. **Use the GraphQL Playground:**
- Open the GraphQL endpoint in your browser
- Test queries and mutations
- Check for errors in the Network tab

### Common Log Patterns

**Startup Success:**
```
🚀 Server ready at: https://localhost:3000/graphql
Firebase Admin initialized successfully
Database connected successfully
```

**Authentication Issues:**
```
Firebase initialization failed: Invalid private key
Authentication middleware error: Token validation failed
```

**Database Issues:**
```
Prisma connection error: Connection refused
Migration failed: Schema drift detected
```

## Related Documents

- [Setup Guide](SETUP.md) - Initial Environment Setup
- [Environment Variable Settings](./ENVIRONMENT.md) - Configuration Reference
- [Development Workflow](./DEVELOPMENT.md) - Daily Development Procedures
- [Architecture Guide](./ARCHITECTURE.md) - System Design Overview