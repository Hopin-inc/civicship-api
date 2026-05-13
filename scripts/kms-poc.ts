import { KeyManagementServiceClient } from "@google-cloud/kms";

const client = new KeyManagementServiceClient();
const name = process.env.KMS_KEY_RESOURCE!;

(async () => {
  // (a) getPublicKey
  const [pub] = await client.getPublicKey({ name });
  console.log("[a] PEM length:", pub.pem?.length);
  console.log("[a] algorithm:", pub.algorithm);

  // (b) asymmetricSign (PureEdDSA)
  const msg = Buffer.from("civicship-poc-message", "utf8");
  const [sig] = await client.asymmetricSign({ name, data: msg });
  console.log("[b] signature byteLength:", sig.signature?.length);

  // (c) 64B raw 確認
  if (sig.signature?.length !== 64) {
    throw new Error(`expected 64B raw, got ${sig.signature?.length}`);
  }
  console.log("[c] ✓ 64B raw signature");

  // (d) payload size 上限
  for (const size of [1024, 16 * 1024, 64 * 1024]) {
    try {
      await client.asymmetricSign({ name, data: Buffer.alloc(size, 0x42) });
      console.log(`[d] ${size}B payload: OK`);
    } catch (e) {
      console.log(`[d] ${size}B payload: ${(e as Error).message}`);
    }
  }
})();
