import 'reflect-metadata';
import { NmkrClient } from './dist/infrastructure/libs/nmkr/index.js';

async function testGetNmkrPayStatus() {
  console.log('🧪 Testing GetNmkrPayStatus endpoint...\n');
  
  try {
    if (!process.env.NMKR_API_KEY) {
      throw new Error('NMKR_API_KEY environment variable is required');
    }
    
    // First create a payment transaction to get a valid UID
    const nmkrClient = new NmkrClient();
    const projectUid = process.env.NMKR_PROJECT_UID || '078b2532-716a-4dac-b135-b43e2f042185';
    
    console.log('🔄 Creating test payment transaction...');
    const paymentTransaction = await nmkrClient.createRandomNftSale({
      projectUid,
      customerIpAddress: '127.0.0.1',
      paymentTransactionType: 'nmkr_pay_random',
      paymentgatewayParameters: {
        mintNfts: {
          countNfts: 1
        }
      }
    });
    
    console.log('✅ Payment transaction created:', paymentTransaction.paymentTransactionUid);
    
    // Test GetNmkrPayStatus with the created transaction UID
    console.log('\n🔄 Testing GetNmkrPayStatus...');
    const paymentStatus = await nmkrClient.getNmkrPayStatus(paymentTransaction.paymentTransactionUid);
    
    console.log('✅ Payment status retrieved:');
    console.log(`   State: ${paymentStatus.state}`);
    console.log(`   Substate: ${paymentStatus.paymentTransactionSubstate}`);
    console.log(`   Transaction UID: ${paymentStatus.paymentTransactionUid}`);
    console.log(`   Project UID: ${paymentStatus.projectUid}`);
    console.log(`   Created: ${paymentStatus.paymentTransactionCreated}`);
    console.log(`   Expires: ${paymentStatus.expires}`);
    console.log(`   NMKR Pay URL: ${paymentStatus.nmkrPayUrl}`);
    
    console.log('\n🎉 GetNmkrPayStatus test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testGetNmkrPayStatus().catch(console.error);
