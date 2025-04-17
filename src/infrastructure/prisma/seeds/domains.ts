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
const NUM_OPPORTUNITIES = 10;
const NUM_SLOTS_PER_OPPORTUNITY = 3;
const NUM_RESERVATIONS_PER_SLOT = 1;
const NUM_TRANSACTIONS = 10;

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

  console.log("🧱 Creating base User, Community, Wallet, Membership...");
  const { user, community, wallet } = await createBaseEntities();

  console.log("🎫 Creating Utilities & Tickets...");
  await createUtilitiesAndTickets(user, community, wallet);

  console.log("📣 Creating Opportunities...");
  const opportunities = await createOpportunities(user, community);

  console.log("🧩 Creating Slots, Reservations, Participations, Evaluations, and Articles...");
  await createNestedEntities(user, community, opportunities);

  console.log("💸 Creating Transactions...");
  await createTransactions(wallet);

  console.log("🎉 All seeding steps completed!");
}

// STEP 1
async function createBaseEntities() {
  const [community, user] = await Promise.all([
    CommunityFactory.create({ id: "neo88" }),
    UserFactory.create(),
  ]);
  const [wallet] = await Promise.all([
    WalletFactory.create({ transientUser: user, transientCommunity: community }),
    MembershipFactory.create({ transientUser: user, transientCommunity: community }),
  ]);
  return { user, community, wallet };
}

// STEP 2
async function createUtilitiesAndTickets(user: any, community: any, wallet: any) {
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
}

// STEP 3
async function createOpportunities(user: any, community: any) {
  const place = await PlaceFactory.create({ transientCommunity: community });
  return await OpportunityFactory.createList(NUM_OPPORTUNITIES, {
    transientUser: user,
    transientCommunity: community,
    transientPlace: place,
  });
}

// STEP 4
async function createNestedEntities(user: any, community: any, opportunities: any[]) {
  await Promise.all(
    opportunities.map(async (opportunity) => {
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
async function createTransactions(wallet: any) {
  await TransactionFactory.createList(NUM_TRANSACTIONS, {
    transientFromWallet: wallet,
    transientToWallet: wallet,
  });
}
