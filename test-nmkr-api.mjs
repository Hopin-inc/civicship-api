import 'reflect-metadata';
import { NmkrClient, createNmkrHttpClient } from './dist/infrastructure/libs/nmkr/index.js';

async function testAllNmkrEndpoints() {
  console.log('🧪 Comprehensive NMKR API Endpoint Testing...\n');
  
  try {
    // Check environment variables
    console.log('📋 Environment Check:');
    console.log(`NMKR_BASE_URL: ${process.env.NMKR_BASE_URL || 'https://studio-api.preprod.nmkr.io (default)'}`);
    console.log(`NMKR_API_KEY: ${process.env.NMKR_API_KEY ? '[SET]' : '[NOT SET]'}`);
    console.log(`Environment: ${process.env.NMKR_BASE_URL?.includes('preprod') ? 'TESTNET' : 'MAINNET'}\n`);
    
    if (!process.env.NMKR_API_KEY) {
      console.log('❌ NMKR_API_KEY environment variable is required but not set');
      console.log('💡 Please set NMKR_API_KEY in your .env file\n');
      return;
    }
    
    // Initialize clients
    console.log('🔧 Initializing NMKR Clients...');
    const nmkrClient = new NmkrClient();
    const httpClient = createNmkrHttpClient();
    console.log('✅ NMKR Clients initialized successfully\n');
    
    // Test data
    const projectUid = process.env.NMKR_PROJECT_UID || '078b2532-716a-4dac-b135-b43e2f042185';
    const auctionUid = 'e8eea89142e4447a9c954268413463d7';
    const testWallet = 'addr_test1qqqnv6dtj5r3tup7ewkzn3msaypmlms9rfl4hqvjhqa4n9msy2nd22gry42skfwxezlkmlt07ycw9cv3ehl80gp00wzqw5rw87';
    const nftUid = 'd5804538-8421-407f-83a5-021be43ed74d';
    
    console.log('📋 Test Data:');
    console.log(`Project UID: ${projectUid}`);
    console.log(`Auction UID: ${auctionUid}`);
    console.log(`Test Wallet: ${testWallet}`);
    console.log(`NFT UID: ${nftUid}\n`);
    
    const results = {
      implemented: [],
      unimplemented: [],
      failed: [],
      success: []
    };
    
    // Test 1: Implemented Endpoints via NmkrClient
    console.log('🧪 SECTION 1: Testing Implemented Client Methods\n');
    
    // 1.1 Get Project Info
    await testEndpoint('GetProjectDetails', async () => {
      const result = await nmkrClient.getProjectInfo(projectUid);
      return result;
    }, results);
    
    // 1.2 Check Payment Address
    await testEndpoint('CheckAddress', async () => {
      const result = await nmkrClient.checkPaymentAddress(projectUid, testWallet);
      return result;
    }, results);
    
    // 1.3 Create Specific NFT Sale
    await testEndpoint('CreatePaymentTransaction (Specific)', async () => {
      const result = await nmkrClient.createSpecificNftSale({
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
      return result;
    }, results);
    
    // 1.4 Create Random NFT Sale
    let testPaymentTransactionUid = null;
    await testEndpoint('CreatePaymentTransaction (Random)', async () => {
      const result = await nmkrClient.createRandomNftSale({
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
      
      // Store payment transaction UID for workflow testing
      if (result && result.paymentTransactionUid) {
        testPaymentTransactionUid = result.paymentTransactionUid;
        console.log(`💾 Stored payment transaction UID for workflow testing: ${testPaymentTransactionUid}`);
      }
      
      return result;
    }, results);

    // 🥇 Priority: ProceedPaymentTransaction Workflow Tests
    console.log('\n🥇 PRIORITY: Testing ProceedPaymentTransaction Workflow\n');
    
    if (testPaymentTransactionUid) {
      // 1.5 Get Transaction State
      await testEndpoint('GetTransactionState', async () => {
        const result = await nmkrClient.getTransactionState(testPaymentTransactionUid);
        return result;
      }, results);

      // 1.6 Get Payment Address
      await testEndpoint('GetPaymentAddress', async () => {
        const result = await nmkrClient.getPaymentAddress(testPaymentTransactionUid);
        return result;
      }, results);

      // 1.7 Reserve Paymentgateway Mint And Send NFT
      await testEndpoint('ReservePaymentgatewayMintAndSendNft', async () => {
        const result = await nmkrClient.reservePaymentgatewayMintAndSendNft(testPaymentTransactionUid, {
          receiverAddress: testWallet
        });
        return result;
      }, results);

      // 1.8 Mint And Send Paymentgateway NFT
      await testEndpoint('MintAndSendPaymentgatewayNft', async () => {
        const result = await nmkrClient.mintAndSendPaymentgatewayNft(testPaymentTransactionUid, {
          receiverAddress: testWallet
        });
        return result;
      }, results);

      // 1.9 Cancel Transaction (test last to avoid breaking other tests)
      await testEndpoint('CancelTransaction', async () => {
        const result = await nmkrClient.cancelTransaction(testPaymentTransactionUid);
        return result;
      }, results);
    } else {
      console.log('⚠️  Skipping workflow tests - no payment transaction UID available');
      results.failed.push({ name: 'ProceedPaymentTransaction Workflow', error: 'No payment transaction UID from CreatePaymentTransaction' });
    }
    
    // Test 2: Direct HTTP Calls for Unimplemented Endpoints
    console.log('\n🧪 SECTION 2: Testing Unimplemented Endpoints via HTTP Client\n');
    
    // 2.1 Auction State
    await testEndpoint('GetAuctionState', async () => {
      const response = await httpClient.get(`/v2/GetAuctionState/${auctionUid}`);
      return response.data;
    }, results);
    
    // 2.2 Get NMKR Pay Link
    await testEndpoint('GetNmkrPayLink', async () => {
      const response = await httpClient.post('/v2/GetNmkrPayLink', {
        projectUid: projectUid,
        paymentTransactionType: 'nmkr_pay_random',
        paymentgatewayParameters: {
          mintNfts: {
            countNfts: 1
          }
        }
      });
      return response.data;
    }, results);
    
    // 2.3 Get NMKR Pay Status (requires payment transaction UID)
    await testEndpoint('GetNmkrPayStatus', async () => {
      // This will likely fail without a valid payment transaction UID
      const response = await httpClient.get('/v2/GetNmkrPayStatus/test-transaction-uid');
      return response.data;
    }, results);
    
    // 2.4 Get Project Stats
    await testEndpoint('GetProjectStats', async () => {
      const response = await httpClient.get(`/v2/GetProjectStats/${projectUid}`);
      return response.data;
    }, results);
    
    // 2.5 Get All Projects
    await testEndpoint('GetAllProjects', async () => {
      const response = await httpClient.get('/v2/GetAllProjects');
      return response.data;
    }, results);
    
    // 2.6 Get NFT Details
    await testEndpoint('GetNftDetails', async () => {
      const response = await httpClient.get(`/v2/GetNftDetails/${nftUid}`);
      return response.data;
    }, results);
    
    // 2.7 Get Project NFTs
    await testEndpoint('GetProjectNfts', async () => {
      const response = await httpClient.get(`/v2/GetProjectNfts/${projectUid}`);
      return response.data;
    }, results);
    
    // 2.8 Get Payout Wallets
    await testEndpoint('GetPayoutWallets', async () => {
      const response = await httpClient.get('/v2/GetPayoutWallets');
      return response.data;
    }, results);

    // Test 3: Additional Endpoints from Swagger Documentation
    console.log('\n🧪 SECTION 3: Testing Additional Swagger Endpoints\n');
    
    // 3.1 Customer/Wallet Management
    await testEndpoint('AddPayoutWallet', async () => {
      const response = await httpClient.get(`/v2/AddPayoutWallet/${testWallet}`);
      return response.data;
    }, results);
    
    // 3.2 NFT Management
    await testEndpoint('BlockUnblockNft', async () => {
      const response = await httpClient.get(`/v2/BlockUnblockNft/${nftUid}/true`);
      return response.data;
    }, results);
    
    await testEndpoint('CheckMetadata', async () => {
      const response = await httpClient.get(`/v2/CheckMetadata/${nftUid}`);
      return response.data;
    }, results);
    
    await testEndpoint('DuplicateNft', async () => {
      const response = await httpClient.post(`/v2/DuplicateNft/${nftUid}`, {});
      return response.data;
    }, results);
    
    
    // 3.3 Address/Payment Management
    await testEndpoint('CancelAddressReservation', async () => {
      const response = await httpClient.get(`/v2/CancelAddressReservation/${projectUid}/${testWallet}`);
      return response.data;
    }, results);
    
    await testEndpoint('CheckAddressWithCustomproperty', async () => {
      const response = await httpClient.get(`/v2/CheckAddressWithCustomproperty/${projectUid}/test-property`);
      return response.data;
    }, results);
    
    await testEndpoint('CheckIfEligibleForDiscount', async () => {
      const response = await httpClient.get(`/v2/CheckIfEligibleForDiscount/${projectUid}/${testWallet}`);
      return response.data;
    }, results);
    
    await testEndpoint('CheckIfSaleConditionsMet', async () => {
      const response = await httpClient.get(`/v2/CheckIfSaleConditionsMet/${projectUid}/${testWallet}/1`);
      return response.data;
    }, results);
    
    await testEndpoint('CheckUtxo', async () => {
      const response = await httpClient.get(`/v2/CheckUtxo/${testWallet}`);
      return response.data;
    }, results);
    
    // 3.4 Project Management
    await testEndpoint('CreateBurningAddress', async () => {
      const response = await httpClient.get(`/v2/CreateBurningAddress/${projectUid}/24`);
      return response.data;
    }, results);
    
    
    
    // 3.5 Auction Management
    
    await testEndpoint('GetAllAuctions', async () => {
      const response = await httpClient.get('/v2/GetAllAuctions/test-customer-id');
      return response.data;
    }, results);
    
    // 3.6 Tools and Utilities
    await testEndpoint('GetActiveDirectsaleListings', async () => {
      const response = await httpClient.get(`/v2/GetActiveDirectsaleListings/${testWallet}`);
      return response.data;
    }, results);
    
    await testEndpoint('GetCardanoCurrentSlot', async () => {
      const response = await httpClient.get('/v2/GetCardanoCurrentSlot');
      return response.data;
    }, results);
    
    await testEndpoint('GetCardanoEpochInfo', async () => {
      const response = await httpClient.get('/v2/GetCardanoEpochInfo');
      return response.data;
    }, results);
    
    await testEndpoint('GetCardanoNetworkTip', async () => {
      const response = await httpClient.get('/v2/GetCardanoNetworkTip');
      return response.data;
    }, results);
    
    await testEndpoint('GetCardanoProtocolParameters', async () => {
      const response = await httpClient.get('/v2/GetCardanoProtocolParameters');
      return response.data;
    }, results);
    
    // 3.7 Transaction and State Management
    await testEndpoint('GetTransactionState', async () => {
      const response = await httpClient.get('/v2/GetTransactionState/test-tx-uid');
      return response.data;
    }, results);
    
    await testEndpoint('GetTransactionUtxos', async () => {
      const response = await httpClient.get('/v2/GetTransactionUtxos/test-tx-hash');
      return response.data;
    }, results);
    
    // 3.8 Wallet and Customer Management
    await testEndpoint('CheckWalletValidation', async () => {
      const response = await httpClient.get('/v2/CheckWalletValidation/test-validation-uid');
      return response.data;
    }, results);
    
    await testEndpoint('CreateWallet', async () => {
      const response = await httpClient.post('/v2/CreateWallet/test-customer-id', {
        walletname: 'test-wallet'
      });
      return response.data;
    }, results);
    
    // 3.9 Metadata and Information
    await testEndpoint('GetMetadataFromNft', async () => {
      const response = await httpClient.get(`/v2/GetMetadataFromNft/${nftUid}`);
      return response.data;
    }, results);
    
    await testEndpoint('GetNftCountOfProject', async () => {
      const response = await httpClient.get(`/v2/GetNftCountOfProject/${projectUid}`);
      return response.data;
    }, results);
    
    await testEndpoint('GetNftsByPolicyId', async () => {
      const response = await httpClient.get('/v2/GetNftsByPolicyId/test-policy-id');
      return response.data;
    }, results);
    
    await testEndpoint('GetPolicyIdFromProject', async () => {
      const response = await httpClient.get(`/v2/GetPolicyIdFromProject/${projectUid}`);
      return response.data;
    }, results);
    
    // 3.10 Advanced Features
    await testEndpoint('GetRoyaltyInformation', async () => {
      const response = await httpClient.get('/v2/GetRoyaltyInformation/test-policy-id/test-token-name');
      return response.data;
    }, results);
    
    await testEndpoint('GetTokenInformation', async () => {
      const response = await httpClient.get('/v2/GetTokenInformation/test-policy-id/test-token-name');
      return response.data;
    }, results);
    
    await testEndpoint('GetWalletAssets', async () => {
      const response = await httpClient.get(`/v2/GetWalletAssets/${testWallet}`);
      return response.data;
    }, results);
    
    await testEndpoint('GetWalletInfo', async () => {
      const response = await httpClient.get(`/v2/GetWalletInfo/${testWallet}`);
      return response.data;
    }, results);

    // Test 3: Additional Comprehensive Endpoints from Swagger
    console.log('\n🧪 SECTION 3: Testing Remaining Swagger Endpoints\n');
    
    // 4.1 Rates and Market Data
    await testEndpoint('GetAdaRates', async () => {
      const response = await httpClient.get('/v2/GetAdaRates');
      return response.data;
    }, results);
    
    await testEndpoint('GetRates', async () => {
      const response = await httpClient.get('/v2/GetRates');
      return response.data;
    }, results);
    
    await testEndpoint('GetSolanaRates', async () => {
      const response = await httpClient.get('/v2/GetSolanaRates');
      return response.data;
    }, results);
    
    // 4.2 Wallet and Asset Information
    await testEndpoint('GetAllAssetsInWallet', async () => {
      const response = await httpClient.get(`/v2/GetAllAssetsInWallet/${testWallet}`);
      return response.data;
    }, results);
    
    await testEndpoint('GetAmountOfSpecificTokenInWallet', async () => {
      const response = await httpClient.get(`/v2/GetAmountOfSpecificTokenInWallet/${testWallet}/test-policy-id/test-token-name`);
      return response.data;
    }, results);
    
    await testEndpoint('GetWalletUtxo', async () => {
      const response = await httpClient.get(`/v2/GetWalletUtxo/${testWallet}`);
      return response.data;
    }, results);
    
    // 4.3 Project Information and Statistics
    await testEndpoint('GetCounts', async () => {
      const response = await httpClient.get(`/v2/GetCounts/${projectUid}`);
      return response.data;
    }, results);
    
    await testEndpoint('GetDiscounts', async () => {
      const response = await httpClient.get(`/v2/GetDiscounts/${projectUid}`);
      return response.data;
    }, results);
    
    await testEndpoint('GetNotifications', async () => {
      const response = await httpClient.get(`/v2/GetNotifications/${projectUid}`);
      return response.data;
    }, results);
    
    await testEndpoint('GetPricelist', async () => {
      const response = await httpClient.get(`/v2/GetPricelist/${projectUid}`);
      return response.data;
    }, results);
    
    await testEndpoint('GetProjectTransactions', async () => {
      const response = await httpClient.get(`/v2/GetProjectTransactions/${projectUid}`);
      return response.data;
    }, results);
    
    await testEndpoint('GetRefunds', async () => {
      const response = await httpClient.get(`/v2/GetRefunds/${projectUid}`);
      return response.data;
    }, results);
    
    await testEndpoint('GetSaleConditions', async () => {
      const response = await httpClient.get(`/v2/GetSaleConditions/${projectUid}`);
      return response.data;
    }, results);
    
    await testEndpoint('GetAdditionalPayoutWallets', async () => {
      const response = await httpClient.get(`/v2/GetAdditionalPayoutWallets/${projectUid}`);
      return response.data;
    }, results);
    
    // 4.4 NFT Detailed Information
    await testEndpoint('GetNftDetailsById', async () => {
      const response = await httpClient.get(`/v2/GetNftDetailsById/${nftUid}`);
      return response.data;
    }, results);
    
    await testEndpoint('GetNftDetailsByTokenname', async () => {
      const response = await httpClient.get(`/v2/GetNftDetailsByTokenname/${projectUid}/test-token-name`);
      return response.data;
    }, results);
    
    await testEndpoint('GetNfts', async () => {
      const response = await httpClient.get(`/v2/GetNfts/${projectUid}/free/10/1`);
      return response.data;
    }, results);
    
    await testEndpoint('GetMetadataForToken', async () => {
      const response = await httpClient.get('/v2/GetMetadataForToken/test-policy-id/test-token-hex');
      return response.data;
    }, results);
    
    await testEndpoint('GetPreviewImageForToken', async () => {
      const response = await httpClient.get('/v2/GetPreviewImageForToken/test-policy-id/test-token-hex');
      return response.data;
    }, results);
    
    // 4.5 Payment Address Generation
    await testEndpoint('GetPaymentAddressForRandomNftSale', async () => {
      const response = await httpClient.get(`/v2/GetPaymentAddressForRandomNftSale/${projectUid}/1`);
      return response.data;
    }, results);
    
    await testEndpoint('GetPaymentAddressForSpecificNftSale', async () => {
      const response = await httpClient.get(`/v2/GetPaymentAddressForSpecificNftSale/${nftUid}/1`);
      return response.data;
    }, results);
    
    // 4.6 Cardano Network Information
    await testEndpoint('GetCardanoTokenRegistryInformation', async () => {
      const response = await httpClient.get('/v2/GetCardanoTokenRegistryInformation/test-policy-id/test-token-name');
      return response.data;
    }, results);
    
    await testEndpoint('GetPolicySnapshot', async () => {
      const response = await httpClient.get('/v2/GetPolicySnapshot/test-policy-id');
      return response.data;
    }, results);
    
    // 4.7 Customer and Account Management
    await testEndpoint('GetCustomerTransactions', async () => {
      const response = await httpClient.get('/v2/GetCustomerTransactions/test-customer-id');
      return response.data;
    }, results);
    
    await testEndpoint('GetMintCouponBalance', async () => {
      const response = await httpClient.get('/v2/GetMintCouponBalance');
      return response.data;
    }, results);
    
    await testEndpoint('GetSubcustomers', async () => {
      const response = await httpClient.get('/v2/GetSubcustomers/test-customer-id');
      return response.data;
    }, results);
    
    // 4.8 Advanced Features and Tools
    await testEndpoint('GetIdentityAccounts', async () => {
      const response = await httpClient.get('/v2/GetIdentityAccounts/test-policy-id');
      return response.data;
    }, results);
    
    await testEndpoint('GetPublicMints', async () => {
      const response = await httpClient.get('/v2/GetPublicMints');
      return response.data;
    }, results);
    
    await testEndpoint('GetServerState', async () => {
      const response = await httpClient.get('/v2/GetServerState');
      return response.data;
    }, results);
    
    // 4.9 Split and Vesting Addresses
    await testEndpoint('GetSplitAddresses', async () => {
      const response = await httpClient.get('/v2/GetSplitAddresses/test-customer-id');
      return response.data;
    }, results);
    
    await testEndpoint('GetVestingAddresses', async () => {
      const response = await httpClient.get('/v2/GetVestingAddresses/test-customer-id');
      return response.data;
    }, results);
    
    await testEndpoint('GetUtxoFromVestingAddress', async () => {
      const response = await httpClient.get(`/v2/GetUtxoFromVestingAddress/test-customer-id/${testWallet}`);
      return response.data;
    }, results);
    
    // 4.10 Wallet Validation
    await testEndpoint('GetWalletValidationAddress', async () => {
      const response = await httpClient.get('/v2/GetWalletValidationAddress/test-validation-name');
      return response.data;
    }, results);
    
    // 4.11 IPFS and File Management
    await testEndpoint('GetAllUploadedFiles', async () => {
      const response = await httpClient.get('/v2/GetAllUploadedFiles/test-customer-id');
      return response.data;
    }, results);
    
    // 4.12 POST Endpoints with Payloads
    await testEndpoint('CreateProject', async () => {
      const response = await httpClient.post('/v2/CreateProject', {
        projectname: 'test-project',
        description: 'Test project for API testing'
      });
      return response.data;
    }, results);
    
    await testEndpoint('CreateAuction', async () => {
      const response = await httpClient.post('/v2/CreateAuction/test-customer-id', {
        auctionname: 'test-auction',
        minbet: 1000000,
        runsuntil: '2025-12-31T23:59:59Z'
      });
      return response.data;
    }, results);
    
    await testEndpoint('CreateSplitAddress', async () => {
      const response = await httpClient.post('/v2/CreateSplitAddress/test-customer-id', {
        splitPercentage: 50,
        targetAddress: testWallet
      });
      return response.data;
    }, results);
    
    await testEndpoint('CreateVestingAddress', async () => {
      const response = await httpClient.post('/v2/CreateVestingAddress/test-customer-id', {
        vestingPeriod: 30,
        targetAddress: testWallet
      });
      return response.data;
    }, results);
    
    await testEndpoint('CreateSubcustomer', async () => {
      const response = await httpClient.post('/v2/CreateSubcustomer/test-customer-id', {
        subcustomername: 'test-subcustomer'
      });
      return response.data;
    }, results);
    
    await testEndpoint('CreateApikeyForSubcustomer', async () => {
      const response = await httpClient.post('/v2/CreateApikeyForSubcustomer/test-customer-id', {
        subcustomerId: 'test-subcustomer-id'
      });
      return response.data;
    }, results);
    
    await testEndpoint('GetKeyHash', async () => {
      const response = await httpClient.post('/v2/GetKeyHash/test-customer-id', {
        walletId: 'test-wallet-id'
      });
      return response.data;
    }, results);
    
    await testEndpoint('GetAmountOfSpecificTokenInWallet_POST', async () => {
      const response = await httpClient.post('/v2/GetAmountOfSpecificTokenInWallet/test-policy-id/test-token-name', {
        addresses: [testWallet]
      });
      return response.data;
    }, results);
    
    await testEndpoint('GetPaymentAddressForSpecificNftSale_POST', async () => {
      const response = await httpClient.post('/v2/GetPaymentAddressForSpecificNftSale', {
        nftUid: nftUid,
        tokencount: 1,
        receiverAddress: testWallet
      });
      return response.data;
    }, results);
    
    // Test 4: Summary Report
    console.log('\n📊 COMPREHENSIVE TEST RESULTS SUMMARY\n');
    
    console.log(`✅ SUCCESSFUL ENDPOINTS (${results.success.length}):`);
    results.success.forEach(endpoint => {
      console.log(`   ✅ ${endpoint}`);
    });
    
    console.log(`\n🔥 FAILED ENDPOINTS (${results.failed.length}):`);
    results.failed.forEach(endpoint => {
      console.log(`   🔥 ${endpoint}`);
    });
    
    console.log(`\n📈 IMPLEMENTATION STATUS:`);
    console.log(`   Implemented in Client: ${results.implemented.length}`);
    console.log(`   Direct HTTP Only: ${results.unimplemented.length}`);
    console.log(`   Total Tested: ${results.success.length + results.failed.length}`);
    
    console.log('\n🎉 Comprehensive NMKR API testing completed!');
    
  } catch (error) {
    console.error('💥 Fatal error during comprehensive testing:', error);
  }
}

async function testEndpoint(name, testFunction, results) {
  console.log(`🧪 Testing: ${name}`);
  try {
    const result = await testFunction();
    console.log(`✅ SUCCESS - ${name}:`, typeof result === 'object' ? JSON.stringify(result, null, 2).substring(0, 200) + '...' : result);
    results.success.push(name);
    if (name.includes('Client') || ['GetProjectDetails', 'CheckAddress', 'CreatePaymentTransaction'].some(impl => name.includes(impl))) {
      results.implemented.push(name);
    } else {
      results.unimplemented.push(name);
    }
  } catch (error) {
    if (error.name === 'NmkrHttpError') {
      console.log(`🔥 FAILED - ${name}: ${error.message} (Status: ${error.statusCode})`);
    } else {
      console.log(`🔥 FAILED - ${name}: ${error.message}`);
    }
    results.failed.push(name);
  }
  console.log('');
}

testAllNmkrEndpoints().catch(console.error);
