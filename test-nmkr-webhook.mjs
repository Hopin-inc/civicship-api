import axios from 'axios';

async function testNmkrWebhook() {
  console.log('🧪 Testing NMKR webhook endpoint...\n');
  
  const webhookUrl = 'http://localhost:3000/nmkr/webhook';
  
  const testPayloads = [
    {
      name: 'Payment Confirmed',
      payload: {
        paymentTransactionUid: 'test-payment-uid-123',
        projectUid: '078b2532-716a-4dac-b135-b43e2f042185',
        state: 'confirmed',
        paymentTransactionSubstate: 'confirmed',
        txHash: 'test-tx-hash-456',
        customProperties: { testMode: 'true' },
        timestamp: new Date().toISOString()
      }
    },
    {
      name: 'Payment Finished',
      payload: {
        paymentTransactionUid: 'test-payment-uid-789',
        projectUid: '078b2532-716a-4dac-b135-b43e2f042185',
        state: 'finished',
        paymentTransactionSubstate: 'submitted',
        txHash: 'test-tx-hash-abc',
        timestamp: new Date().toISOString()
      }
    }
  ];
  
  for (const test of testPayloads) {
    try {
      console.log(`🔄 Testing ${test.name}...`);
      
      const response = await axios.post(webhookUrl, test.payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        console.log(`✅ ${test.name}: Success (${response.status})`);
      } else {
        console.log(`🔥 ${test.name}: Unexpected status ${response.status}`);
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`🔥 ${test.name}: Server not running (${webhookUrl})`);
      } else {
        console.log(`🔥 ${test.name}: ${error.message}`);
      }
    }
  }
  
  console.log('\n🎉 Webhook tests completed!');
  console.log('💡 Make sure the server is running with: pnpm dev');
}

testNmkrWebhook().catch(console.error);
