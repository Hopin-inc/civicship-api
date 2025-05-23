import {
  ArticleFactory,
  CommunityFactory,
  EvaluationFactory,
  MembershipFactory,
  OpportunityFactory,
  OpportunitySlotFactory,
  ParticipationFactory,
  PlaceFactory,
  ReservationFactory,
  TicketFactory,
  TransactionFactory,
  UserFactory,
  UtilityFactory,
  WalletFactory,
} from "@/infrastructure/prisma/factories/factory";
import { prismaClient } from "@/infrastructure/prisma/client";
import { processInBatches } from "@/utils/array";
import { Opportunity, OpportunitySlot, Place, Reservation, User, Wallet } from "@prisma/client";
import { Community } from "@prisma/client/index.d";

const BATCH_SIZE = 10; // edit this ONLY when seeding is slow to the extent database connections are established properly
const NUM_UTILITIES = 3;
const NUM_SLOTS_PER_OPPORTUNITY = 3;
const NUM_RESERVATIONS_PER_SLOT = 1;
const NUM_TRANSACTIONS = 5;
const NUM_PLACES = 100;

export async function seedUsecase() {
  // await prismaClient.opportunity.updateMany({
  //   where: {},
  //   data: {
  //     createdBy: "cmawfulj70004s60elzlotgd9",
  //   },
  // });

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
        t_membership_histories,
        t_memberships,
        t_articles,
        t_places,
        m_cities,
        m_states,
        t_users,
        t_communities
      RESTART IDENTITY CASCADE;
    `);
  });

  console.info("🧱 Creating base User, Community, Wallet, Membership...");
  const { users, community, wallets } = await createBaseEntitiesForUsers();

  console.info("📍 Creating Places...");
  const places = await createPlaces(community);

  console.info("🎫 Creating Utilities & Tickets...");
  await createUtilitiesAndTickets(users, community, wallets);

  console.info("📣 Creating Opportunities...");
  const opportunities = await createOpportunities(users, community, places);

  console.info("🧩 Creating Slots, Reservations, Participations, Evaluations, and Articles...");
  await createNestedEntities(users, community, opportunities);

  console.info("💸 Creating Transactions...");
  await createTransactions(wallets);

  console.info("🎉 All seeding steps completed!");
}

// STEP 1
async function createBaseEntitiesForUsers() {
  const community = await CommunityFactory.create({ id: "neo88" });
  const users = await UserFactory.createList(10);

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
async function createUtilitiesAndTickets(users: User[], community: Community, wallets: Wallet[]) {
  const utilities = await UtilityFactory.createList(NUM_UTILITIES, {
    transientCommunity: community,
  });

  await processInBatches(utilities, BATCH_SIZE, async (utility) => {
    for (let i = 0; i < users.length; i++) {
      await TicketFactory.create({
        transientUser: users[i],
        transientWallet: wallets[i],
        transientUtility: utility,
      });
    }
  });
}

// 💡 STEP 1.5 を追加：Placeを複数作成
async function createPlaces(community: Community) {
  const results: Place[] = [];
  for (let i = 0; i < NUM_PLACES / BATCH_SIZE; i++) {
    results.push(
      ...(await PlaceFactory.createList(BATCH_SIZE, {
        transientCommunity: community,
      })),
    );
  }
  return results;
}

// STEP 3
async function createOpportunities(users: User[], community: Community, places: Place[]) {
  const results: Opportunity[] = [];
  for (let i = 0; i < places.length; i++) {
    const opportunity = await OpportunityFactory.create({
      transientUser: users[i % users.length], // ラウンドロビン
      transientCommunity: community,
      transientPlace: places[i],
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
        reservations.push(
          ...(await ReservationFactory.createList(1, {
            transientUser: user,
            transientSlot: slot,
          })),
        );
      }

      const participations = await processInBatches(reservations, 1, async (reservation) => {
        return ParticipationFactory.create({
          transientUser: user,
          transientReservation: reservation,
          transientCommunity: community,
        });
      });

      await processInBatches(participations, 1, async (participation) => {
        const evaluation = await EvaluationFactory.create({
          transientParticipation: participation,
          transientUser: user,
        });

        await prismaClient.participation.update({
          where: { id: participation.id },
          data: { evaluationId: evaluation.id },
        });

        return evaluation;
      });
    }

    await ArticleFactory.create({
      transientCommunity: community,
      transientAuthor: user,
      transientRelatedUsers: [user],
      transientOpportunity: opportunity,
    });
  });
}

// STEP 5
async function createTransactions(wallets: Wallet[]) {
  await processInBatches(
    [...Array(NUM_TRANSACTIONS)].map((_, i) => i),
    BATCH_SIZE,
    async (i) => {
      return TransactionFactory.create({
        transientFromWallet: wallets[i % wallets.length],
        transientToWallet: wallets[(i + 1) % wallets.length],
      });
    },
  );
}
