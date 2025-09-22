#!/bin/bash

echo "🔗 Testing NMKR Webhook Integration"
echo "=================================="

echo "Testing webhook endpoint..."

echo "📋 Test 1: Payment Confirmed Event"
curl -k -X POST https://localhost:3000/nmkr/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "paymentTransactionUid": "test_payment_123",
    "projectUid": "test_project_456",
    "state": "confirmed",
    "txHash": "tx_hash_789",
    "customProperty": "{\"propsVersion\":1,\"nftMintId\":\"test_mint_123\",\"userRef\":\"test_user_456\"}"
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo "📋 Test 2: Minting Finished Event"
curl -k -X POST https://localhost:3000/nmkr/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "paymentTransactionUid": "test_payment_123",
    "projectUid": "test_project_456",
    "state": "finished",
    "txHash": "tx_hash_final_999",
    "customProperty": "{\"propsVersion\":1,\"nftMintId\":\"test_mint_123\",\"userRef\":\"test_user_456\"}"
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo "📋 Test 3: Invalid CustomProperty (should handle gracefully)"
curl -k -X POST https://localhost:3000/nmkr/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "paymentTransactionUid": "test_payment_456",
    "projectUid": "test_project_789",
    "state": "confirmed",
    "customProperty": "invalid_json"
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo "📋 Test 4: Missing CustomProperty (should handle gracefully)"
curl -k -X POST https://localhost:3000/nmkr/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "paymentTransactionUid": "test_payment_789",
    "projectUid": "test_project_abc",
    "state": "confirmed"
  }' \
  -w "\nStatus: %{http_code}\n\n"

echo "✅ Webhook integration tests completed!"
