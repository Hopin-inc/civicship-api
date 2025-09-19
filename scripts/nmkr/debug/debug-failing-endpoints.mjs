import 'reflect-metadata';
import { NmkrClient } from './dist/infrastructure/libs/nmkr/index.js';

async function debugFailingEndpoints() {
  console.log('🔍 Debugging Failing NMKR Endpoints...\n');
  
  const nmkrClient = new NmkrClient();
  const projectUid = process.env.NMKR_PROJECT_UID || '078b2532-716a-4dac-b135-b43e2f042185';
  const testWallet = 'addr_test1qqqnv6dtj5r3tup7ewkzn3msaypmlms9rfl4hqvjhqa4n9msy2nd22gry42skfwxezlkmlt07ycw9cv3ehl80gp00wzqw5rw87';
  
  console.log('🔍 1. Checking SaleConditions first...');
  try {
    const saleConditions = await nmkrClient.getSaleConditions(projectUid);
    console.log('✅ SaleConditions:', JSON.stringify(saleConditions, null, 2));
  } catch (error) {
    console.log('❌ Failed to get SaleConditions:', error.message);
  }
  
  console.log('\n🔍 2. Testing GetPaymentAddressForRandomNftSale with different IPs...');
  const testIps = ['8.8.8.8', '1.1.1.1', '208.67.222.222'];
  
  for (const ip of testIps) {
    try {
      console.log(`   Testing with IP: ${ip}`);
      const result = await nmkrClient.getPaymentAddressForRandomNftSale(projectUid, 1, ip);
      console.log(`   ✅ SUCCESS with ${ip}:`, JSON.stringify(result).substring(0, 100));
      break;
    } catch (error) {
      console.log(`   ❌ FAILED with ${ip}: ${error.message}`);
    }
  }
  
  console.log('\n🔍 3. Testing GetAllAssetsInWallet with extended timeout...');
  try {
    console.log('   Using 120s timeout with retry logic...');
    const result = await nmkrClient.getAllAssetsInWallet(testWallet, { timeoutMs: 120000 });
    console.log('   ✅ SUCCESS:', JSON.stringify(result).substring(0, 200));
  } catch (error) {
    console.log('   ❌ FAILED:', error.message);
    
    console.log('\n🔍 4. Trying GetWalletUtxo as alternative...');
    try {
      const utxoResult = await nmkrClient.getWalletUtxo(testWallet);
      console.log('   ✅ GetWalletUtxo SUCCESS (alternative):', JSON.stringify(utxoResult).substring(0, 200));
    } catch (utxoError) {
      console.log('   ❌ GetWalletUtxo also failed:', utxoError.message);
    }
  }
}

debugFailingEndpoints().catch(console.error);
