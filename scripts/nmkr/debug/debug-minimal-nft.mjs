import 'reflect-metadata';
import { NmkrClient } from './dist/infrastructure/libs/nmkr/index.js';
import fs from 'fs';

async function debugMinimalNft() {
  console.log('🔍 Testing minimal NFT upload payload...\n');
  
  try {
    if (!process.env.NMKR_API_KEY) {
      throw new Error('NMKR_API_KEY environment variable is required');
    }
    
    const projectUid = process.env.NMKR_PROJECT_UID || '078b2532-716a-4dac-b135-b43e2f042185';
    
    // Create a tiny test image in Base64
    console.log('🖼️  Creating minimal test image...');
    const tinyImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    console.log(`   Tiny image Base64: ${tinyImageBase64}`);
    console.log(`   Length: ${tinyImageBase64.length} characters\n`);
    
    const nmkrClient = new NmkrClient();
    
    // Test 1: Absolute minimal payload
    console.log('🧪 Test 1: Absolute minimal payload');
    try {
      const minimalPayload = {
        previewImageNft: {
          mimetype: 'image/png',
          fileFromBase64: tinyImageBase64
        }
      };
      
      console.log('   Payload:', JSON.stringify(minimalPayload, null, 2));
      const result1 = await nmkrClient.uploadNft(projectUid, minimalPayload);
      console.log('   ✅ SUCCESS with minimal payload!');
      console.log('   Result:', result1);
      
    } catch (error) {
      console.log(`   🔥 FAILED: ${error.message}`);
    }
    
    // Test 2: Add tokenname only
    console.log('\n🧪 Test 2: Add tokenname');
    try {
      const tokenPayload = {
        tokenname: 'minimal-test',
        previewImageNft: {
          mimetype: 'image/png',
          fileFromBase64: tinyImageBase64
        }
      };
      
      console.log('   Payload:', JSON.stringify(tokenPayload, null, 2));
      const result2 = await nmkrClient.uploadNft(projectUid, tokenPayload);
      console.log('   ✅ SUCCESS with tokenname!');
      console.log('   Result:', result2);
      
    } catch (error) {
      console.log(`   🔥 FAILED: ${error.message}`);
    }
    
    // Test 3: Try different field name variations
    console.log('\n🧪 Test 3: Try field name variations');
    const variations = [
      { name: 'previewImageNft', field: 'previewImageNft' },
      { name: 'previewimage', field: 'previewimage' },
      { name: 'PreviewImageNft', field: 'PreviewImageNft' },
      { name: 'previewImage', field: 'previewImage' }
    ];
    
    for (const variation of variations) {
      try {
        const varPayload = {
          tokenname: `test-${variation.name}`,
          [variation.field]: {
            mimetype: 'image/png',
            fileFromBase64: tinyImageBase64
          }
        };
        
        console.log(`   Testing field name: ${variation.field}`);
        const result = await nmkrClient.uploadNft(projectUid, varPayload);
        console.log(`   ✅ SUCCESS with ${variation.field}!`);
        console.log('   Result:', result);
        break;
        
      } catch (error) {
        console.log(`   🔥 ${variation.field}: ${error.message}`);
      }
    }
    
    // Test 4: Try without Base64 prefix
    console.log('\n🧪 Test 4: Test Base64 format variations');
    const base64Variations = [
      { name: 'raw', data: tinyImageBase64 },
      { name: 'with-prefix', data: `data:image/png;base64,${tinyImageBase64}` }
    ];
    
    for (const variation of base64Variations) {
      try {
        const b64Payload = {
          tokenname: `test-${variation.name}`,
          previewImageNft: {
            mimetype: 'image/png',
            fileFromBase64: variation.data
          }
        };
        
        console.log(`   Testing Base64 format: ${variation.name}`);
        const result = await nmkrClient.uploadNft(projectUid, b64Payload);
        console.log(`   ✅ SUCCESS with ${variation.name}!`);
        console.log('   Result:', result);
        break;
        
      } catch (error) {
        console.log(`   🔥 ${variation.name}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Debug failed:`, error.message);
    process.exit(1);
  }
}

debugMinimalNft().catch(console.error);
