import { PrismaClientIssuer } from "../../src/infrastructure/prisma/client";
import logger from "../../src/infrastructure/logging";
import { auth } from "../../src/infrastructure/libs/firebase";
import { InputRecord, WalletResult } from "./types";
import { getFirebaseIdTokenForUid } from "./firebaseTokenHelper";
import { CardanoShopifyAppClient } from "../../src/infrastructure/libs/cardanoShopifyApp/api/client";

async function findExistingUserByFirebaseUid(
  issuer: PrismaClientIssuer,
  firebaseUid: string,
): Promise<{ id: string } | null> {
  return await issuer.internal(async (tx) => {
    const existingIdentity = await tx.identity.findFirst({
      where: { uid: firebaseUid },
      include: { user: true },
    });

    if (existingIdentity?.user) {
      logger.debug(`Found existing user for Firebase UID`, {
        firebaseUid,
        userId: existingIdentity.user.id,
      });
      return { id: existingIdentity.user.id };
    }

    return null;
  });
}

export async function processRecord(
  issuer: PrismaClientIssuer,
  cardanoShopifyAppClient: CardanoShopifyAppClient,
  record: InputRecord,
): Promise<WalletResult> {
  logger.debug(`Processing record`, {
    phoneNumber: record.phoneNumber,
    nftSequence: record.nftSequence,
  });

  let firebaseUid: string;
  try {
    const userRecord = await auth.getUserByPhoneNumber(record.phoneNumber);
    firebaseUid = userRecord.uid;
    logger.debug(`Found Firebase user`, {
      phoneNumber: record.phoneNumber,
      firebaseUid,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.warn(`Firebase user not found for phone number`, {
      phoneNumber: record.phoneNumber,
      error: errorMessage,
    });
    return {
      kind: "firebaseNotFound",
      phoneNumber: record.phoneNumber,
      nftSequence: record.nftSequence,
      name: record.name,
      error: errorMessage,
    };
  }

  const existingUser = await findExistingUserByFirebaseUid(issuer, firebaseUid);
  if (!existingUser) {
    logger.warn(`Civicship user not found for Firebase UID`, {
      phoneNumber: record.phoneNumber,
      firebaseUid,
    });
    return {
      kind: "userNotFound",
      phoneNumber: record.phoneNumber,
      nftSequence: record.nftSequence,
      name: record.name,
      firebaseUid,
    };
  }

  let walletAddress: string;
  try {
    const idToken = await getFirebaseIdTokenForUid(firebaseUid);
    const response = await cardanoShopifyAppClient.getOrCreateAddress(idToken);
    walletAddress = response.address;
    logger.debug(`Wallet address obtained from CardanoShopifyApp`, {
      firebaseUid,
      walletAddress,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error(`Wallet creation failed`, {
      phoneNumber: record.phoneNumber,
      firebaseUid,
      error: errorMessage,
    });
    return {
      kind: "walletCreationFailed",
      phoneNumber: record.phoneNumber,
      nftSequence: record.nftSequence,
      name: record.name,
      firebaseUid,
      error: errorMessage,
    };
  }

  logger.info(`Successfully processed`, {
    phoneNumber: record.phoneNumber,
    nftSequence: record.nftSequence,
    walletAddress,
  });

  return {
    kind: "success",
    phoneNumber: record.phoneNumber,
    nftSequence: record.nftSequence,
    name: record.name,
    walletAddress,
    firebaseUid,
  };
}
