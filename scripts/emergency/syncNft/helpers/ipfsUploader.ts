import { storage, gcsBucketName } from "../../../../src/infrastructure/libs/storage";
import logger from "../../../../src/infrastructure/logging";

const IPFS_GATEWAY_URL = process.env.IPFS_GATEWAY_URL || "https://ipfs.io/ipfs/";
const IPFS_TIMEOUT_MS = 60000;

export async function uploadIpfsImageToGcs(
  ipfsUrl: string,
  policyId: string,
  assetNameHex: string,
): Promise<string> {
  if (!ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl;
  }

  const cid = ipfsUrl.replace("ipfs://", "");
  const gatewayUrl = `${IPFS_GATEWAY_URL}${cid}`;

  logger.debug(`Downloading image from IPFS gateway`, { ipfsUrl, gatewayUrl });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), IPFS_TIMEOUT_MS);

  try {
    const response = await fetch(gatewayUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`IPFS gateway returned ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await response.arrayBuffer());

    const ext = getExtensionFromContentType(contentType);
    const gcsPath = `nft/cardano/${policyId}/${assetNameHex}${ext}`;

    logger.debug(`Uploading image to GCS`, { gcsPath, contentType, size: buffer.length });

    const file = storage.bucket(gcsBucketName).file(gcsPath);
    await file.save(buffer, {
      metadata: { contentType },
      resumable: false,
    });

    const gcsUrl = `https://storage.googleapis.com/${gcsBucketName}/${gcsPath}`;
    logger.info(`Successfully uploaded IPFS image to GCS`, { ipfsUrl, gcsUrl });

    return gcsUrl;
  } catch (err) {
    clearTimeout(timeoutId);
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to upload IPFS image to GCS`, { ipfsUrl, error: errorMessage });
    throw new Error(`Failed to download/upload IPFS image: ${errorMessage}`);
  }
}

function getExtensionFromContentType(contentType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
  };
  return mimeToExt[contentType] || ".jpg";
}
