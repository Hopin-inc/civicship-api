import 'reflect-metadata';
import { NmkrClient } from './dist/infrastructure/libs/nmkr/index.js';
import { ImageProcessor } from './dist/utils/imageProcessor.js';

async function testBatchNfts() {
  console.log('🧪 Testing batch NFT creation with 3 NFTs...\n');
  
  try {
    if (!process.env.NMKR_API_KEY) {
      throw new Error('NMKR_API_KEY environment variable is required');
    }
    
    const projectUid = process.env.NMKR_PROJECT_UID || '078b2532-716a-4dac-b135-b43e2f042185';
    const imagePath = '/home/ubuntu/repos/civicship-api/numbered-images/test-image-001.png';
    
    const nmkrClient = new NmkrClient();
    const imageBase64 = await ImageProcessor.convertImageToBase64(imagePath);
    const mimeType = ImageProcessor.getMimeType(imagePath);
    
    console.log('🔄 Testing 3 NFT uploads...\n');
    
    for (let i = 1; i <= 3; i++) {
      const tokenName = ImageProcessor.generateSequentialName(i);
      const displayName = `Test Landscape NFT #${i.toString().padStart(3, '0')}`;
      const description = `Test landscape NFT number ${i} of 3`;
      
      try {
        console.log(`🔄 Uploading test NFT ${i}/3: ${tokenName}`);
        
        const uploadPayload = {
          tokenname: tokenName,
          displayname: displayName,
          description: description,
          previewImageNft: {
            mimetype: mimeType,
            fileFromBase64: imageBase64
          },
          priceInLovelace: 1000000,
          isBlocked: false
        };
        
        console.log(`   Payload size: ${JSON.stringify(uploadPayload).length} bytes`);
        console.log(`   Image Base64 size: ${imageBase64.length} bytes`);
        console.log(`   MIME type: ${mimeType}`);
        
        const result = await nmkrClient.uploadNft(projectUid, uploadPayload);
        
        console.log(`✅ Success ${i}/3: ${tokenName}`);
        console.log(`   NFT UID: ${result.nftUid}`);
        console.log(`   IPFS Hash: ${result.ipfsHashMainnft}`);
        console.log(`   Asset ID: ${result.assetId}\n`);
        
      } catch (error) {
        console.log(`🔥 Failed ${i}/3: ${tokenName} -> ${error.message}\n`);
      }
    }
    
    console.log('🎉 Test batch completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBatchNfts().catch(console.error);
