import 'reflect-metadata';
import { NmkrClient } from './dist/infrastructure/libs/nmkr/index.js';
import { ImageProcessor } from './dist/utils/imageProcessor.js';

async function testRealImage() {
  console.log('🔍 Testing real numbered image upload...\n');
  
  try {
    if (!process.env.NMKR_API_KEY) {
      throw new Error('NMKR_API_KEY environment variable is required');
    }
    
    const projectUid = process.env.NMKR_PROJECT_UID || '078b2532-716a-4dac-b135-b43e2f042185';
    const imagePath = '/home/ubuntu/repos/civicship-api/numbered-images/test-image-001.png';
    
    console.log(`📋 Testing with real image: ${imagePath}`);
    
    const nmkrClient = new NmkrClient();
    const imageBase64 = await ImageProcessor.convertImageToBase64(imagePath);
    const mimeType = ImageProcessor.getMimeType(imagePath);
    
    console.log(`📊 Image stats:`);
    console.log(`   Base64 length: ${imageBase64.length} characters`);
    console.log(`   MIME type: ${mimeType}`);
    console.log(`   Size: ${Math.round(imageBase64.length / 1024)}KB\n`);
    
    // Use the exact same minimal structure that worked
    const minimalPayload = {
      tokenname: 'test-real-image-001',
      previewImageNft: {
        mimetype: mimeType,
        fileFromBase64: imageBase64
      }
    };
    
    console.log('🚀 Uploading with minimal payload structure...');
    console.log(`   Payload size: ${JSON.stringify(minimalPayload).length} bytes`);
    
    const result = await nmkrClient.uploadNft(projectUid, minimalPayload);
    
    console.log('\n✅ SUCCESS! Real image uploaded:');
    console.log(`   NFT UID: ${result.nftUid}`);
    console.log(`   NFT ID: ${result.nftId}`);
    console.log(`   IPFS Hash: ${result.ipfsHashMainnft}`);
    console.log(`   Asset ID: ${result.assetId}`);
    
    return result;
    
  } catch (error) {
    console.error(`❌ Real image test failed:`, error.message);
    
    if (error.message.includes('406')) {
      console.log('\n🔍 Possible causes:');
      console.log('   - Image too large for API');
      console.log('   - Base64 encoding issue');
      console.log('   - MIME type problem');
      console.log('   - API rate limiting');
    }
    
    throw error;
  }
}

testRealImage().catch(console.error);
