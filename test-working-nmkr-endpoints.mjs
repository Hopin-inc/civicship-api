import 'reflect-metadata';
import { NmkrClient } from './dist/infrastructure/libs/nmkr/index.js';

async function testWorkingEndpoints() {
  console.log('🧪 Testing Working NMKR Endpoints Only...\n');
  
  try {
    // Check environment variables
    console.log('📋 Environment Check:');
    console.log(`NMKR_BASE_URL: ${process.env.NMKR_BASE_URL || 'https://studio-api.preprod.nmkr.io (default)'}`);
    console.log(`NMKR_API_KEY: ${process.env.NMKR_API_KEY ? '[SET]' : '[NOT SET]'}`);
    console.log(`Environment: ${process.env.NMKR_BASE_URL?.includes('preprod') ? 'TESTNET' : 'MAINNET'}\n`);
    
    if (!process.env.NMKR_API_KEY) {
      console.log('❌ NMKR_API_KEY environment variable is required but not set');
      return;
    }
    
    // Initialize client
    console.log('🔧 Initializing NMKR Client...');
    const nmkrClient = new NmkrClient();
    console.log('✅ NMKR Client initialized successfully\n');
    
    // Test data
    const projectUid = process.env.NMKR_PROJECT_UID || '078b2532-716a-4dac-b135-b43e2f042185';
    const testWallet = 'addr_test1qqqnv6dtj5r3tup7ewkzn3msaypmlms9rfl4hqvjhqa4n9msy2nd22gry42skfwxezlkmlt07ycw9cv3ehl80gp00wzqw5rw87';
    const nftUid = 'd5804538-8421-407f-83a5-021be43ed74d';
    
    console.log('📋 Test Data:');
    console.log(`Project UID: ${projectUid}`);
    console.log(`Test Wallet: ${testWallet}`);
    console.log(`NFT UID: ${nftUid}\n`);
    
    const results = { success: [], failed: [] };
    
    // Helper function to test endpoints
    async function testEndpoint(name, testFn) {
      try {
        console.log(`🧪 Testing: ${name}`);
        const result = await testFn();
        console.log(`✅ SUCCESS - ${name}: ${JSON.stringify(result).substring(0, 200)}...`);
        results.success.push(name);
      } catch (error) {
        console.log(`🔥 FAILED - ${name}: ${error.message}`);
        results.failed.push({ name, error: error.message });
      }
      console.log('');
    }
    
    console.log('🧪 TESTING WORKING ENDPOINTS\n');
    
    // Test CreatePaymentTransaction endpoints (these work)
    await testEndpoint('CreatePaymentTransaction (Specific)', async () => {
      return await nmkrClient.createSpecificNftSale({
        projectUid: projectUid,
        referer: 'civicship-api-test',
        customerIpAddress: '127.0.0.1',
        paymentTransactionType: 'nmkr_pay_specific',
        paymentgatewayParameters: {
          mintNfts: {
            reserveNfts: [{
              lovelace: 1000000,
              nftUid: nftUid,
              tokencount: 1
            }]
          },
          optionalRecevierAddress: testWallet
        }
      });
    });
    
    await testEndpoint('CreatePaymentTransaction (Random)', async () => {
      return await nmkrClient.createRandomNftSale({
        projectUid: projectUid,
        referer: 'civicship-api-test',
        customerIpAddress: '127.0.0.1',
        paymentTransactionType: 'nmkr_pay_random',
        paymentgatewayParameters: {
          mintNfts: {
            countNfts: 1
          },
          optionalRecevierAddress: testWallet
        }
      });
    });
    
    // Test metadata and NFT operations
    await testEndpoint('CheckMetadata', () => nmkrClient.checkMetadata(nftUid));
    await testEndpoint('DuplicateNft', () => nmkrClient.duplicateNft(nftUid));
    
    // Test discount and sale conditions
    await testEndpoint('CheckIfEligibleForDiscount', () => nmkrClient.checkIfEligibleForDiscount(projectUid, testWallet));
    await testEndpoint('CheckIfSaleConditionsMet', () => nmkrClient.checkIfSaleConditionsMet(projectUid, testWallet, 1));
    
    // Test utility endpoints
    await testEndpoint('CheckUtxo', () => nmkrClient.checkUtxo(testWallet));
    await testEndpoint('CreateBurningAddress', () => nmkrClient.createBurningAddress(projectUid, 24));
    
    // Test rates and server info
    await testEndpoint('GetRates', () => nmkrClient.getRates());
    await testEndpoint('GetAdaRates', () => nmkrClient.getAdaRates());
    await testEndpoint('GetServerState', () => nmkrClient.getServerState());
    
    // Test project-specific endpoints
    await testEndpoint('GetCounts', () => nmkrClient.getCounts(projectUid));
    await testEndpoint('GetDiscounts', () => nmkrClient.getDiscounts(projectUid));
    await testEndpoint('GetNotifications', () => nmkrClient.getNotifications(projectUid));
    await testEndpoint('GetProjectTransactions', () => nmkrClient.getProjectTransactions(projectUid));
    await testEndpoint('GetRefunds', () => nmkrClient.getRefunds(projectUid));
    await testEndpoint('GetAdditionalPayoutWallets', () => nmkrClient.getAdditionalPayoutWallets(projectUid));
    
    // Test NFT details
    await testEndpoint('GetNftDetailsById', () => nmkrClient.getNftDetailsById(nftUid));
    await testEndpoint('GetNfts', () => nmkrClient.getNfts(projectUid, 'free', 10, 1));
    
    // Test wallet operations
    await testEndpoint('GetPaymentAddressForRandomNftSale', () => nmkrClient.getPaymentAddressForRandomNftSale(projectUid, 1, '127.0.0.1'));
    await testEndpoint('GetAllAssetsInWallet', () => nmkrClient.getAllAssetsInWallet(testWallet));
    await testEndpoint('GetWalletUtxo', () => nmkrClient.getWalletUtxo(testWallet));
    
    // Summary
    console.log('\n📊 WORKING ENDPOINTS TEST RESULTS SUMMARY\n');
    console.log(`✅ SUCCESSFUL ENDPOINTS (${results.success.length}):`);
    results.success.forEach(name => console.log(`   ✅ ${name}`));
    
    if (results.failed.length > 0) {
      console.log(`\n🔥 FAILED ENDPOINTS (${results.failed.length}):`);
      results.failed.forEach(({ name, error }) => console.log(`   🔥 ${name}: ${error}`));
    }
    
    console.log(`\n🎉 Working endpoints test completed! ${results.success.length} successful, ${results.failed.length} failed.`);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

testWorkingEndpoints().catch(console.error);
