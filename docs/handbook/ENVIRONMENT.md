# Environment Variable Configuration Guide

## Required Environment Variables

This guide describes all the environment variables required to run civicship-api. Variables are organized by category for easier configuration.

### Core Database & Authentication

```env
# Database Connection (PostgreSQL 16.4, Port 15432)
DATABASE_URL=postgresql://username:password@database_host:15432/civicship_dev

# Environment Settings
ENV=LOCAL # Environment Identifier (LOCAL/DEV/PRD)
NODE_ENV=development # Node.js Environment
PORT=3000 # Server Port
NODE_HTTPS=true # Enable HTTPS for Development
```

### Firebase Authentication

```env
# Firebase Project Settings
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----"
FIREBASE_TOKEN_API_KEY=your_firebase_web_api_key
FIREBASE_ISSUER=https://securetoken.google.com/your_project_id
FIREBASE_AUDIENCE=your_project_id
```

### Google Cloud Storage

```env
# GCS Settings for File Upload
GCS_SERVICE_ACCOUNT_BASE64=base64_encoded_service_account_json
GCS_BUCKET_NAME=your_storage_bucket_name
GCP_PROJECT_ID=your_gcp_project_id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### Security/CORS

```env
# Cross-Origin Resource Sharing (CORS)
ALLOWED_ORIGINS="http://localhost:8000 https://localhost:8000"

# Session Management
EXPRESS_SESSION_SECRET=your_session_secret_key
```

### Activity Booking Settings

```env
# Setting the number of booking days per activity (JSON format)
# Currently, all activities are set to accept bookings up to one day in advance, so the environment variable is not required (deleted).
# If individual settings are required, set the following format:
# ACTIVITY_ADVANCE_BOOKING_DAYS_CONFIG={"activity-id-1":0,"activity-id-2":1,"activity-id-3":7}
```

## Environment File Setup

### Development Environment

1. **Copy the template:**
```bash
cp .env.example .env
```

2. **Enter all values ​​using the variables above**

3. **Important Notes:**
- Include the correct line breaks (`\n`) in your Firebase secret key
- Use PostgreSQL port 15432 (not the default 5432)
- Set `NODE_HTTPS=true` for development HTTPS

### Test Environment

1. **Create a test file:**
```bash
cp .env.test .env.test.local
```

2. **Set test-only values:**
- Use a test Firebase project
- Use a test database URL
- Set a test API key

### Production Environment

1. **Use environment-specific values:**
- Production Firebase project
- Production database connection
- Production GCS bucket
- ​​Production API endpoint

2. **Security Considerations:**
- Use a strong and unique secret for each environment
- API Rotate keys and secrets regularly.
- Grant service accounts only minimal privileges.

## Environment Variable Category Description

### Database-related variables
- `DATABASE_URL`: PostgreSQL connection string including credentials and database name.
- Used for all database operations via Prisma ORM.

### Firebase-related variables
- `FIREBASE_PROJECT_ID`: Firebase project ID.
- `FIREBASE_CLIENT_EMAIL`: Service account email for server authentication.
- `FIREBASE_PRIVATE_KEY`: Service account private key (must include line breaks).
- `FIREBASE_TOKEN_API_KEY`: Web API key for token validation.
- `FIREBASE_ISSUER` / `FIREBASE_AUDIENCE`: JWT validation parameters.

### Google Cloud Storage-related variables
- `GCS_SERVICE_ACCOUNT_BASE64`: Base64-encoded service account JSON.
- `GCS_BUCKET_NAME`: Name of the storage bucket to upload files to
- `GCP_PROJECT_ID`: Google Cloud project ID
- `GOOGLE_APPLICATION_CREDENTIALS`: Path to the service account JSON

### LINE Integration-Related Variables
- The rich menu ID is stored in the database and configured in the admin panel.
- LINE channel credentials (LIFF, Messaging) are also managed in the database.
- Only the rich menu ID is required as an environment variable.

### Security-Related Variables
- `CIVICSHIP_ADMIN_API_KEY`: API key for administrator endpoint protection
- `ALLOWED_ORIGINS`: CORS settings for the web client
- `EXPRESS_SESSION_SECRET`: Secret key for session encryption

## Security Best Practices

### Secret Management
- `.env` files should **never be included in version control**
- Use different values ​​for each environment (dev / staging / prod)
- Store production secrets in a secure secrets management system
- Rotate API keys and secret keys regularly

### Firebase Security
- Limit service accounts to least privileged roles
- Enable Firebase Authentication security rules
- Properly configure CORS for web clients
- Monitor Firebase usage and authentication logs

### Database Security
- Use a strong database password
- Restrict database access to required IP ranges
- Use SSL/TLS for database connections
- Implement regular backups and security updates

### API Security
- Protect admin API endpoints with strong API keys
- Rate limit public endpoints
- Monitor API usage and authentication attempts
- Always use HTTPS for external communications

## Environment Variable Troubleshooting

### Common Issues

**Database Connection Issues**
- Verify the format and credentials of your `DATABASE_URL`
- Ensure the PostgreSQL container is running on port 15432
- Verify that the target database exists and is accessible.

**Firebase Authentication Error:**
- Verify that all Firebase environment variables are set.
- Verify that `FIREBASE_PRIVATE_KEY` contains the appropriate line breaks (`\n`).
- Verify that authentication is enabled for your Firebase project.
- Verify that the service account permissions are set correctly.

**GCS Upload Failed:**
- Verify that `GCS_SERVICE_ACCOUNT_BASE64` is correctly encoded.
- Verify that the bucket exists and is accessible.
- Verify that the service account has Storage Object Admin permissions.
- Verify that `GCP_PROJECT_ID` is correct.

**CORS Issue:**
- Verify that the client domain is included in `ALLOWED_ORIGINS`.
- Verify that the protocol (http/https) matches.
- Verify that the URL does not contain a trailing slash.

### Validation Command

```bash
# Verify Database Connection
pnpm db:studio

# Firebase Verifying the configuration
# Check the Firebase initialization log on the server

# Verify GCS connectivity
# Upload a test file via GraphQL mutation

# Verify environment variables
node -e "console.log(process.env.DATABASE_URL ? 'DB OK' : 'DB Missing')"
```

## Related documentation

- [Setup Guide](../SETUP.md) - Overall installation instructions
- [Troubleshooting](../TROUBLESHOOTING.md) - Detailed troubleshooting
- [Development Flow](DEVELOPMENT.md) - Daily development procedures
- [Architecture Guide](ARCHITECTURE.md) - System design overview