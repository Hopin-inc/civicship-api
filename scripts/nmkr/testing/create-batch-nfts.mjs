import 'reflect-metadata';
import { NmkrClient } from './dist/infrastructure/libs/nmkr/index.js';
import { ImageProcessor } from './dist/utils/imageProcessor.js';
import pLimit from 'p-limit';
import fs from 'fs';

async function createBatchNfts() {
  console.log('🚀 Starting batch NFT creation...\n');
  
  try {
    // Check environment variables
    if (!process.env.NMKR_API_KEY) {
      throw new Error('NMKR_API_KEY environment variable is required');
    }
    
    const projectUid = process.env.NMKR_PROJECT_UID || '078b2532-716a-4dac-b135-b43e2f042185';
    const imagePath = '/home/ubuntu/attachments/cf75b426-81c5-4ed9-b00d-15510243bd9d/+2025-09-18+22.23.05.png';
    
    console.log(`📋 Configuration:`);
    console.log(`Project UID: ${projectUid}`);
    console.log(`Source Image: ${imagePath}`);
    console.log(`Environment: ${process.env.NMKR_BASE_URL?.includes('preprod') ? 'TESTNET' : 'MAINNET'}\n`);
    
    // Verify image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Source image not found: ${imagePath}`);
    }
    
    // Initialize NMKR client
    const nmkrClient = new NmkrClient();
    console.log('✅ NMKR Client initialized\n');
    
    // Convert image to Base64 once (reuse for all NFTs)
    console.log('🖼️  Converting image to Base64...');
    const imageBase64 = await ImageProcessor.convertImageToBase64(imagePath);
    const mimeType = ImageProcessor.getMimeType(imagePath);
    console.log(`✅ Image converted (${Math.round(imageBase64.length / 1024)}KB)\n`);
    
    // Create concurrency limiter (max 3 concurrent uploads to avoid rate limiting)
    const limit = pLimit(3);
    const results = { success: [], failed: [] };
    
    // Create array of upload tasks
    const uploadTasks = [];
    for (let i = 1; i <= 100; i++) {
      const task = limit(async () => {
        const tokenName = ImageProcessor.generateSequentialName(i);
        const displayName = `Landscape NFT #${i.toString().padStart(3, '0')}`;
        const description = `Beautiful landscape NFT number ${i} of 100 in the collection`;
        
        try {
          console.log(`🔄 Uploading NFT ${i}/100: ${tokenName}`);
          
          const uploadPayload = {
            tokenname: tokenName,
            previewImageNft: {
              mimetype: mimeType,
              fileFromBase64: imageBase64
            }
          };
          
          const result = await nmkrClient.uploadNft(projectUid, uploadPayload);
          
          console.log(`✅ Success ${i}/100: ${tokenName} -> NFT UID: ${result.nftUid}`);
          results.success.push({
            index: i,
            tokenName,
            nftUid: result.nftUid,
            ipfsHash: result.ipfsHashMainnft
          });
          
          return result;
        } catch (error) {
          console.log(`🔥 Failed ${i}/100: ${tokenName} -> ${error.message}`);
          results.failed.push({
            index: i,
            tokenName,
            error: error.message
          });
          throw error;
        }
      });
      
      uploadTasks.push(task);
    }
    
    // Execute all upload tasks with progress tracking
    console.log('🚀 Starting batch upload (max 3 concurrent)...\n');
    const startTime = Date.now();
    
    await Promise.allSettled(uploadTasks);
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    // Summary
    console.log('\n📊 BATCH NFT CREATION RESULTS\n');
    console.log(`✅ SUCCESSFUL UPLOADS: ${results.success.length}/100`);
    console.log(`🔥 FAILED UPLOADS: ${results.failed.length}/100`);
    console.log(`⏱️  TOTAL TIME: ${duration} seconds\n`);
    
    if (results.success.length > 0) {
      console.log('✅ SUCCESSFUL NFTs:');
      results.success.forEach(nft => {
        console.log(`   ${nft.tokenName} -> ${nft.nftUid} (IPFS: ${nft.ipfsHash?.substring(0, 12)}...)`);
      });
    }
    
    if (results.failed.length > 0) {
      console.log('\n🔥 FAILED NFTs:');
      results.failed.forEach(nft => {
        console.log(`   ${nft.tokenName} -> ${nft.error}`);
      });
    }
    
    console.log(`\n🎉 Batch NFT creation completed! ${results.success.length} successful, ${results.failed.length} failed.`);
    
  } catch (error) {
    console.error('❌ Batch creation failed:', error);
    process.exit(1);
  }
}

createBatchNfts().catch(console.error);
