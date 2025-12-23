import { PrismaClientIssuer } from "../../src/infrastructure/prisma/client";
import NFTWalletService from "../../src/application/domain/account/nft-wallet/service";
import logger from "../../src/infrastructure/logging";
import { auth } from "../../src/infrastructure/libs/firebase";
import { IContext } from "../../src/types/server";
import { InputRecord, WalletResult } from "./types";

async function findOrCreateUserByFirebaseUid(
  issuer: PrismaClientIssuer,
  firebaseUid: string,
): Promise<{ id: string; isConfirmed: boolean }> {
  return await issuer.internal(async (tx) => {
    const existingIdentity = await tx.identity.findFirst({
      where: { uid: firebaseUid },
      include: { user: true },
    });

    if (existingIdentity?.user) {
      const isConfirmed = existingIdentity.refreshToken !== null;
      logger.debug(`Found existing user for Firebase UID`, {
        firebaseUid,
        userId: existingIdentity.user.id,
        isConfirmed,
      });
      return { id: existingIdentity.user.id, isConfirmed };
    }

    logger.debug(`Creating new user for Firebase UID`, { firebaseUid });
    const newUser = await tx.user.create({
      data: {
        name: "名前未設定",
        slug: "名前未設定",
        currentPrefecture: "UNKNOWN",
        identities: {
          create: [
            {
              uid: firebaseUid,
              platform: "PHONE",
            },
          ],
        },
      },
    });

    return { id: newUser.id, isConfirmed: false };
  });
}

export async function processRecord(
  ctx: IContext,
  issuer: PrismaClientIssuer,
  nftWalletService: NFTWalletService,
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

  const { id: userId, isConfirmed } = await findOrCreateUserByFirebaseUid(issuer, firebaseUid);

  let wallet;
  try {
    wallet = await nftWalletService.ensureNmkrWallet(ctx, userId);
    logger.debug(`Wallet ensured`, {
      userId,
      walletAddress: wallet.walletAddress,
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
      firebaseUid,
      error: errorMessage,
    };
  }

  logger.info(`Successfully processed`, {
    phoneNumber: record.phoneNumber,
    nftSequence: record.nftSequence,
    walletAddress: wallet.walletAddress,
    isConfirmed,
  });

  return {
    kind: "success",
    phoneNumber: record.phoneNumber,
    nftSequence: record.nftSequence,
    walletAddress: wallet.walletAddress,
    firebaseUid,
    userId,
    isConfirmed,
  };
}
