import 'reflect-metadata';
import { NmkrClient, NftState } from './dist/infrastructure/libs/nmkr/index.js';

async function testEnhancedEndpoints() {
  console.log('🧪 Testing Enhanced NMKR Endpoints...\n');
  
  try {
    if (!process.env.NMKR_API_KEY) {
      throw new Error('NMKR_API_KEY environment variable is required');
    }
    
    const nmkrClient = new NmkrClient();
    const projectUid = process.env.NMKR_PROJECT_UID || '078b2532-716a-4dac-b135-b43e2f042185';
    const testWallet = 'addr_test1qqqnv6dtj5r3tup7ewkzn3msaypmlms9rfl4hqvjhqa4n9msy2nd22gry42skfwxezlkmlt07ycw9cv3ehl80gp00wzqw5rw87';
    
    console.log('📋 Test Configuration:');
    console.log(`Project UID: ${projectUid}`);
    console.log(`Test Wallet: ${testWallet}\n`);
    
    const results = { success: [], failed: [] };
    
    async function testEndpoint(name, testFn) {
      try {
        console.log(`🧪 Testing: ${name}`);
        const result = await testFn();
        console.log(`✅ SUCCESS - ${name}`);
        results.success.push(name);
      } catch (error) {
        console.log(`🔥 FAILED - ${name}: ${error.message}`);
        results.failed.push({ name, error: error.message });
      }
      console.log('');
    }
    
    // Test new reservation address endpoints
    await testEndpoint('CheckAddress', () => nmkrClient.checkAddress(projectUid, testWallet));
    
    // Test whitelist management
    await testEndpoint('GetWhitelist', () => nmkrClient.getWhitelist(projectUid));
    
    // Test project listing
    await testEndpoint('ListProjects', () => nmkrClient.listProjects());
    await testEndpoint('ListProjectsPaginated', () => nmkrClient.listProjectsPaginated(10, 1));
    
    // Test sale conditions
    await testEndpoint('GetSaleConditions', () => nmkrClient.getSaleConditions(projectUid));
    
    // Test enhanced type safety with enums
    await testEndpoint('GetNfts with enum', () => nmkrClient.getNfts(projectUid, NftState.FREE, 5, 1));
    
    // Test improved error handling and retry logic
    await testEndpoint('Error handling test', async () => {
      try {
        await nmkrClient.checkAddress('invalid-project-uid', testWallet);
      } catch (error) {
        if (error.name === 'NmkrHttpError') {
          console.log('✅ Proper error handling working');
          return { errorHandling: 'working' };
        }
        throw error;
      }
    });
    
    // Summary
    console.log('\n📊 ENHANCED ENDPOINTS TEST RESULTS\n');
    console.log(`✅ SUCCESSFUL ENDPOINTS (${results.success.length}):`);
    results.success.forEach(name => console.log(`   ✅ ${name}`));
    
    if (results.failed.length > 0) {
      console.log(`\n🔥 FAILED ENDPOINTS (${results.failed.length}):`);
      results.failed.forEach(({ name, error }) => console.log(`   🔥 ${name}: ${error}`));
    }
    
    console.log(`\n🎉 Enhanced endpoints test completed! ${results.success.length} successful, ${results.failed.length} failed.`);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
  }
}

testEnhancedEndpoints().catch(console.error);
