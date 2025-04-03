import { prismaClient } from "@/infrastructure/prisma/client";
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
import { randUuid } from "@ngneat/falso";

export async function seedUsecase() {
  console.log("🌱 Seeding mock data...");

  await prismaClient.$transaction(async (tx) => {
    const users = await Promise.all(Array.from({ length: 5 }, () => UserFactory.create()));
    const communities = await Promise.all(
      Array.from({ length: 2 }, () => CommunityFactory.create()),
    );

    await Promise.all(
      users.map(async (user, i) => {
        const identity = await IdentityFactory.build(
          {
            uid: i === 0 ? "Uf4a68d8e6d68927a496120aa16842027" : randUuid(),
          },
          {
            transientUserId: user.id,
          },
        );

        return tx.identity.create({ data: identity });
      }),
    );

    const memberships = await Promise.all(
      users.flatMap((user) =>
        communities.map((community) =>
          MembershipFactory.create({
            transientUserId: user.id,
            transientCommunityId: community.id,
          }),
        ),
      ),
    );

    const wallets = await Promise.all(
      memberships.map((m) =>
        WalletFactory.create({
          transientUserId: m.userId,
          transientCommunityId: m.communityId,
        }),
      ),
    );

    const utilities = await Promise.all(
      communities.map((community) => UtilityFactory.create({ transientCommunityId: community.id })),
    );

    const opportunities = await Promise.all(
      communities.map((community, i) =>
        OpportunityFactory.create({
          transientCommunityId: community.id,
          transientUserId: users[i % users.length].id,
        }),
      ),
    );

    const slots = await Promise.all(
      opportunities.map((opportunity) =>
        OpportunitySlotFactory.create({ transientOpportunityId: opportunity.id }),
      ),
    );

    const reservations = await Promise.all(
      slots.map((slot, i) =>
        ReservationFactory.create({
          transientSlotId: slot.id,
          transientUserId: users[i % users.length].id,
        }),
      ),
    );

    const participations = await Promise.all(
      reservations.map((reservation, i) =>
        ParticipationFactory.create({
          transientReservationId: reservation.id,
          transientUserId: users[i % users.length].id,
          transientCommunityId: opportunities[i % opportunities.length].communityId ?? undefined,
        }),
      ),
    );

    await Promise.all(
      participations.map((p) =>
        ParticipationImageFactory.create({ transientParticipationId: p.id }),
      ),
    );

    await Promise.all(
      participations.map((p, i) =>
        ParticipationStatusHistoryFactory.create({
          transientParticipationId: p.id,
          transientUserId: users[i % users.length].id,
        }),
      ),
    );

    const tickets = await Promise.all(
      wallets.map((wallet, i) =>
        TicketFactory.create({
          transientWalletId: wallet.id,
          transientUtilityId: utilities[i % utilities.length].id,
        }),
      ),
    );

    await Promise.all(
      tickets.map((ticket, i) =>
        TicketStatusHistoryFactory.create({
          transientTicketId: ticket.id,
          transientUserId: users[i % users.length].id,
        }),
      ),
    );

    const evaluations = await Promise.all(
      participations.map((p, i) =>
        EvaluationFactory.create({
          transientParticipationId: p.id,
          transientUserId: users[i % users.length].id,
        }),
      ),
    );

    await Promise.all(
      evaluations.map((evaluation, i) =>
        EvaluationHistoryFactory.create({
          transientEvaluationId: evaluation.id,
          transientUserId: users[i % users.length].id,
        }),
      ),
    );

    await Promise.all(
      communities.map((community, i) =>
        ArticleFactory.create({
          transientCommunityId: community.id,
          transientAuthorIds: [users[i % users.length].id],
          transientRelatedUserIds: [users[(i + 1) % users.length].id],
          transientOpportunityIds: [opportunities[i % opportunities.length].id],
        }),
      ),
    );

    await Promise.all(
      Array.from({ length: 10 }, () =>
        TransactionFactory.create({
          transientFromWalletId: wallets[0].id,
          transientToWalletId: wallets[1].id,
        }),
      ),
    );
  });

  console.log("✅ Seeding completed!");
}
