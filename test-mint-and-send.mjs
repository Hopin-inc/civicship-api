import 'reflect-metadata';
import { NmkrClient } from './dist/infrastructure/libs/nmkr/index.js';

async function testMintAndSendEndpoints() {
  console.log('🧪 Testing MintAndSend endpoints...\n');
  
  try {
    if (!process.env.NMKR_API_KEY) {
      throw new Error('NMKR_API_KEY environment variable is required');
    }
    
    const nmkrClient = new NmkrClient();
    const projectUid = process.env.NMKR_PROJECT_UID || '078b2532-716a-4dac-b135-b43e2f042185';
    const testWallet = 'addr_test1qpw0djgj0x59ngrjvqthn7enhvruxnsavsw5th63la3mjel3tkc974sr23jmlzgq5zda4gtv8k9cy38756r9y3qgmkqqjz6aa7';
    
    console.log('🔄 Testing MintAndSendRandom...');
    try {
      const randomResult = await nmkrClient.mintAndSendRandom(projectUid, 1, testWallet);
      console.log('✅ MintAndSendRandom successful:', {
        mintAndSendId: randomResult.mintAndSendId,
        nftCount: randomResult.sendedNft?.length || 0
      });
    } catch (error) {
      console.log('🔥 MintAndSendRandom failed:', error.message);
    }
    
    console.log('\n🔄 Testing inventory check with GetNfts...');
    try {
      const nfts = await nmkrClient.getNfts(projectUid, 'free', 10, 1);
      console.log('✅ Available NFTs for minting:', {
        count: nfts?.length || 0,
        firstNft: nfts?.[0] ? {
          nftUid: nfts[0].nftUid,
          tokenname: nfts[0].tokenname,
          state: nfts[0].state
        } : null
      });
      
      if (nfts && nfts.length > 0) {
        console.log('\n🔄 Testing MintAndSendSpecific with available NFT...');
        try {
          const specificResult = await nmkrClient.mintAndSendSpecific(
            projectUid, 
            nfts[0].nftUid, 
            1, 
            testWallet
          );
          console.log('✅ MintAndSendSpecific successful:', {
            mintAndSendId: specificResult.mintAndSendId,
            nftCount: specificResult.sendedNft?.length || 0
          });
        } catch (error) {
          console.log('🔥 MintAndSendSpecific failed:', error.message);
        }
      }
      
    } catch (error) {
      console.log('🔥 GetNfts failed:', error.message);
    }
    
    console.log('\n🔄 Testing GetCounts for inventory management...');
    try {
      const counts = await nmkrClient.getCounts(projectUid);
      console.log('✅ Project counts:', {
        totalNfts: counts.countNfts,
        freeNfts: counts.countNftsFree,
        reservedNfts: counts.countNftsReserved,
        mintedNfts: counts.countNftsMinted
      });
    } catch (error) {
      console.log('🔥 GetCounts failed:', error.message);
    }
    
    console.log('\n🎉 MintAndSend endpoint tests completed!');
    console.log('💡 These endpoints enable manual NFT minting after payment confirmation');
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    process.exit(1);
  }
}

testMintAndSendEndpoints().catch(console.error);
