# NMKR-Prisma Integration Verification Checklist

## 📋 Phase 1: CustomProperties Foundation

### ✅ Schema & Validation
- [ ] CustomPropsV1 interface correctly defined with all required fields
- [ ] buildCustomProps() creates valid JSON with propsVersion=1
- [ ] parseCustomProps() validates and parses JSON correctly
- [ ] Invalid JSON handling returns proper error messages
- [ ] Missing propsVersion handling
- [ ] Type safety for all optional fields

### ✅ NMKR Client Integration
- [ ] getPaymentAddressForSpecificNftSaleWithCustomProps() uses buildCustomProps
- [ ] getPaymentAddressForRandomNftSaleWithCustomProps() logs but doesn't send customProps
- [ ] All NMKR client calls go through customProperties builders
- [ ] No direct JSON string construction in client code

### ✅ Webhook Processing
- [ ] Webhook handler validates customProperty at entry point
- [ ] Invalid customProperty returns 400 with proper error
- [ ] Missing customProperty handled gracefully
- [ ] Missing nftMintId in customProperty handled gracefully

## 📋 Phase 2: State Transition Management

### ✅ Rank-Based Transitions
- [ ] NftMintStatusRank correctly defined (QUEUED:0, SUBMITTED:1, MINTED:2, FAILED:2)
- [ ] canTransitionTo() enforces forward-only progression
- [ ] shouldUpdateMint() prevents stale events
- [ ] txHash preservation (don't overwrite with null)
- [ ] Terminal states (MINTED/FAILED) cannot be overwritten

### ✅ Webhook State Processing
- [ ] NMKR state mapping (confirmed→SUBMITTED, finished→MINTED, canceled/expired→FAILED)
- [ ] Stale events are skipped with proper logging
- [ ] State transitions are atomic within transactions
- [ ] Error handling for unknown NMKR states

### ✅ Database Consistency
- [ ] Conditional updates based on rank comparison
- [ ] Transaction rollback on failure
- [ ] Proper error logging with correlation IDs

## 📋 Phase 3: Inventory Transfer Logic

### ✅ Inventory Calculation Service
- [ ] calculateInventory() returns correct InventorySnapshot
- [ ] Reserved count (PENDING orders)
- [ ] SoldPendingMint count (PAID orders with SUBMITTED mints)
- [ ] Minted count (orders with MINTED mints)
- [ ] Available calculation (maxSupply - reserved - soldPendingMint - minted)
- [ ] Handles products with no maxSupply

### ✅ State Transition Triggers
- [ ] ON_PAID transition (QUEUED→SUBMITTED) triggers inventory recalculation
- [ ] ON_MINTED transition (SUBMITTED→MINTED) triggers inventory recalculation
- [ ] Inventory snapshots logged with proper correlation IDs
- [ ] Transaction consistency for state + inventory updates

### ✅ Edge Cases
- [ ] Concurrent state transitions handled properly
- [ ] Negative available inventory handled gracefully
- [ ] Missing product records handled
- [ ] Missing order/orderItem records handled

## 📋 Security & Development Features

### ✅ HMAC Verification
- [ ] HMAC bypass works in development (NODE_ENV !== 'production')
- [ ] HMAC verification works in production mode
- [ ] Invalid signatures rejected with 401
- [ ] Missing signatures handled appropriately
- [ ] Timing-safe comparison used

### ✅ Error Handling & Logging
- [ ] All errors logged with proper context
- [ ] Correlation IDs used consistently (nftMintId)
- [ ] No sensitive data in logs
- [ ] Proper error responses to webhook calls
- [ ] Graceful degradation on service failures

## 📋 Integration & End-to-End

### ✅ Full Webhook Flow
- [ ] Payment confirmed → SUBMITTED state → inventory transfer
- [ ] Minting finished → MINTED state → inventory transfer
- [ ] Failed payments → FAILED state (no inventory impact)
- [ ] Duplicate/stale events ignored properly

### ✅ Service Dependencies
- [ ] All services registered in DI container
- [ ] Proper dependency injection working
- [ ] Service resolution without circular dependencies
- [ ] Mock context creation for webhook processing

### ✅ TypeScript & Build
- [ ] No TypeScript compilation errors
- [ ] All imports resolved correctly
- [ ] Generated types working properly
- [ ] No runtime type errors

## 📋 Performance & Scalability

### ✅ Database Performance
- [ ] Inventory calculations use efficient aggregations
- [ ] Proper indexing on frequently queried fields
- [ ] Transaction scope minimized
- [ ] No N+1 query problems

### ✅ Error Recovery
- [ ] Webhook processing is idempotent
- [ ] Failed webhooks can be retried safely
- [ ] Partial failures don't corrupt state
- [ ] Proper cleanup on transaction rollback

## 📋 Local Testing Scenarios

### ✅ Happy Path
- [ ] Create order → Payment confirmed → Mint finished
- [ ] Inventory counts update correctly at each step
- [ ] All logs contain proper correlation IDs

### ✅ Error Scenarios
- [ ] Invalid webhook payloads
- [ ] Missing database records
- [ ] Network failures during processing
- [ ] Concurrent webhook processing

### ✅ Edge Cases
- [ ] Out-of-order webhook delivery
- [ ] Duplicate webhook delivery
- [ ] Webhook delivery after long delays
- [ ] Malformed customProperty data

---

## 🎯 Verification Commands

```bash
# Build verification
pnpm build

# Server startup
NODE_HTTPS=true pnpm dev:https

# Unit tests
node test-nmkr-integration.mjs

# Webhook tests
./test-webhook-simple.sh

# Custom property tests
node test-custom-properties.mjs

# State transition tests  
node test-state-transitions.mjs
```

## 📊 Success Criteria

- [ ] All TypeScript compilation passes
- [ ] All unit tests pass
- [ ] All webhook endpoints return 200 OK
- [ ] State transitions work correctly
- [ ] Inventory calculations are accurate
- [ ] Error handling is robust
- [ ] Logging provides good observability
- [ ] HMAC bypass works in development
- [ ] No security vulnerabilities introduced
