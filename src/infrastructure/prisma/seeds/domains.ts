import {
  ArticleFactory,
  // CommunityFactory,
  EvaluationFactory,
  EvaluationHistoryFactory,
  IdentityFactory,
  MembershipFactory,
  OpportunityFactory,
  OpportunitySlotFactory,
  ParticipationFactory,
  ParticipationImageFactory,
  ParticipationStatusHistoryFactory,
  ReservationFactory,
  TicketFactory,
  TicketStatusHistoryFactory,
  TransactionFactory,
  UserFactory,
  UtilityFactory,
  WalletFactory,
} from "@/__tests__/factories/factory";
import { prismaClient } from "@/infrastructure/prisma/client";
import { initialize } from "@/__tests__/factories/__generated__";

initialize({ prisma: prismaClient });

export async function seedUsecase() {
  console.log("\ud83c\udf31 Seeding mock data...");

  try {
    await prismaClient.$transaction(
      async (tx) => {
        console.log("\ud83e\udde9 Creating Users & Communities...");
        const users = await UserFactory.createList(2);

        // const community = await CommunityFactory.create();
        const COMMUNITY_ID = "DEMO";

        console.log("\ud83d\udd17 Creating Identities...");
        await IdentityFactory.createList(
          users.map((user) => ({
            user: { connect: { id: user.id } },
          })),
        );

        console.log("\ud83e\udd1d Creating Memberships...");
        const memberships = await MembershipFactory.createList(
          users.map((user) => ({
            user: { connect: { id: user.id } },
            community: { connect: { id: COMMUNITY_ID } },
          })),
        );

        console.log(
          "\ud83d\udcb0 Creating Wallets / \ud83e\uddfa Utilities / \ud83d\udce2 Opportunities...",
        );
        const [wallets, utilities, opportunities] = await Promise.all([
          WalletFactory.createList(
            memberships.map((m) => ({
              user: { connect: { id: m.userId } },
              community: { connect: { id: m.communityId } },
            })),
          ),
          UtilityFactory.createList(
            Array.from({ length: 5 }).map(() => ({
              community: { connect: { id: COMMUNITY_ID } },
            })),
          ),
          OpportunityFactory.createList(
            Array.from({ length: 10 }).map((_, i) => ({
              community: { connect: { id: COMMUNITY_ID } },
              createdByUser: { connect: { id: users[i % users.length].id } },
            })),
          ),
        ]);

        const [tickets, slots] = await Promise.all([
          TicketFactory.createList(
            wallets.map((wallet, i) => ({
              wallet: { connect: { id: wallet.id } },
              utility: { connect: { id: utilities[i % utilities.length].id } },
            })),
          ),
          OpportunitySlotFactory.createList(
            opportunities.map((opportunity) => ({
              opportunity: { connect: { id: opportunity.id } },
            })),
          ),
          TransactionFactory.createList(
            Array.from({ length: 10 }).map(() => ({
              fromWallet: { connect: { id: wallets[0].id } },
              toWallet: { connect: { id: wallets[1].id } },
            })),
          ),
          ArticleFactory.createList(
            Array.from({ length: 5 }).map((_, i) => ({
              community: { connect: { id: COMMUNITY_ID } },
              authors: {
                connect: [{ id: users[i % users.length].id }],
              },
              relatedUsers: {
                connect: [{ id: users[(i + 1) % users.length].id }],
              },
              opportunities: {
                connect: [{ id: opportunities[i % opportunities.length].id }],
              },
            })),
          ),
        ]);

        const [reservations] = await Promise.all([
          ReservationFactory.createList(
            slots.map((slot, i) => ({
              opportunitySlot: { connect: { id: slot.id } },
              createdByUser: { connect: { id: users[i % users.length].id } },
            })),
          ),
          TicketStatusHistoryFactory.createList(
            tickets.map((ticket, i) => ({
              ticket: { connect: { id: ticket.id } },
              createdByUser: { connect: { id: users[i % users.length].id } },
            })),
          ),
        ]);

        console.log("\ud83d\ude4b Creating Participations...");
        const participations = await ParticipationFactory.createList(
          reservations.map((reservation, i) => ({
            reservation: { connect: { id: reservation.id } },
            user: { connect: { id: users[i % users.length].id } },
            community: { connect: { id: COMMUNITY_ID } },
          })),
        );

        const [evaluations] = await Promise.all([
          EvaluationFactory.createList(
            participations.map((p, i) => ({
              participation: { connect: { id: p.id } },
              evaluator: { connect: { id: users[i % users.length].id } },
            })),
          ),
          ParticipationImageFactory.createList(
            participations.map((p) => ({
              participation: { connect: { id: p.id } },
            })),
          ),
          ParticipationStatusHistoryFactory.createList(
            participations.map((p, i) => ({
              participation: { connect: { id: p.id } },
              createdByUser: { connect: { id: users[i % users.length].id } },
            })),
          ),
        ]);

        console.log("\ud83d\udcda Creating EvaluationHistory...");
        await EvaluationHistoryFactory.createList(
          evaluations.map((e, i) => ({
            evaluation: { connect: { id: e.id } },
            createdByUser: { connect: { id: users[i % users.length].id } },
          })),
        );

        console.log("\ud83c\udf89 Seeding succeeded!");
      },
      {
        timeout: 120000,
        maxWait: 20000,
      },
    );
  } catch (e) {
    console.error("\u274c Seeding failed with error:", e);
    throw e;
  }

  console.log("\u2705 Seeding completed!");
}
