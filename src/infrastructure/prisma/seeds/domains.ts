import {
  CommunityConfigFactory,
  CommunityFactory,
  ImageFactory,
  MembershipFactory,
  NftInstanceFactory,
  NftTokenFactory,
  NftWalletFactory,
  OpportunityFactory,
  OpportunitySlotFactory,
  ParticipationFactory,
  PlaceFactory,
  ReservationFactory,
  UserFactory,
  WalletFactory,
} from "@/infrastructure/prisma/factories/factory";
import { prismaClient } from "@/infrastructure/prisma/client";
import { processInBatches } from "@/utils/array";
import {
  NftInstanceStatus,
  NftWalletType,
  Opportunity,
  OpportunitySlot,
  Place,
  Reservation,
  ReservationStatus,
  User,
} from "@prisma/client";
import { Community } from "@prisma/client/index.d";
import {
  GqlOpportunitySlotHostingStatus,
  GqlParticipationStatus,
  GqlReservationStatus,
} from "@/types/graphql";

const BATCH_SIZE = 10;
const NUM_SLOTS_PER_OPPORTUNITY = 2;
const NUM_RESERVATIONS_PER_SLOT = 1;
// const NUM_TRANSACTIONS = 5;
const NUM_PLACES = 10;
const NUM_USERS = 5;
const NUM_IMAGE_POOL = 10;

function pickRandomImage(images: { id: string }[]) {
  return images[Math.floor(Math.random() * images.length)];
}

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

export async function seedUsecase() {
  // await prismaClient.opportunity.updateMany({
  //   where: {},
  //   data: {
  //     createdBy: "cmb4vm7d9001i8z93s953arpl",
  //   },
  // });
  //
  // return;

  console.info("🔥 Resetting DB...");
  await prismaClient.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`
      TRUNCATE TABLE
        t_evaluation_histories,
        t_evaluations,
        t_images,
        t_participation_status_histories,
        t_participations,
        t_reservation_histories,
        t_reservations,
        t_opportunity_slots,
        t_opportunities,
        t_ticket_status_histories,
        t_tickets,
        t_utilities,
        t_transactions,
        t_wallets,
        t_nft_wallets,
        t_nft_instances,
        t_nft_tokens,
        t_membership_histories,
        t_memberships,
        t_articles,
        t_places,
        t_users,
        t_communities
      RESTART IDENTITY CASCADE;
    `);
  });

  console.info("🖼️  Creating image pool...");
  const imagePool = await ImageFactory.createList(NUM_IMAGE_POOL);

  console.info("🧱 Creating base User, Community, Wallet, Membership...");
  const { users, community } = await createBaseEntitiesForUsers(imagePool);

  console.info("📍 Creating Places...");
  const places = await createPlaces(community, imagePool);

  console.info("📣 Creating Opportunities...");
  const opportunities = await createOpportunities(users, community, places, imagePool);

  console.info("🧩 Creating Slots, Reservations, Participations, Evaluations, and Articles...");
  await createNestedEntities(users, community, opportunities, imagePool);

  // console.info("💸 Creating Transactions...");
  // await createTransactions(wallets);

  console.info("🎨 Creating NFTs (tokens, instances, wallets)...");
  await createNfts(users);

  console.info("🎉 All seeding steps completed!");
}

// STEP 1
async function createBaseEntitiesForUsers(imagePool: { id: string }[]) {
  const community = await CommunityFactory.create({ id: "neo88" });
  await CommunityConfigFactory.create({ transientCommunity: community });

  const users: User[] = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const user = await UserFactory.create({
      transientImage: pickRandomImage(imagePool),
    });
    users.push(user);
  }

  const membershipsAndWallets = await processInBatches(users, BATCH_SIZE, async (user) => {
    const wallet = await WalletFactory.create({
      transientUser: user,
      transientCommunity: community,
    });
    await MembershipFactory.create({ transientUser: user, transientCommunity: community });
    return { user, wallet };
  });

  return {
    community,
    users: membershipsAndWallets.map((mw) => mw.user),
    wallets: membershipsAndWallets.map((mw) => mw.wallet),
  };
}

// STEP 2
async function createPlaces(community: Community, imagePool: { id: string }[]) {
  const cities = await prismaClient.city.findMany({
    select: { code: true },
    take: NUM_PLACES,
  });

  if (cities.length === 0) {
    throw new Error("No cities found in master data. Please run 'pnpm db:seed-master' first.");
  }

  const results: Place[] = [];
  for (let i = 0; i < NUM_PLACES; i++) {
    const city = cities[i % cities.length];
    const place = await PlaceFactory.create({
      transientCommunity: community,
      transientCity: { code: city.code },
      transientImage: pickRandomImage(imagePool),
    });
    results.push(place);
  }
  return results;
}

// STEP 3
async function createOpportunities(
  users: User[],
  community: Community,
  places: Place[],
  imagePool: { id: string }[],
) {
  const results: Opportunity[] = [];
  for (let i = 0; i < places.length; i++) {
    const opportunity = await OpportunityFactory.create({
      transientUser: users[i % users.length],
      transientCommunity: community,
      transientPlace: places[i],
      transientUtilities: [],
      transientImages: [pickRandomImage(imagePool)],
    });
    results.push(opportunity);
  }
  return results;
}

// STEP 4
async function createNestedEntities(
  users: User[],
  community: Community,
  opportunities: Opportunity[],
  imagePool: { id: string }[],
) {
  await processInBatches(opportunities, BATCH_SIZE, async (opportunity) => {
    const user = users[opportunities.indexOf(opportunity) % users.length];
    const slots: OpportunitySlot[] = [];
    for (let i = 0; i < NUM_SLOTS_PER_OPPORTUNITY; i++) {
      slots.push(
        ...(await OpportunitySlotFactory.createList(1, {
          transientOpportunity: opportunity,
        })),
      );
    }

    for (const slot of slots) {
      const reservations: Reservation[] = [];
      for (let i = 0; i < NUM_RESERVATIONS_PER_SLOT; i++) {
        let reservationStatus: ReservationStatus;

        if (slot.hostingStatus === GqlOpportunitySlotHostingStatus.Scheduled) {
          reservationStatus =
            Math.random() > 0.5 ? GqlReservationStatus.Applied : GqlReservationStatus.Canceled;
        } else if (slot.hostingStatus === GqlOpportunitySlotHostingStatus.Completed) {
          reservationStatus =
            Math.random() > 0.5 ? GqlReservationStatus.Accepted : GqlReservationStatus.Canceled;
        } else if (slot.hostingStatus === GqlOpportunitySlotHostingStatus.Cancelled) {
          reservationStatus = GqlReservationStatus.Rejected;
        } else {
          reservationStatus = GqlReservationStatus.Applied;
        }

        reservations.push(
          ...(await ReservationFactory.createList(1, {
            transientUser: user,
            transientSlot: slot,
            transientStatus: reservationStatus,
          })),
        );
      }

      await processInBatches(reservations, 1, async (reservation) => {
        const startsAt = new Date(slot.startsAt);
        const now = new Date();

        const isFuture = startsAt > now;
        const isCompleted = slot.hostingStatus === GqlOpportunitySlotHostingStatus.Completed;
        const isAccepted = reservation.status === GqlReservationStatus.Accepted;
        const isApplied = reservation.status === GqlReservationStatus.Applied;

        let participationStatus: GqlParticipationStatus;

        if (isApplied) {
          participationStatus = GqlParticipationStatus.Participating;
        } else if (!isFuture && isCompleted && isAccepted) {
          participationStatus = GqlParticipationStatus.Participating;
        } else {
          participationStatus = GqlParticipationStatus.Participating;
        }

        return ParticipationFactory.create({
          transientUser: user,
          transientReservation: reservation,
          transientCommunity: community,
          transientStatus: participationStatus,
          transientImages: [pickRandomImage(imagePool)],
        });
      });

      // await processInBatches(participations, 1, async (participation) => {
      //   const evaluation = await EvaluationFactory.create({
      //     transientParticipation: participation,
      //     transientUser: user,
      //   });
      //
      //   await prismaClient.participation.update({
      //     where: { id: participation.id },
      //     data: { evaluationId: evaluation.id },
      //   });
      //
      //   return evaluation;
      // });
    }
  });
}

// // STEP 5
// async function createTransactions(wallets: Wallet[]) {
//   await processInBatches(
//     [...Array(NUM_TRANSACTIONS)].map((_, i) => i),
//     BATCH_SIZE,
//     async (i) => {
//       return TransactionFactory.create({
//         transientFromWallet: wallets[i % wallets.length],
//         transientToWallet: wallets[(i + 1) % wallets.length],
//       });
//     },
//   );
// }

async function createNfts(users: User[]) {
  const ADA_POLICY_ID = "aabbccddeeff00112233445566778899aabbccddeeff001122334455";

  const ethToken = await NftTokenFactory.create({
    id: "tok_eth_1",
    address: "0x0000000000000000000000000000000000000000",
    type: "ERC-721",
    name: "Local ETH NFT",
    symbol: "LNFT",
    json: {},
  });

  const adaToken = await NftTokenFactory.create({
    id: "tok_ada_1",
    address: ADA_POLICY_ID,
    type: "CIP-25",
    name: "Local ADA NFT",
    symbol: "LANFT",
    json: {},
  });

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const userIndex = i + 1;

    const externalWallet = await NftWalletFactory.create({
      id: `nft_wallet_ext_${userIndex}`,
      type: NftWalletType.EXTERNAL,
      walletAddress: externalAddress(userIndex),
      transientUser: { id: user.id },
    });

    const internalWallet = await NftWalletFactory.create({
      id: `nft_wallet_int_${userIndex}`,
      type: NftWalletType.INTERNAL,
      walletAddress: internalAddress(user.id),
      transientUser: { id: user.id },
    });

    await NftInstanceFactory.create({
      id: `ins_eth_${userIndex}`,
      instanceId: `local-eth-${userIndex}`,
      name: `Local ETH NFT #${userIndex}`,
      description: `For local test - User ${userIndex}`,
      imageUrl: ethImageUrl(userIndex),
      json: {},
      status: NftInstanceStatus.OWNED,
      transientNftToken: { id: ethToken.id },
      transientNftWallet: { id: externalWallet.id },
    });

    await NftInstanceFactory.create({
      id: `ins_ada_${userIndex}`,
      instanceId: `local-ada-${userIndex}`,
      name: `Local ADA NFT #${userIndex}`,
      description: `For local test - User ${userIndex}`,
      imageUrl: adaImageUrl(userIndex),
      json: ada721Json(ADA_POLICY_ID, assetNameHex(i), `COOLNFT${userIndex}`),
      status: NftInstanceStatus.OWNED,
      transientNftToken: { id: adaToken.id },
      transientNftWallet: { id: internalWallet.id },
    });
  }

  await NftInstanceFactory.create({
    id: "ins_ada_policy",
    instanceId: "local-ada-policy",
    name: "Local ADA NFT (Policy Only)",
    description: "For local test - Policy page demo",
    imageUrl: "https://picsum.photos/seed/civicship-ada-policy/800/450",
    json: {},
    status: NftInstanceStatus.STOCK,
    transientNftToken: { id: adaToken.id },
  });
}
