import {
  ArticleFactory,
  CommunityFactory,
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

// --- 共通 try-catch ヘルパー ---
async function safeCreate<T>(label: string, index: number, fn: () => PromiseLike<T>): Promise<T> {
  try {
    return await Promise.resolve(fn());
  } catch (err) {
    console.error(`❌ ${label} failed at index ${index}`, err);
    throw err;
  }
}

initialize({ prisma: prismaClient });

export async function seedUsecase() {
  console.log("🌱 Seeding mock data...");

  try {
    await prismaClient.$transaction(
      async (tx) => {
        // --- 👤 Users & 🏘️ Communities ---
        console.log("🧩 Creating Users & Communities...");
        const [users, communities] = await Promise.all([
          Promise.all(
            Array.from({ length: 5 }).map((_, i) =>
              safeCreate("UserFactory", i, () => UserFactory.create()),
            ),
          ),
          Promise.all(
            Array.from({ length: 2 }).map((_, i) =>
              safeCreate("CommunityFactory", i, () => CommunityFactory.create()),
            ),
          ),
        ]);

        // --- 🆔 Identities ---
        console.log("🔗 Creating Identities...");
        await Promise.all(
          users.map((user, i) =>
            safeCreate("IdentityFactory", i, () =>
              IdentityFactory.create({
                user: { connect: { id: user.id } },
              }),
            ),
          ),
        );

        // --- 🤝 Memberships ---
        console.log("🤝 Creating Memberships...");
        const memberships = await Promise.all(
          users.flatMap((user, i) =>
            communities.map((community, j) =>
              safeCreate("MembershipFactory", i * communities.length + j, () =>
                MembershipFactory.create({
                  user: { connect: { id: user.id } },
                  community: { connect: { id: community.id } },
                }),
              ),
            ),
          ),
        );

        // --- 💰 Wallets / 🧺 Utilities / 📢 Opportunities ---
        console.log("💰 Creating Wallets / 🧺 Utilities / 📢 Opportunities...");
        const [wallets, utilities, opportunities] = await Promise.all([
          Promise.all(
            memberships.map((membership, i) =>
              safeCreate("WalletFactory", i, () =>
                WalletFactory.create({
                  user: { connect: { id: membership.userId } },
                  community: { connect: { id: membership.communityId } },
                }),
              ),
            ),
          ),
          Promise.all(
            communities.map((community, i) =>
              safeCreate("UtilityFactory", i, () =>
                UtilityFactory.create({
                  community: { connect: { id: community.id } },
                }),
              ),
            ),
          ),
          Promise.all(
            communities.map((community, i) =>
              safeCreate("OpportunityFactory", i, () =>
                OpportunityFactory.create({
                  community: { connect: { id: community.id } },
                  createdByUser: { connect: { id: users[i % users.length].id } },
                }),
              ),
            ),
          ),
        ]);

        // --- 🎟️ Tickets & 💸 Transactions & 🗓️ Opportunity Slots & 📰 Articles ---
        const [tickets, slots] = await Promise.all([
          Promise.all(
            wallets.map((wallet, i) =>
              safeCreate("Ticket", i, () =>
                TicketFactory.create({
                  wallet: { connect: { id: wallet.id } },
                  utility: { connect: { id: utilities[i % utilities.length].id } },
                }),
              ),
            ),
          ),
          Promise.all(
            opportunities.map((opportunity, i) =>
              safeCreate("Slot", i, () =>
                OpportunitySlotFactory.create({
                  opportunity: { connect: { id: opportunity.id } },
                }),
              ),
            ),
          ),
          Promise.all(
            Array.from({ length: 10 }).map((_, i) =>
              safeCreate("Transaction", i, () =>
                TransactionFactory.create({
                  fromWallet: { connect: { id: wallets[0].id } },
                  toWallet: { connect: { id: wallets[1].id } },
                }),
              ),
            ),
          ),
          Promise.all(
            communities.map((community, i) =>
              safeCreate("Article", i, () =>
                ArticleFactory.create({
                  community: { connect: { id: community.id } },
                  authors: { connect: [{ id: users[i % users.length].id }] },
                  relatedUsers: { connect: [{ id: users[(i + 1) % users.length].id }] },
                  opportunities: { connect: [{ id: opportunities[i % opportunities.length].id }] },
                }),
              ),
            ),
          ),
        ]);

        // --- 📝 Reservations ---
        const [reservations] = await Promise.all([
          Promise.all(
            slots.map((slot, i) =>
              safeCreate("Reservation", i, () =>
                ReservationFactory.create({
                  opportunitySlot: { connect: { id: slot.id } },
                  createdByUser: { connect: { id: users[i % users.length].id } },
                }),
              ),
            ),
          ),
          Promise.all(
            tickets.map((ticket, i) =>
              safeCreate("TicketStatusHistory", i, () =>
                TicketStatusHistoryFactory.create({
                  ticket: { connect: { id: ticket.id } },
                  createdByUser: { connect: { id: users[i % users.length].id } },
                }),
              ),
            ),
          ),
        ]);

        // --- 🙋 Participations ---
        console.log("🙋 Creating Participations...");
        const participations = await Promise.all(
          reservations.map((reservation, i) =>
            safeCreate("Participation", i, () => {
              const opportunity = opportunities[i % opportunities.length];
              if (!opportunity.communityId) {
                throw new Error(`Opportunity[${i}] has no communityId`);
              }
              return ParticipationFactory.create({
                reservation: { connect: { id: reservation.id } },
                user: { connect: { id: users[i % users.length].id } },
                community: { connect: { id: opportunity.communityId } },
              });
            }),
          ),
        );

        const [evaluations] = await Promise.all([
          Promise.all(
            participations.map((p, i) =>
              safeCreate("Evaluation", i, () =>
                EvaluationFactory.create({
                  participation: { connect: { id: p.id } },
                  evaluator: { connect: { id: users[i % users.length].id } },
                }),
              ),
            ),
          ),
          Promise.all(
            participations.map((p, i) =>
              safeCreate("ParticipationImage", i, () =>
                ParticipationImageFactory.create({
                  participation: { connect: { id: p.id } },
                }),
              ),
            ),
          ),
          Promise.all(
            participations.map((p, i) =>
              safeCreate("ParticipationStatusHistory", i, () =>
                ParticipationStatusHistoryFactory.create({
                  participation: { connect: { id: p.id } },
                  createdByUser: { connect: { id: users[i % users.length].id } },
                }),
              ),
            ),
          ),
        ]);

        // --- 📘 Evaluation Histories ---
        console.log("📘 Creating EvaluationHistory...");
        await Promise.all(
          evaluations.map((e, i) =>
            safeCreate("EvaluationHistory", i, () =>
              EvaluationHistoryFactory.create({
                evaluation: { connect: { id: e.id } },
                createdByUser: { connect: { id: users[i % users.length].id } },
              }),
            ),
          ),
        );

        console.log("🎉 Seeding succeeded!");
      },
      {
        timeout: 60_000,
        maxWait: 6000,
      },
    );
  } catch (e) {
    console.error("❌ Seeding failed with error:", e);
    throw e;
  }

  console.log("✅ Seeding completed!");
}
