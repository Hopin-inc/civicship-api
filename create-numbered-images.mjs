import fs from 'fs';
import path from 'path';
import { ImageProcessor } from './dist/utils/imageProcessor.js';

async function createNumberedImages() {
  console.log('🖼️  Creating 100 numbered image files...\n');
  
  try {
    const sourcePath = '/home/ubuntu/attachments/cf75b426-81c5-4ed9-b00d-15510243bd9d/+2025-09-18+22.23.05.png';
    const outputDir = '/home/ubuntu/repos/civicship-api/numbered-images';
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`✅ Created output directory: ${outputDir}`);
    }
    
    // Verify source image exists
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source image not found: ${sourcePath}`);
    }
    
    console.log(`📋 Configuration:`);
    console.log(`Source Image: ${sourcePath}`);
    console.log(`Output Directory: ${outputDir}`);
    console.log(`Creating 100 numbered copies...\n`);
    
    // Read source image once
    const sourceBuffer = fs.readFileSync(sourcePath);
    console.log(`✅ Source image loaded (${Math.round(sourceBuffer.length / 1024)}KB)\n`);
    
    const results = { success: [], failed: [] };
    
    // Create 100 numbered copies
    for (let i = 1; i <= 100; i++) {
      try {
        const fileName = ImageProcessor.generateSequentialName(i);
        const outputPath = path.join(outputDir, fileName);
        
        // Copy the source image to the new numbered file
        fs.writeFileSync(outputPath, sourceBuffer);
        
        console.log(`✅ Created ${i}/100: ${fileName}`);
        results.success.push({
          index: i,
          fileName,
          path: outputPath
        });
        
      } catch (error) {
        const fileName = ImageProcessor.generateSequentialName(i);
        console.log(`🔥 Failed ${i}/100: ${fileName} -> ${error.message}`);
        results.failed.push({
          index: i,
          fileName,
          error: error.message
        });
      }
    }
    
    // Summary
    console.log('\n📊 IMAGE CREATION RESULTS\n');
    console.log(`✅ SUCCESSFUL IMAGES: ${results.success.length}/100`);
    console.log(`🔥 FAILED IMAGES: ${results.failed.length}/100`);
    console.log(`📁 OUTPUT DIRECTORY: ${outputDir}\n`);
    
    if (results.success.length > 0) {
      console.log('✅ CREATED IMAGES:');
      results.success.slice(0, 10).forEach(img => {
        console.log(`   ${img.fileName}`);
      });
      if (results.success.length > 10) {
        console.log(`   ... and ${results.success.length - 10} more`);
      }
    }
    
    if (results.failed.length > 0) {
      console.log('\n🔥 FAILED IMAGES:');
      results.failed.forEach(img => {
        console.log(`   ${img.fileName} -> ${img.error}`);
      });
    }
    
    console.log(`\n🎉 Image creation completed! ${results.success.length} successful, ${results.failed.length} failed.`);
    
  } catch (error) {
    console.error('❌ Image creation failed:', error);
    process.exit(1);
  }
}

createNumberedImages().catch(console.error);
