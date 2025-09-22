#!/bin/bash

echo "Testing NMKR webhook with mock events..."

curl -X POST http://localhost:3000/nmkr/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "paymentTransactionUid": "test_123",
    "projectUid": "project_456", 
    "state": "confirmed",
    "txHash": "tx_789",
    "customProperty": "{\"propsVersion\":1,\"nftMintId\":\"mint_123\",\"userRef\":\"user_456\"}"
  }'

echo -e "\n\nTest finished state..."

curl -X POST http://localhost:3000/nmkr/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "paymentTransactionUid": "test_124",
    "projectUid": "project_456", 
    "state": "finished",
    "txHash": "tx_790",
    "customProperty": "{\"propsVersion\":1,\"nftMintId\":\"mint_124\",\"userRef\":\"user_456\"}"
  }'

echo -e "\n\nWebhook tests completed"
