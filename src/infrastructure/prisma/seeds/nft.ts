import { prismaClient } from "../client";
import type { User } from "@prisma/client";

// Helper functions for deterministic values
const externalAddress = (index: number) => `0x${index.toString(16).padStart(40, "0")}`;
const internalAddress = (userId: string) => `cs-internal-${userId}`;
const assetNameHex = (index: number) => (0x434f4f4c4e4654 + index).toString(16).toUpperCase();
const ethImageUrl = (index: number) => `https://picsum.photos/seed/civicship-eth-${index}/800/450`;
const adaImageUrl = (index: number) => `https://picsum.photos/seed/civicship-ada-${index}/800/450`;
const ada721Json = (policyId: string, assetHex: string, name: string) => ({
  "721": {
    [policyId]: {
      [assetHex]: { name },
    },
  },
});

export async function seedNfts(users: User[]) {
  const ETH_TOKEN_ID = "tok_eth_1";
  const ADA_TOKEN_ID = "tok_ada_1";
  const ADA_POLICY_ID = "aabbccddeeff00112233445566778899aabbccddeeff001122334455";

  await prismaClient.$transaction([
    // Create NFT tokens
    prismaClient.nftToken.createMany({
      data: [
        {
          id: ETH_TOKEN_ID,
          address: "0x0000000000000000000000000000000000000000",
          type: "ERC-721",
          name: "Local ETH NFT",
          symbol: "LNFT",
          json: {},
        },
        {
          id: ADA_TOKEN_ID,
          address: ADA_POLICY_ID,
          type: "CIP-25",
          name: "Local ADA NFT",
          symbol: "LANFT",
          json: {},
        },
      ],
      skipDuplicates: true,
    }),

    // Create NFT wallets (2 per user: EXTERNAL + INTERNAL)
    prismaClient.nftWallet.createMany({
      data: users.flatMap((user, i) => {
        const userIndex = i + 1;
        return [
          {
            id: `nft_wallet_ext_${userIndex}`,
            type: "EXTERNAL",
            walletAddress: externalAddress(userIndex),
            userId: user.id,
          },
          {
            id: `nft_wallet_int_${userIndex}`,
            type: "INTERNAL",
            walletAddress: internalAddress(user.id),
            userId: user.id,
          },
        ];
      }),
      skipDuplicates: true,
    }),

    // Create NFT instances (2 per user + 1 policy-only)
    prismaClient.nftInstance.createMany({
      data: [
        ...users.flatMap((user, i) => {
          const userIndex = i + 1;
          return [
            {
              id: `ins_eth_${userIndex}`,
              instanceId: `local-eth-${userIndex}`,
              name: `Local ETH NFT #${userIndex}`,
              description: `For local test - User ${userIndex}`,
              imageUrl: ethImageUrl(userIndex),
              json: {},
              nftTokenId: ETH_TOKEN_ID,
              nftWalletId: `nft_wallet_ext_${userIndex}`,
              status: "OWNED",
            },
            {
              id: `ins_ada_${userIndex}`,
              instanceId: `local-ada-${userIndex}`,
              name: `Local ADA NFT #${userIndex}`,
              description: `For local test - User ${userIndex}`,
              imageUrl: adaImageUrl(userIndex),
              json: ada721Json(ADA_POLICY_ID, assetNameHex(i), `COOLNFT${userIndex}`),
              nftTokenId: ADA_TOKEN_ID,
              nftWalletId: `nft_wallet_int_${userIndex}`,
              status: "OWNED",
            },
          ];
        }),
        {
          id: "ins_ada_policy",
          instanceId: "local-ada-policy",
          name: "Local ADA NFT (Policy Only)",
          description: "For local test - Policy page demo",
          imageUrl: "https://picsum.photos/seed/civicship-ada-policy/800/450",
          json: {},
          nftTokenId: ADA_TOKEN_ID,
          status: "STOCK",
        },
      ],
      skipDuplicates: true,
    }),
  ]);
}
