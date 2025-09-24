# Custom Properties Security Guidelines

## Overview
The `customProperty` field returned by the `orderCreate` mutation contains sensitive information that should be handled with care in production environments.

## Security Considerations

### Data Exposure
The `customProperty` contains:
- `orderId`: Internal order identifier
- `orderItemId`: Internal order item identifier  
- `userRef`: User identifier
- `receiverAddress`: Blockchain wallet address

### Production Recommendations
1. **Minimize Exposure**: Consider removing `customProperty` from production API responses
2. **Debug Flag**: Implement a debug flag to conditionally include this field
3. **Audit Logging**: Log custom property usage for security monitoring
4. **Client Validation**: Ensure client applications don't log or expose this data

### Implementation Options
```typescript
// Option 1: Debug flag
const includeDebugInfo = process.env.NODE_ENV === 'development' || ctx.user.role === 'ADMIN';

return {
  __typename: 'OrderCreateSuccess',
  order: OrderPresenter.toGraphQL(updatedOrder),
  ...(includeDebugInfo && { customProperty: JSON.stringify(customProps) }),
  paymentAddress: paymentResponse.paymentAddress,
  paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  totalAmount: updatedOrder.totalAmount!,
};

// Option 2: Separate debug endpoint
// Create a separate `orderCreateDebug` mutation for development/testing
```

### Compliance Notes
- Ensure compliance with data protection regulations (GDPR, CCPA)
- Consider data retention policies for debug information
- Implement proper access controls for sensitive debug data

## External API Idempotency Guidelines

### NMKR API Retry Patterns
When calling external NMKR APIs, implement proper retry and idempotency handling:

1. **Payment Address Requests**: Use unique identifiers to prevent duplicate payment addresses
2. **Webhook Processing**: Implement idempotent webhook handlers using transaction IDs
3. **State Transitions**: Ensure NFT mint state changes are atomic and recoverable

### Recovery Strategies
- **Orphaned Orders**: Implement background jobs to recover orders with missing `externalRef`
- **Failed Webhooks**: Retry webhook processing with exponential backoff
- **Partial Failures**: Use database transactions to ensure consistency across service boundaries

### Monitoring and Observability
- **Correlation IDs**: Track requests across service boundaries
- **Structured Logging**: Include context for debugging external API failures
- **Metrics**: Monitor external API success rates and response times
