import {
  ArticleCategory,
  CurrentPrefecture,
  EvaluationStatus,
  IdentityPlatform,
  MembershipStatus,
  MembershipStatusReason,
  OpportunityCategory,
  OpportunitySlotHostingStatus,
  ParticipationStatus,
  ParticipationStatusReason,
  PublishStatus,
  ReservationStatus,
  Role,
  Source,
  TicketStatus,
  TicketStatusReason,
  TransactionReason,
  WalletType,
} from "@prisma/client";
import {
  randAnimal,
  randCatchPhrase,
  randFirstName,
  randLastName,
  randParagraph,
  randUuid,
} from "@ngneat/falso";
import {
  defineArticleFactory,
  defineCommunityFactory,
  defineEvaluationFactory,
  defineEvaluationHistoryFactory,
  defineIdentityFactory,
  defineMembershipFactory,
  defineMembershipHistoryFactory,
  defineOpportunityFactory,
  defineOpportunitySlotFactory,
  defineParticipationFactory,
  defineParticipationImageFactory,
  defineParticipationStatusHistoryFactory,
  defineReservationFactory,
  defineTicketFactory,
  defineTicketStatusHistoryFactory,
  defineTransactionFactory,
  defineUserFactory,
  defineUtilityFactory,
  defineWalletFactory,
} from "@/__tests__/factories/__generated__";

// --- enum ランダム選択ユーティリティ ---

const randomEnum = <T extends object>(enumObj: T): T[keyof T] => {
  const values = Object.values(enumObj);
  return values[Math.floor(Math.random() * values.length)];
};

// --- User & Community ---

export const UserFactory = defineUserFactory({
  defaultData: () => ({
    name: `${randFirstName()} ${randLastName()}`,
    slug: `user-${Math.random().toString(36).substring(2, 8)}`,
    currentPrefecture: randomEnum(CurrentPrefecture),
  }),
});

export const IdentityFactory = defineIdentityFactory.withTransientFields<{
  transientUserId?: string;
}>({})({
  defaultData: async ({ transientUserId }) => {
    const userId = transientUserId ?? (await UserFactory.create()).id;
    return {
      uid: randUuid(),
      platform: IdentityPlatform.LINE,
      user: { connect: { id: userId } },
    };
  },
});

export const CommunityFactory = defineCommunityFactory({
  defaultData: () => ({
    name: randAnimal(),
    pointName: `point-${Math.random().toString(36).substring(2, 6)}`,
  }),
});

// --- Membership & Wallet ---

export const MembershipFactory = defineMembershipFactory.withTransientFields<{
  transientRole?: Role;
  transientStatus?: MembershipStatus;
  transientReason?: MembershipStatusReason;
  transientUserId?: string;
  transientCommunityId?: string;
}>({})({
  defaultData: async ({
    transientRole,
    transientStatus,
    transientReason,
    transientUserId,
    transientCommunityId,
  }) => ({
    user: { connect: { id: transientUserId ?? (await UserFactory.create()).id } },
    community: { connect: { id: transientCommunityId ?? (await CommunityFactory.create()).id } },
    status: transientStatus ?? randomEnum(MembershipStatus),
    reason: transientReason ?? randomEnum(MembershipStatusReason),
    role: transientRole ?? randomEnum(Role),
  }),
});

export const MembershipHistoryFactory = defineMembershipHistoryFactory.withTransientFields<{
  transientStatus?: MembershipStatus;
  transientReason?: MembershipStatusReason;
  transientRole?: Role;
  transientUserId?: string;
  transientCommunityId?: string;
}>({})({
  defaultData: async ({
    transientStatus,
    transientReason,
    transientRole,
    transientUserId,
    transientCommunityId,
  }) => {
    const userId = transientUserId ?? (await UserFactory.create()).id;
    const communityId = transientCommunityId ?? (await CommunityFactory.create()).id;
    const membership = await MembershipFactory.create({
      transientUserId: userId,
      transientCommunityId: communityId,
    });
    return {
      membership: {
        connect: {
          userId_communityId: {
            userId: membership.userId,
            communityId: membership.communityId,
          },
        },
      },
      status: transientStatus ?? randomEnum(MembershipStatus),
      reason: transientReason ?? randomEnum(MembershipStatusReason),
      role: transientRole ?? randomEnum(Role),
      createdByUser: { connect: { id: userId } },
    };
  },
});

export const WalletFactory = defineWalletFactory.withTransientFields<{
  transientType?: WalletType;
  transientUserId?: string;
  transientCommunityId?: string;
}>({})({
  defaultData: async ({ transientType, transientUserId, transientCommunityId }) => ({
    type: transientType ?? randomEnum(WalletType),
    user: { connect: { id: transientUserId ?? (await UserFactory.create()).id } },
    community: { connect: { id: transientCommunityId ?? (await CommunityFactory.create()).id } },
  }),
});

// --- Utility & Ticket ---

export const UtilityFactory = defineUtilityFactory.withTransientFields<{
  transientStatus?: PublishStatus;
  transientCommunityId?: string;
}>({})({
  defaultData: async ({ transientStatus, transientCommunityId }) => ({
    name: `Utility ${Math.random().toString(36).substring(2, 6)}`,
    pointsRequired: 10,
    publishStatus: transientStatus ?? randomEnum(PublishStatus),
    community: { connect: { id: transientCommunityId ?? (await CommunityFactory.create()).id } },
  }),
});

export const TicketFactory = defineTicketFactory.withTransientFields<{
  transientStatus?: TicketStatus;
  transientReason?: TicketStatusReason;
  transientWalletId?: string;
  transientUtilityId?: string;
}>({})({
  defaultData: async ({
    transientStatus,
    transientReason,
    transientWalletId,
    transientUtilityId,
  }) => ({
    status: transientStatus ?? randomEnum(TicketStatus),
    reason: transientReason ?? randomEnum(TicketStatusReason),
    wallet: { connect: { id: transientWalletId ?? (await WalletFactory.create()).id } },
    utility: { connect: { id: transientUtilityId ?? (await UtilityFactory.create()).id } },
  }),
});

export const TicketStatusHistoryFactory = defineTicketStatusHistoryFactory.withTransientFields<{
  transientTicketId?: string;
  transientUserId?: string;
}>({})({
  defaultData: async ({ transientTicketId, transientUserId }) => ({
    status: randomEnum(TicketStatus),
    reason: randomEnum(TicketStatusReason),
    ticket: { connect: { id: transientTicketId ?? (await TicketFactory.create()).id } },
    createdByUser: { connect: { id: transientUserId ?? (await UserFactory.create()).id } },
  }),
});

// --- Opportunity & Slot & Reservation ---

export const OpportunityFactory = defineOpportunityFactory.withTransientFields<{
  transientStatus?: PublishStatus;
  transientCategory?: OpportunityCategory;
  transientCommunityId?: string;
  transientUserId?: string;
}>({})({
  defaultData: async ({
    transientStatus,
    transientCategory,
    transientCommunityId,
    transientUserId,
  }) => ({
    title: `Opportunity ${Math.random().toString(36).substring(2, 6)}`,
    publishStatus: transientStatus ?? randomEnum(PublishStatus),
    requireApproval: false,
    category: transientCategory ?? randomEnum(OpportunityCategory),
    description: "Example opportunity",
    community: { connect: { id: transientCommunityId ?? (await CommunityFactory.create()).id } },
    createdByUser: { connect: { id: transientUserId ?? (await UserFactory.create()).id } },
    files: [],
  }),
});

export const OpportunitySlotFactory = defineOpportunitySlotFactory.withTransientFields<{
  transientStatus?: OpportunitySlotHostingStatus;
  transientOpportunityId?: string;
}>({})({
  defaultData: async ({ transientStatus, transientOpportunityId }) => ({
    hostingStatus: transientStatus ?? randomEnum(OpportunitySlotHostingStatus),
    capacity: 10,
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 60 * 60 * 1000),
    opportunity: {
      connect: { id: transientOpportunityId ?? (await OpportunityFactory.create()).id },
    },
  }),
});

export const ReservationFactory = defineReservationFactory.withTransientFields<{
  transientStatus?: ReservationStatus;
  transientSlotId?: string;
  transientUserId?: string;
}>({})({
  defaultData: async ({ transientStatus, transientSlotId, transientUserId }) => ({
    status: transientStatus ?? randomEnum(ReservationStatus),
    opportunitySlot: {
      connect: { id: transientSlotId ?? (await OpportunitySlotFactory.create()).id },
    },
    createdByUser: { connect: { id: transientUserId ?? (await UserFactory.create()).id } },
  }),
});

// --- Article ---

export const ArticleFactory = defineArticleFactory.withTransientFields<{
  transientStatus?: PublishStatus;
  transientCategory?: ArticleCategory;
  transientCommunityId?: string;
  transientAuthorIds?: string[];
  transientRelatedUserIds?: string[];
  transientOpportunityIds?: string[];
}>({})({
  defaultData: async ({
    transientStatus,
    transientCategory,
    transientCommunityId,
    transientAuthorIds,
    transientRelatedUserIds,
    transientOpportunityIds,
  }) => ({
    title: randCatchPhrase(),
    introduction: randParagraph(),
    category: transientCategory ?? randomEnum(ArticleCategory),
    publishStatus: transientStatus ?? randomEnum(PublishStatus),
    body: randParagraph(),
    thumbnail: [
      {
        url: "https://example.com/sample-thumbnail.jpg",
        alt: "sample image",
      },
    ],
    publishedAt: new Date(),
    community: { connect: { id: transientCommunityId ?? (await CommunityFactory.create()).id } },
    authors: {
      connect: transientAuthorIds?.map((id) => ({ id })) ?? [
        { id: (await UserFactory.create()).id },
      ],
    },
    relatedUsers: {
      connect: transientRelatedUserIds?.map((id) => ({ id })) ?? [
        { id: (await UserFactory.create()).id },
      ],
    },
    opportunities: {
      connect: transientOpportunityIds?.map((id) => ({ id })) ?? [
        { id: (await OpportunityFactory.create()).id },
      ],
    },
  }),
});

// --- Participation ---

export const ParticipationFactory = defineParticipationFactory.withTransientFields<{
  transientStatus?: ParticipationStatus;
  transientReason?: ParticipationStatusReason;
  transientSource?: Source;
  transientUserId?: string;
  transientCommunityId?: string;
  transientReservationId?: string;
}>({})({
  defaultData: async ({
    transientStatus,
    transientReason,
    transientSource,
    transientUserId,
    transientCommunityId,
    transientReservationId,
  }) => ({
    status: transientStatus ?? randomEnum(ParticipationStatus),
    reason: transientReason ?? randomEnum(ParticipationStatusReason),
    source: transientSource ?? randomEnum(Source),
    user: { connect: { id: transientUserId ?? (await UserFactory.create()).id } },
    community: { connect: { id: transientCommunityId ?? (await CommunityFactory.create()).id } },
    reservation: {
      connect: { id: transientReservationId ?? (await ReservationFactory.create()).id },
    },
  }),
});

export const ParticipationImageFactory = defineParticipationImageFactory.withTransientFields<{
  transientParticipationId?: string;
}>({})({
  defaultData: async ({ transientParticipationId }) => ({
    url: "https://example.com/image.jpg",
    participation: {
      connect: { id: transientParticipationId ?? (await ParticipationFactory.create()).id },
    },
  }),
});

export const ParticipationStatusHistoryFactory =
  defineParticipationStatusHistoryFactory.withTransientFields<{
    transientParticipationId?: string;
    transientUserId?: string;
  }>({})({
    defaultData: async ({ transientParticipationId, transientUserId }) => ({
      status: randomEnum(ParticipationStatus),
      reason: randomEnum(ParticipationStatusReason),
      participation: {
        connect: { id: transientParticipationId ?? (await ParticipationFactory.create()).id },
      },
      createdByUser: { connect: { id: transientUserId ?? (await UserFactory.create()).id } },
    }),
  });

// --- Evaluation ---

export const EvaluationFactory = defineEvaluationFactory.withTransientFields<{
  transientStatus?: EvaluationStatus;
  transientParticipationId?: string;
  transientUserId?: string;
}>({})({
  defaultData: async ({ transientStatus, transientParticipationId, transientUserId }) => ({
    status: transientStatus ?? randomEnum(EvaluationStatus),
    participation: {
      connect: { id: transientParticipationId ?? (await ParticipationFactory.create()).id },
    },
    evaluator: { connect: { id: transientUserId ?? (await UserFactory.create()).id } },
  }),
});

export const EvaluationHistoryFactory = defineEvaluationHistoryFactory.withTransientFields<{
  transientEvaluationId?: string;
  transientUserId?: string;
}>({})({
  defaultData: async ({ transientEvaluationId, transientUserId }) => ({
    status: randomEnum(EvaluationStatus),
    evaluation: { connect: { id: transientEvaluationId ?? (await EvaluationFactory.create()).id } },
    createdByUser: { connect: { id: transientUserId ?? (await UserFactory.create()).id } },
  }),
});

// --- Transaction ---

export const TransactionFactory = defineTransactionFactory.withTransientFields<{
  transientReason?: TransactionReason;
  transientFromWalletId?: string;
  transientToWalletId?: string;
}>({})({
  defaultData: async ({ transientReason, transientFromWalletId, transientToWalletId }) => ({
    reason: transientReason ?? randomEnum(TransactionReason),
    fromWallet: { connect: { id: transientFromWalletId ?? (await WalletFactory.create()).id } },
    toWallet: { connect: { id: transientToWalletId ?? (await WalletFactory.create()).id } },
    fromPointChange: -10,
    toPointChange: 10,
  }),
});
