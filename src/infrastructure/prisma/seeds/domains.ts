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

const NUM_UTILITIES = 2;
const NUM_OPPORTUNITIES = 2;
const NUM_SLOTS_PER_OPPORTUNITY = 1;
const NUM_RESERVATIONS_PER_SLOT = 1;
const NUM_TRANSACTIONS = 3;

export async function seedUsecase() {
  console.log("🔥 Resetting DB...");

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

  console.log("🌱 Seeding mock data (connection-safe, sequential)...");

  await prismaClient.$transaction(
    async () => {
      const { user, community, wallet } = await createBaseEntities();
      await createUtilitiesAndTickets(user, community, wallet);
      const opportunities = await createOpportunities(user, community);
      await createNestedEntities(user, community, opportunities);
      await createTransactions(wallet);
      console.log("🎉 All seeding steps completed inside transaction!");
    },
    {
      timeout: 120000,
      maxWait: 12000,
    },
  );
}

// --- STEP 1: User / Community / Wallet / Membership ---
async function createBaseEntities() {
  console.log("🧱 STEP 1: Creating base User, Community, Wallet, Membership...");
  const [community, user] = await Promise.all([
    CommunityFactory.create({ id: "neo88" }),
    UserFactory.create(),
  ]);
  const [wallet] = await Promise.all([
    WalletFactory.create({ transientUser: user, transientCommunity: community }),
    MembershipFactory.create({ transientUser: user, transientCommunity: community }),
  ]);
  console.log("✅ STEP 1 completed.");
  return { user, community, wallet };
}

// --- STEP 2: Utilities & Tickets ---
async function createUtilitiesAndTickets(user: any, community: any, wallet: any) {
  console.log("🎫 STEP 2: Creating Utilities & Tickets...");
  const utilities = await UtilityFactory.createList(NUM_UTILITIES, {
    transientCommunity: community,
  });

  await Promise.all(
    utilities.map((utility) =>
      TicketFactory.create({
        transientUser: user,
        transientWallet: wallet,
        transientUtility: utility,
      }),
    ),
  );
  console.log("✅ STEP 2 completed.");
}

// --- STEP 3: Place → Opportunity ---
async function createOpportunities(user: any, community: any) {
  console.log("🌍 STEP 3: Creating Places...");
  const place = await PlaceFactory.createList(NUM_OPPORTUNITIES, {
    transientCommunity: community,
  });

  console.log("📣 STEP 3-1: Creating Opportunities per Place...");
  const opportunities = (
    await Promise.all(
      place.map((p) =>
        OpportunityFactory.createList(NUM_OPPORTUNITIES, {
          transientUser: user,
          transientCommunity: community,
          transientPlace: p,
        }),
      ),
    )
  ).flat();
  console.log(`✅ STEP 3-1 completed. ${opportunities.length} opportunities created.`);
  return opportunities;
}

// --- STEP 3-2: Opportunity → Slot → Reservation → Participation → Evaluation / Article ---
async function createNestedEntities(user: any, community: any, opportunities: any[]) {
  console.log(
    "🧩 STEP 3-2: Creating Slots, Reservations, Participations, Evaluations, and Articles...",
  );

  for (const opportunity of opportunities) {
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
  }

  console.log("✅ STEP 3-2 completed.");
}

// --- STEP 4: Transactions ---
async function createTransactions(wallet: any) {
  console.log("💸 STEP 4: Creating Transactions...");
  await TransactionFactory.createList(NUM_TRANSACTIONS, {
    transientFromWallet: wallet,
    transientToWallet: wallet,
  });
  console.log("✅ STEP 4 completed.");
}
