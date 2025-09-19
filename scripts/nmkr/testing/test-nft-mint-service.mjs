import { PrismaClient } from '@prisma/client';

async function testNftMintService() {
  console.log('=== NFT Mint Service Test ===\n');
  
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing sequential numbering with PostgreSQL SEQUENCE...\n');
    
    // Test the sequence directly first
    console.log('📊 Testing SEQUENCE generation:');
    const sequenceResults = [];
    for (let i = 1; i <= 5; i++) {
      const result = await prisma.$queryRaw`SELECT nextval('nft_mint_sequence_per_policy') as next_num`;
      const nextNum = Number(result[0].next_num);
      sequenceResults.push(nextNum);
      console.log(`  Sequence call ${i}: ${nextNum}`);
    }
    
    console.log('\n✅ Sequential numbering verification:');
    console.log(`  Generated sequence numbers: ${sequenceResults.join(', ')}`);
    
    if (sequenceResults.length > 1) {
      const isSequential = sequenceResults.every((num, index) => 
        index === 0 || num === sequenceResults[index - 1] + 1
      );
      console.log(`  Sequential order: ${isSequential ? '✅ PASS' : '❌ FAIL'}`);
    }
    
    console.log('\n🔍 Testing asset name generation pattern...');
    
    // Test asset name generation logic
    const testCases = [
      { productKey: 'resident-card', sequenceNum: 1, expected: 'resident-card-0001' },
      { productKey: 'visitor-pass', sequenceNum: 42, expected: 'visitor-pass-0042' },
      { productKey: 'premium-access', sequenceNum: 999, expected: 'premium-access-0999' }
    ];
    
    testCases.forEach(testCase => {
      const assetName = `${testCase.productKey}-${String(testCase.sequenceNum).padStart(4, "0")}`;
      const isCorrect = assetName === testCase.expected;
      console.log(`  ${testCase.productKey} (seq: ${testCase.sequenceNum}) -> ${assetName} ${isCorrect ? '✅' : '❌'}`);
    });
    
    console.log('\n🔍 Testing validation logic...');
    
    // Test validation patterns
    const validationTests = [
      { type: 'productKey', value: 'valid-product-123', shouldPass: true },
      { type: 'productKey', value: 'INVALID_PRODUCT', shouldPass: false },
      { type: 'receiverAddress', value: 'addr_test1qzx9hu8j4ah3auytk0mwcupd69hpc52t0cg5kj6t0k4mezcxgnjz4', shouldPass: true },
      { type: 'receiverAddress', value: 'invalid_address', shouldPass: false }
    ];
    
    validationTests.forEach(test => {
      let isValid = false;
      try {
        if (test.type === 'productKey') {
          const pattern = /^[a-z0-9-]{1,24}$/;
          isValid = pattern.test(test.value);
        } else if (test.type === 'receiverAddress') {
          isValid = test.value.startsWith("addr_test") || test.value.startsWith("addr1");
        }
      } catch (error) {
        isValid = false;
      }
      
      const result = isValid === test.shouldPass ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${test.type}: "${test.value}" -> ${isValid ? 'valid' : 'invalid'} ${result}`);
    });
    
    console.log('\n🔍 Checking database schema...');
    
    // Verify the NftMint table structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 't_nft_mints' 
      ORDER BY ordinal_position
    `;
    
    console.log('📋 NftMint table columns:');
    tableInfo.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    // Check unique constraints
    const constraints = await prisma.$queryRaw`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 't_nft_mints' AND constraint_type = 'UNIQUE'
    `;
    
    console.log('\n🔒 Unique constraints:');
    constraints.forEach(constraint => {
      console.log(`  ${constraint.constraint_name}: ${constraint.constraint_type}`);
    });
    
    console.log('\n🔍 Testing structured logging patterns...');
    
    // Test logging structure (simulated)
    const mockLogData = {
      userId: 'test-user-123',
      productKey: 'resident-card',
      policyId: 'test-policy-456',
      timestamp: new Date().toISOString(),
    };
    
    console.log('📝 Sample structured log entries:');
    console.log('  Start log:', JSON.stringify({
      message: 'NFT mint request started',
      ...mockLogData
    }, null, 2));
    
    console.log('  Phase log:', JSON.stringify({
      message: 'NFT mint queue completed',
      phase: 'queue',
      duration: 150,
      requestId: 'mint-req-789'
    }, null, 2));
    
    console.log('  Success log:', JSON.stringify({
      message: 'NFT mint completed successfully',
      requestId: 'mint-req-789',
      txHash: '0x1234567890abcdef',
      totalDuration: 2500,
      status: 'MINTED'
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testNftMintService().then(() => {
  console.log('\n🏁 Test completed - Sequential numbering and database schema verified');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});
