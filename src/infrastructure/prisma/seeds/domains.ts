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

const NUM_UTILITIES = 3;
const NUM_SLOTS_PER_OPPORTUNITY = 3;
const NUM_RESERVATIONS_PER_SLOT = 1;
const NUM_TRANSACTIONS = 10;

export async function seedUsecase() {
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

  const membershipsAndWallets = await Promise.all(
    users.map(async (user) => {
      const [wallet] = await Promise.all([
        WalletFactory.create({ transientUser: user, transientCommunity: community }),
        MembershipFactory.create({ transientUser: user, transientCommunity: community }),
      ]);
      return { user, wallet };
    }),
  );

  return {
    community,
    users: membershipsAndWallets.map((mw) => mw.user),
    wallets: membershipsAndWallets.map((mw) => mw.wallet),
  };
}

// STEP 2
async function createUtilitiesAndTickets(users: any[], community: any, wallets: any[]) {
  const utilities = await UtilityFactory.createList(NUM_UTILITIES, {
    transientCommunity: community,
  });

  await Promise.all(
    utilities.flatMap((utility) =>
      users.map((user, i) =>
        TicketFactory.create({
          transientUser: user,
          transientWallet: wallets[i],
          transientUtility: utility,
        }),
      ),
    ),
  );
}

// 💡 STEP 1.5 を追加：Placeを複数作成
async function createPlaces(community: any) {
  return await PlaceFactory.createList(20, {
    transientCommunity: community,
  });
}

// STEP 3
async function createOpportunities(users: any[], community: any, places: any[]) {
  return await Promise.all(
    places.map((place, i) =>
      OpportunityFactory.create({
        transientUser: users[i % users.length], // ラウンドロビン
        transientCommunity: community,
        transientPlace: place,
      }),
    ),
  );
}

// STEP 4
async function createNestedEntities(users: any[], community: any, opportunities: any[]) {
  await Promise.all(
    opportunities.map(async (opportunity, index) => {
      const user = users[index % users.length]; // 分散
      const slots = await OpportunitySlotFactory.createList(NUM_SLOTS_PER_OPPORTUNITY, {
        transientOpportunity: opportunity,
      });

      for (const slot of slots) {
        const reservations = await ReservationFactory.createList(NUM_RESERVATIONS_PER_SLOT, {
          transientUser: user,
          transientSlot: slot,
        });

        const participations = await Promise.all(
          reservations.map((reservation) =>
            ParticipationFactory.create({
              transientUser: user,
              transientReservation: reservation,
              transientCommunity: community,
            }),
          ),
        );

        await Promise.all(
          participations.map((p) =>
            EvaluationFactory.create({
              transientParticipation: p,
              transientUser: user,
            }),
          ),
        );
      }

      await ArticleFactory.create({
        transientCommunity: community,
        transientAuthor: user,
        transientRelatedUsers: [user],
        transientOpportunity: opportunity,
      });
    }),
  );
}

// STEP 5
async function createTransactions(wallets: any[]) {
  await Promise.all(
    Array.from({ length: NUM_TRANSACTIONS }).map((_, i) =>
      TransactionFactory.create({
        transientFromWallet: wallets[i % wallets.length],
        transientToWallet: wallets[(i + 1) % wallets.length],
      }),
    ),
  );
}
