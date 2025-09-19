import 'reflect-metadata';
import { NmkrClient } from './dist/infrastructure/libs/nmkr/index.js';

async function testMissingEndpoints() {
  console.log('🧪 Testing missing NMKR endpoints...\n');
  
  try {
    if (!process.env.NMKR_API_KEY) {
      throw new Error('NMKR_API_KEY environment variable is required');
    }
    
    const nmkrClient = new NmkrClient();
    const projectUid = process.env.NMKR_PROJECT_UID || '078b2532-716a-4dac-b135-b43e2f042185';
    
    // Test GetProjectDetails
    console.log('🔄 Testing GetProjectDetails...');
    try {
      const projectDetails = await nmkrClient.getProjectDetails(projectUid);
      console.log('✅ GetProjectDetails successful:', {
        projectname: projectDetails.projectname,
        policyId: projectDetails.policyId,
        state: projectDetails.state
      });
    } catch (error) {
      console.log('🔥 GetProjectDetails failed:', error.message);
    }
    
    // Test GetPaymentAddressForSpecificNftSale (need an NFT UID)
    console.log('\n🔄 Getting NFT for payment address test...');
    try {
      const nfts = await nmkrClient.getNfts(projectUid, 'free', 1, 1);
      if (nfts && nfts.length > 0) {
        console.log('🔄 Testing GetPaymentAddressForSpecificNftSale...');
        console.log('NFT data:', { uid: nfts[0].uid, name: nfts[0].name });
        const paymentAddress = await nmkrClient.getPaymentAddressForSpecificNftSale(
          nfts[0].uid, 
          1, 
          'test-referer', 
          'test-property'
        );
        console.log('✅ GetPaymentAddressForSpecificNftSale successful:', {
          paymentAddress: paymentAddress.paymentAddress,
          lovelaceToSend: paymentAddress.lovelaceToSend,
          validUntil: paymentAddress.validUntil
        });
      } else {
        console.log('⚠️ No free NFTs available for payment address test');
      }
    } catch (error) {
      console.log('🔥 GetPaymentAddressForSpecificNftSale failed:', error.message);
    }
    
    // Test UpdateMetadata (need an NFT UID)
    console.log('\n🔄 Testing UpdateMetadata...');
    try {
      const nfts = await nmkrClient.getNfts(projectUid, 'free', 1, 1);
      if (nfts && nfts.length > 0) {
        console.log('NFT data for metadata update:', { uid: nfts[0].uid, name: nfts[0].name });
        const updateResult = await nmkrClient.updateMetadata(
          projectUid, 
          nfts[0].uid, 
          { metadata: { testUpdate: true, timestamp: new Date().toISOString() } }
        );
        console.log('✅ UpdateMetadata successful');
      } else {
        console.log('⚠️ No NFTs available for metadata update test');
      }
    } catch (error) {
      console.log('🔥 UpdateMetadata failed:', error.message);
    }
    
    console.log('\n🎉 Missing endpoints test completed!');
    console.log('💡 These endpoints complete the B1, B2, B3/G1 use cases from the mapping table');
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    process.exit(1);
  }
}

testMissingEndpoints().catch(console.error);
