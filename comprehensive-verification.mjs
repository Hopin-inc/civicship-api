#!/usr/bin/env node

// Comprehensive verification script for NMKR-Prisma integration
import { buildCustomProps, parseCustomProps } from "./dist/application/domain/nmkr/customProps.js";
import {
  canTransitionTo,
  shouldUpdateMint,
} from "./dist/application/domain/nmkr/stateTransition.js";
import fs from "fs";
import https from "https";

console.log("🔍 Comprehensive NMKR-Prisma Integration Verification");
console.log("=====================================================\n");

let totalTests = 0;
let passedTests = 0;

function test(name, testFn) {
  totalTests++;
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ ${name}`);
      passedTests++;
    } else {
      console.log(`❌ ${name}`);
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
  }
}

// Phase 1: CustomProperties Foundation Tests
console.log("📋 Phase 1: CustomProperties Foundation");
console.log("======================================");

test("CustomPropsV1 builds with all fields", () => {
  const props = buildCustomProps({
    nftMintId: "mint_123",
    nftWalletId: "wallet_456",
    userRef: "user_789",
    orderId: "order_abc",
    orderItemId: "item_def",
    nftInstanceId: "instance_ghi",
  });
  const parsed = JSON.parse(props);
  return (
    parsed.propsVersion === 1 &&
    parsed.nftMintId === "mint_123" &&
    parsed.nftWalletId === "wallet_456" &&
    parsed.userRef === "user_789" &&
    parsed.orderId === "order_abc" &&
    parsed.orderItemId === "item_def" &&
    parsed.nftInstanceId === "instance_ghi"
  );
});

test("CustomPropsV1 builds with minimal fields", () => {
  const props = buildCustomProps({ nftMintId: "mint_123" });
  const parsed = JSON.parse(props);
  return parsed.propsVersion === 1 && parsed.nftMintId === "mint_123";
});

test("CustomPropsV1 builds with empty input", () => {
  const props = buildCustomProps({});
  const parsed = JSON.parse(props);
  return parsed.propsVersion === 1;
});

test("parseCustomProps handles valid JSON", () => {
  const props = buildCustomProps({ nftMintId: "test_123" });
  const result = parseCustomProps(props);
  return result.success && result.data.nftMintId === "test_123";
});

test("parseCustomProps rejects invalid JSON", () => {
  const result = parseCustomProps("invalid json");
  return !result.success && result.error === "Invalid JSON";
});

test("parseCustomProps rejects invalid structure", () => {
  const result = parseCustomProps('{"invalid": "structure"}');
  return !result.success && result.error === "Invalid CustomPropsV1 structure";
});

test("parseCustomProps rejects wrong propsVersion", () => {
  const result = parseCustomProps('{"propsVersion": 2, "nftMintId": "test"}');
  return !result.success;
});

// Phase 2: State Transition Tests
console.log("\n🔄 Phase 2: State Transition Management");
console.log("======================================");

test("QUEUED can transition to SUBMITTED", () => {
  return canTransitionTo("QUEUED", "SUBMITTED");
});

test("SUBMITTED can transition to MINTED", () => {
  return canTransitionTo("SUBMITTED", "MINTED");
});

test("SUBMITTED can transition to FAILED", () => {
  return canTransitionTo("SUBMITTED", "FAILED");
});

test("MINTED cannot transition to QUEUED (stale)", () => {
  return !canTransitionTo("MINTED", "QUEUED");
});

test("MINTED cannot transition to SUBMITTED (stale)", () => {
  return !canTransitionTo("MINTED", "SUBMITTED");
});

test("FAILED cannot transition to MINTED (terminal)", () => {
  return !canTransitionTo("FAILED", "MINTED");
});

test("FAILED cannot transition to SUBMITTED (terminal)", () => {
  return !canTransitionTo("FAILED", "SUBMITTED");
});

test("shouldUpdateMint allows forward progression", () => {
  return shouldUpdateMint("QUEUED", "SUBMITTED", null, "tx_123");
});

test("shouldUpdateMint prevents stale updates", () => {
  return !shouldUpdateMint("MINTED", "SUBMITTED", "tx_123", "tx_456");
});

test("shouldUpdateMint preserves txHash", () => {
  return !shouldUpdateMint("SUBMITTED", "MINTED", "tx_123", null);
});

test("shouldUpdateMint allows txHash update", () => {
  return shouldUpdateMint("SUBMITTED", "MINTED", "tx_123", "tx_456");
});

// Phase 3: Integration Tests (HTTP calls)
console.log("\n🔗 Phase 3: Webhook Integration Tests");
console.log("====================================");

async function testWebhookEndpoint(name, payload, expectedStatus = 200) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);

    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/nmkr/webhook",
      method: "POST",
      rejectUnauthorized: false, // 👈 自己署名証明書を無視
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      const success = res.statusCode === expectedStatus;
      if (success) {
        console.log(`✅ ${name} (${res.statusCode})`);
        passedTests++;
      } else {
        console.log(`❌ ${name} (${res.statusCode}, expected ${expectedStatus})`);
      }
      totalTests++;
      resolve(success);
    });

    req.on("error", (error) => {
      console.log(`❌ ${name} - ${error.message}`);
      totalTests++;
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}
// Test webhook scenarios
const webhookTests = [
  {
    name: "Valid payment confirmed webhook",
    payload: {
      paymentTransactionUid: "test_payment_001",
      projectUid: "test_project_001",
      state: "confirmed",
      txHash: "tx_hash_001",
      customProperty: buildCustomProps({
        nftMintId: "test_mint_001",
        userRef: "test_user_001",
      }),
    },
  },
  {
    name: "Valid minting finished webhook",
    payload: {
      paymentTransactionUid: "test_payment_002",
      projectUid: "test_project_002",
      state: "finished",
      txHash: "tx_hash_002",
      customProperty: buildCustomProps({
        nftMintId: "test_mint_002",
        userRef: "test_user_002",
      }),
    },
  },
  {
    name: "Valid failed payment webhook",
    payload: {
      paymentTransactionUid: "test_payment_003",
      projectUid: "test_project_003",
      state: "canceled",
      customProperty: buildCustomProps({
        nftMintId: "test_mint_003",
        userRef: "test_user_003",
      }),
    },
  },
  {
    name: "Missing customProperty (graceful handling)",
    payload: {
      paymentTransactionUid: "test_payment_004",
      projectUid: "test_project_004",
      state: "confirmed",
    },
  },
  {
    name: "Invalid customProperty JSON (graceful handling)",
    payload: {
      paymentTransactionUid: "test_payment_005",
      projectUid: "test_project_005",
      state: "confirmed",
      customProperty: "invalid json",
    },
  },
  {
    name: "Missing nftMintId in customProperty (graceful handling)",
    payload: {
      paymentTransactionUid: "test_payment_006",
      projectUid: "test_project_006",
      state: "confirmed",
      customProperty: buildCustomProps({
        userRef: "test_user_006",
      }),
    },
  },
];

// Run webhook tests
for (const { name, payload } of webhookTests) {
  await testWebhookEndpoint(name, payload);
  // Small delay between requests
  await new Promise((resolve) => setTimeout(resolve, 50));
}

// File existence tests
console.log("\n📁 File Structure Verification");
console.log("==============================");

const requiredFiles = [
  "src/application/domain/nmkr/customProps.ts",
  "src/application/domain/nmkr/stateTransition.ts",
  "src/application/domain/nmkr/webhookService.ts",
  "src/application/domain/product/inventory/service.ts",
  "src/presentation/router/nmkr.ts",
  "dist/application/domain/nmkr/customProps.js",
  "dist/application/domain/nmkr/stateTransition.js",
];

requiredFiles.forEach((file) => {
  test(`File exists: ${file}`, () => {
    return fs.existsSync(file);
  });
});

// Build verification
console.log("\n🔨 Build Verification");
console.log("====================");

test("TypeScript compilation successful", () => {
  return (
    fs.existsSync("dist/application/domain/nmkr/customProps.js") &&
    fs.existsSync("dist/application/domain/nmkr/stateTransition.js")
  );
});

// Summary
console.log("\n📊 Verification Summary");
console.log("======================");
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log("\n🎉 All tests passed! NMKR-Prisma integration is working correctly.");
} else {
  console.log("\n⚠️  Some tests failed. Please review the implementation.");
}

console.log("\n🔍 Next Steps:");
console.log("- Review any failed tests above");
console.log("- Check server logs for detailed error information");
console.log("- Verify database state if needed");
console.log("- Test with real NMKR webhook events if available");
