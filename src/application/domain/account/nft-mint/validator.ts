import { InvalidReceiverAddressError, NetworkMismatchError } from "@/errors/graphql";
import { injectable } from "tsyringe";
import logger from "@/infrastructure/logging";

@injectable()
export default class NftMintValidator {
  validateReceiverAddress(receiver: string): void {
    if (!receiver.startsWith("addr_test") && !receiver.startsWith("addr1")) {
      logger.warn("NFT mint validation failed: invalid receiver address format", {
        receiver,
        expectedPrefixes: ["addr_test", "addr1"],
        validation: "receiver_address_format",
        timestamp: new Date().toISOString(),
      });
      throw new InvalidReceiverAddressError(receiver);
    }

    const networkId = process.env.CARDANO_NETWORK_ID || "0";
    const expected = networkId === "1" ? "mainnet" : "testnet";

    if (expected === "testnet" && !receiver.startsWith("addr_test")) {
      logger.warn("NFT mint validation failed: network mismatch", {
        receiver,
        expectedNetwork: "testnet",
        actualPrefix: receiver.substring(0, 9),
        validation: "network_mismatch",
        timestamp: new Date().toISOString(),
      });
      throw new NetworkMismatchError(receiver, "testnet");
    }

    if (expected === "mainnet" && !receiver.startsWith("addr1")) {
      logger.warn("NFT mint validation failed: network mismatch", {
        receiver,
        expectedNetwork: "mainnet",
        actualPrefix: receiver.substring(0, 5),
        validation: "network_mismatch",
        timestamp: new Date().toISOString(),
      });
      throw new NetworkMismatchError(receiver, "mainnet");
    }
  }

  // async validateProductKey(productKey: string): Promise<void> {
  //   const pattern = /^[a-z0-9-]{1,24}$/;
  //   if (!pattern.test(productKey)) {
  //     logger.warn("NFT mint validation failed: invalid product key", {
  //       productKey,
  //       pattern: pattern.source,
  //     });
  //     throw new InvalidProductKeyError(productKey);
  //   }
  // }

  // async validateAssetNameLength(assetName: string): Promise<void> {
  //   const bytes = Buffer.byteLength(assetName, "utf8");
  //   if (bytes > 32) {
  //     throw new AssetNameTooLongError(assetName, bytes);
  //   }
  // }
}
