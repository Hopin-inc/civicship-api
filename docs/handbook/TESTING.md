# Testing Strategy and Guide

This document describes the testing strategy, how to write tests, and the use of the factory pattern for the civicship-api project.

## Testing Strategy

### Test Types

1. **Unit Testing**
```bash
# Test individual functions/services
pnpm test -- --testPathPattern=unit
```

2. **Integration Testing**
```bash
# Test database interactions
pnpm test -- --testPathPattern=integration
```

3. **Authentication Testing**
```bash
# Test GraphQL authorization rules
pnpm test -- --testPathPattern=auth
```

**Note:** The `pnpm test:integration` and `pnpm test:e2e` commands are currently unavailable. Please use the pattern matching methods above instead.

## Writing Tests

### 1. Service Test

```typescript
// __tests__/unit/services/user.service.test.ts
describe('UserService', () => {
let userService: UserService;
let mockRepository: jest.Mocked<IUserRepository>;

beforeEach(() => {
mockRepository = createMockRepository();
userService = new UserService(mockRepository);
});

it('should create user', async () => {
const userData = createUserData();
const result = await userService.createUser(userData);
expect(result).toBeDefined();
});
});
```

### 2. GraphQL Test

```typescript
// __tests__/integration/graphql/user.test.ts
describe('User GraphQL', () => {
it('should query user by id', async () => {
const user = await createTestUser();
const query = gql`
query GetUser($id: ID!) {
user(id: $id) {
id
name
email
}
}
`;

const result = await client.query({
query,
variables: { id: user.id }
});

expect(result.data.user).toMatchObject({
id: user.id,
name: user.name
});
});
});
```

## Test Data Management

### Using Prisma Fabbrica Factories

```typescript
// Use actual factories from src/infrastructure/prisma/factories/factory.ts
import {
UserFactory,
CommunityFactory,
MembershipFactory
} from '@/infrastructure/prisma/factories/factory';
import { Role, MembershipStatus } from '@prisma/client';

// Create a user (with LINE authentication)
const user = await UserFactory.create();

// Create a community (automatically create a wallet)
const community = await CommunityFactory.create();

// Create related data (using transient fields)
const membership = await MembershipFactory.create({
transientUser: user,
transientCommunity: community,
transientRole: Role.MEMBER,
transientStatus: MembershipStatus.JOINED,
});

// Create multiple data
const users = await UserFactory.createList(5);
```

### Clean up test data

```typescript
// Configured in jest.setup.ts
// - Mock Firebase authentication
// - Initialize Prisma Fabbrica
// - Test Database Configuration

// Test Helper Usage Example
import { createApolloTestServer } from '@/__tests__/helper/test-server';

const mockContext = {
currentUser: { id: 'test-user-id' },
uid: 'test-user-id',
// ... Other Contexts
};

const app = await createApolloTestServer(mockContext);
```

## Factory Pattern Details

### Basic Usage

```typescript
// Basic Entity Creation
const user = await UserFactory.create();
const community = await CommunityFactory.create();

// Creation with Custom Data
const adminUser = await UserFactory.create({
name: 'Admin User',
email: 'admin@example.com'
});

// Creation with Related Data
const membershipWithRelations = await MembershipFactory.create({
transientUser: user,
transientCommunity: community,
transientRole: Role.OWNER,
transientStatus: MembershipStatus.JOINED
});
```

### Complex Test Scenarios

```typescript
// Complete Test Data Including Community and Membership
const setupCommunityWithMembers = async () => {
const owner = await UserFactory.create();
const community = await CommunityFactory.create(); 

const ownerMembership = await MembershipFactory.create({ 
transientUser: owner, 
transientCommunity: community, 
transientRole: Role.OWNER, 
transientStatus: MembershipStatus.JOINED 
}); 

const members = await Promise.all([ 
UserFactory.create(), 
UserFactory.create(), 
UserFactory.create() 
]); 

const memberMemberships = await Promise.all( 
members.map(member => 
MembershipFactory.create({ 
transientUser: member, 
transientCommunity: community, 
transientRole: Role.MEMBER, 
transientStatus: MembershipStatus.JOINED 
}) 
) 
); 

return { 
owner, 
community, 
members, 
ownerMembership, 
memberMemberships 
};
};
```

## Test environment settings

### Environment Variables

```bash
# Use a test database and mocking service
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:15432/civicship_test
```

### Jest Configuration

Test configuration is managed by `jest.config.cjs` and `jest.setup.ts`:

- **Mock Firebase Authentication**
- **Initialize Prisma Fabbrica**
- **Configure a test database**
- **Configure global test helpers**

### Test Execution Commands

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests with a specific pattern
pnpm test -- --testPathPattern=user

# Watch mode (manual execution)
npx jest --watch

# Run a specific test file
pnpm test -- __tests__/unit/account/user.service.test.ts
```

## Testing Best Practices

### 1. Test Structure

- Use the Arrange-Act-Assert pattern
- Write test cases using the Given-When-Then syntax
- Use clear and descriptive test names

### 2. Mocks and Stubs

```typescript
// Mock a Repository
const mockUserRepository = {
findById: jest.fn(),
create: jest.fn(),
update: jest.fn(),
delete: jest.fn()
} as jest.Mocked<IUserRepository>;

// Dependency Injection of Services
const userService = new UserService(mockUserRepository);
```

### 3. Asynchronous Tests

```typescript
// Promise-Based Tests
it('should handle async operations', async () => {
const result = await userService.createUser(userData);
expect(result).toBeDefined();
});

// Error handling test
it('should throw error for invalid data', async () => {
await expect(userService.createUser(invalidData))
.rejects
.toThrow('Invalid user data');
});
```

### 4. GraphQL test

```typescript
// GraphQL query test
const GET_USER = gql`
query GetUser($id: ID!) {
user(id: $id) {
id
name
email
}
}
`;

it('should return user data', async () => {
const user = await UserFactory.create();
const { data } = await client.query({
query: GET_USER, 
variables: { id: user.id } 
}); 

expect(data.user).toMatchObject({ 
id: user.id, 
name: user.name, 
email: user.email 
});
});
```

## Troubleshooting

### Common Problems

1. **Factory Not Found**
```bash
# Verify that the factory was imported correctly
import { UserFactory } from '@/infrastructure/prisma/factories/factory';
```

2. **Test Database Connection Error**
```bash
# Verify that the test database is running
pnpm container:up
```

3. **Firebase Authentication Error**
```bash
# Verify that mocks are configured correctly in jest.setup.ts
```

### Debugging Methods

```bash
# Run tests in debug mode
DEBUG=* pnpm test

# Debug a specific test
node --inspect-brk node_modules/.bin/jest --runInBand your-test-file.test.ts
```

## Related Documentation

- [Development Workflow](./DEVELOPMENT.md) - Daily Development Procedures
- [Implementation Patterns](./PATTERNS.md) - Code Implementation Patterns
- [Command Reference](./COMMANDS.md) - Complete Command List
- [Troubleshooting](TROUBLESHOOTING.md) - Problem-Solving Guide
