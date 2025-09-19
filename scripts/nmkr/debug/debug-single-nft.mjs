import 'reflect-metadata';
import { NmkrClient } from './dist/infrastructure/libs/nmkr/index.js';
import { ImageProcessor } from './dist/utils/imageProcessor.js';
import fs from 'fs';

async function debugSingleNft() {
  console.log('🔍 Debugging single NFT upload...\n');
  
  try {
    if (!process.env.NMKR_API_KEY) {
      throw new Error('NMKR_API_KEY environment variable is required');
    }
    
    const projectUid = process.env.NMKR_PROJECT_UID || '078b2532-716a-4dac-b135-b43e2f042185';
    const imagePath = '/home/ubuntu/repos/civicship-api/numbered-images/test-image-001.png';
    
    console.log(`📋 Configuration:`);
    console.log(`Project UID: ${projectUid}`);
    console.log(`Image Path: ${imagePath}`);
    console.log(`API Base URL: ${process.env.NMKR_BASE_URL}`);
    console.log(`API Key: ${process.env.NMKR_API_KEY?.substring(0, 8)}...`);
    
    // Verify image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found: ${imagePath}`);
    }
    
    const imageStats = fs.statSync(imagePath);
    console.log(`📊 Image Stats: ${Math.round(imageStats.size / 1024)}KB\n`);
    
    // Convert image
    console.log('🖼️  Converting image to Base64...');
    const imageBase64 = await ImageProcessor.convertImageToBase64(imagePath);
    const mimeType = ImageProcessor.getMimeType(imagePath);
    
    console.log(`✅ Image converted:`);
    console.log(`   Base64 length: ${imageBase64.length} characters`);
    console.log(`   MIME type: ${mimeType}`);
    console.log(`   Base64 preview: ${imageBase64.substring(0, 50)}...`);
    
    // Create payload
    const uploadPayload = {
      tokenname: 'debug-test-001',
      displayname: 'Debug Test NFT #001',
      description: 'Debug test NFT for format validation',
      previewImageNft: {
        mimetype: mimeType,
        fileFromBase64: imageBase64
      },
      priceInLovelace: 1000000,
      isBlocked: false
    };
    
    console.log(`\n📦 Payload Structure:`);
    console.log(`   tokenname: ${uploadPayload.tokenname}`);
    console.log(`   displayname: ${uploadPayload.displayname}`);
    console.log(`   description: ${uploadPayload.description}`);
    console.log(`   previewImageNft.mimetype: ${uploadPayload.previewImageNft.mimetype}`);
    console.log(`   previewImageNft.fileFromBase64: ${uploadPayload.previewImageNft.fileFromBase64.length} chars`);
    console.log(`   priceInLovelace: ${uploadPayload.priceInLovelace}`);
    console.log(`   isBlocked: ${uploadPayload.isBlocked}`);
    
    const payloadSize = JSON.stringify(uploadPayload).length;
    console.log(`   Total payload size: ${Math.round(payloadSize / 1024)}KB`);
    
    // Initialize client and upload
    console.log(`\n🚀 Attempting upload...`);
    const nmkrClient = new NmkrClient();
    
    try {
      const result = await nmkrClient.uploadNft(projectUid, uploadPayload);
      
      console.log(`\n✅ SUCCESS! NFT uploaded:`);
      console.log(`   NFT UID: ${result.nftUid}`);
      console.log(`   NFT ID: ${result.nftId}`);
      console.log(`   IPFS Hash: ${result.ipfsHashMainnft}`);
      console.log(`   Asset ID: ${result.assetId}`);
      
      return result;
      
    } catch (error) {
      console.log(`\n🔥 UPLOAD FAILED:`);
      console.log(`   Error: ${error.message}`);
      
      if (error.message.includes('406')) {
        console.log(`\n🔍 406 Error Analysis:`);
        console.log(`   - Endpoint exists (not 404)`);
        console.log(`   - Authentication works (not 401)`);
        console.log(`   - Request format issue (406 = Not Acceptable)`);
        console.log(`   - Likely: previewImageNft structure problem`);
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error(`❌ Debug failed:`, error.message);
    process.exit(1);
  }
}

debugSingleNft().catch(console.error);
