import { prismaClient } from "@/infrastructure/prisma/client";
import {
  CommunityFactory,
  EvaluationFactory,
  EvaluationHistoryFactory,
  MembershipFactory,
  OpportunityFactory,
  OpportunitySlotFactory,
  ParticipationFactory,
  ReservationFactory,
  TicketFactory,
  TicketStatusHistoryFactory,
  TransactionFactory,
  UserFactory,
  UtilityFactory,
  WalletFactory,
} from "@/__tests__/factories/factory";

export async function seedUsecase() {
  console.log("🌱 Seeding mock data...");

  await prismaClient.$transaction(
    async (tx) => {
      // --- Users & Communities ---
      const users = await Promise.all(
        Array.from({ length: 5 }, () =>
          UserFactory.build().then((data) => tx.user.create({ data })),
        ),
      );

      const communities = await Promise.all(
        Array.from({ length: 2 }, () =>
          CommunityFactory.build().then((data) => tx.community.create({ data })),
        ),
      );

      // --- Memberships & Wallets ---
      const memberships = await Promise.all(
        users.flatMap((user) =>
          communities.map((community) =>
            MembershipFactory.build({
              user: { connect: { id: user.id } },
              community: { connect: { id: community.id } },
            }).then((data) => tx.membership.create({ data })),
          ),
        ),
      );

      const wallets = await Promise.all(
        memberships.map((m) =>
          WalletFactory.build({
            user: { connect: { id: m.userId } },
            community: { connect: { id: m.communityId } },
          }).then((data) => tx.wallet.create({ data })),
        ),
      );

      // --- Utilities ---
      const utilities = await Promise.all(
        communities.map((community) =>
          UtilityFactory.build({
            community: { connect: { id: community.id } },
          }).then((data) => tx.utility.create({ data })),
        ),
      );

      // --- Opportunities & Slots & Reservations ---
      const opportunities = await Promise.all(
        communities.map((community, i) =>
          OpportunityFactory.build({
            community: { connect: { id: community.id } },
            createdByUser: { connect: { id: users[i % users.length].id } },
          }).then((data) => tx.opportunity.create({ data })),
        ),
      );

      const slots = await Promise.all(
        opportunities.map((opportunity) =>
          OpportunitySlotFactory.build({
            opportunity: { connect: { id: opportunity.id } },
          }).then((data) => tx.opportunitySlot.create({ data })),
        ),
      );

      const reservations = await Promise.all(
        slots.map((slot, i) =>
          ReservationFactory.build({
            opportunitySlot: { connect: { id: slot.id } },
            createdByUser: { connect: { id: users[i % users.length].id } },
          }).then((data) => tx.reservation.create({ data })),
        ),
      );

      // --- Participations ---
      const slotsByReservationId = new Map(
        reservations.map((reservation, idx) => [reservation.id, slots[idx]]),
      );

      const participations = await Promise.all(
        reservations.map((reservation, i) => {
          const slot = slotsByReservationId.get(reservation.id);
          const opportunity = opportunities.find((o) => o.id === slot?.opportunityId);
          return ParticipationFactory.build({
            reservation: { connect: { id: reservation.id } },
            user: { connect: { id: users[i % users.length].id } },
            community: { connect: { id: opportunity?.communityId ?? "" } },
          }).then((data) => tx.participation.create({ data }));
        }),
      );

      // --- Tickets & Ticket Status Histories ---
      const tickets = await Promise.all(
        wallets.map((wallet, i) =>
          TicketFactory.build({
            wallet: { connect: { id: wallet.id } },
            utility: { connect: { id: utilities[i % utilities.length].id } },
          }).then((data) => tx.ticket.create({ data })),
        ),
      );

      await Promise.all(
        tickets.map((ticket, i) =>
          TicketStatusHistoryFactory.build({
            ticket: { connect: { id: ticket.id } },
            createdByUser: { connect: { id: users[i % users.length].id } },
          }).then((data) => tx.ticketStatusHistory.create({ data })),
        ),
      );

      // --- Evaluations & Evaluation Histories ---
      const evaluations = await Promise.all(
        participations.map((p, i) =>
          EvaluationFactory.build({
            participation: { connect: { id: p.id } },
            evaluator: { connect: { id: users[i % users.length].id } },
          }).then((data) => tx.evaluation.create({ data })),
        ),
      );

      await Promise.all(
        evaluations.map((evaluation, i) =>
          EvaluationHistoryFactory.build({
            evaluation: { connect: { id: evaluation.id } },
            createdByUser: { connect: { id: users[i % users.length].id } },
          }).then((data) => tx.evaluationHistory.create({ data })),
        ),
      );

      // --- Transactions ---
      await Promise.all(
        Array.from({ length: 10 }, () =>
          TransactionFactory.build({
            fromWallet: { connect: { id: wallets[0].id } },
            toWallet: { connect: { id: wallets[1].id } },
          }).then((data) => tx.transaction.create({ data })),
        ),
      );
    },
    {
      timeout: 600_000,
      maxWait: 30_000,
    },
  );

  console.log("✅ Seeding completed!");
}
