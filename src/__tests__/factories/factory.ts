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

const now = new Date();
const isNow = Math.random() < 0.5;

const startsAt = isNow
  ? now
  : new Date(now.getTime() + 1000 * 60 * 60 * 24 * (1 + Math.floor(Math.random() * 5))); // 明日〜5日後

const endsAt = new Date(startsAt.getTime() + 1000 * 60 * 60); // +1時間

const COMMUNITY_ID = "DEMO";

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
  defaultData: async ({ transientUserId }) => ({
    uid: randUuid(),
    platform: IdentityPlatform.LINE,
    user: { connect: { id: transientUserId ?? (await UserFactory.create()).id } },
  }),
});

export const CommunityFactory = defineCommunityFactory({
  defaultData: () => ({
    id: COMMUNITY_ID,
    name: randAnimal(),
    pointName: `point-${Math.random().toString(36).substring(2, 6)}`,
  }),
});

// --- Membership & Wallet ---

export const MembershipFactory = defineMembershipFactory.withTransientFields<{
  transientRole?: Role;
  transientStatus?: MembershipStatus;
  transientReason?: MembershipStatusReason;
}>({})({
  defaultData: async ({ transientRole, transientStatus, transientReason }) => ({
    user: { connect: { id: (await UserFactory.create()).id } },
    community: { connect: { id: COMMUNITY_ID } },
    status: transientStatus ?? randomEnum(MembershipStatus),
    reason: transientReason ?? randomEnum(MembershipStatusReason),
    role: transientRole ?? randomEnum(Role),
  }),
});

export const MembershipHistoryFactory = defineMembershipHistoryFactory.withTransientFields<{
  transientStatus?: MembershipStatus;
  transientReason?: MembershipStatusReason;
  transientRole?: Role;
}>({})({
  defaultData: async ({ transientStatus, transientReason, transientRole }) => {
    const membership = await MembershipFactory.create();
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
      createdByUser: { connect: { id: (await UserFactory.create()).id } },
    };
  },
});

export const WalletFactory = defineWalletFactory.withTransientFields<{
  transientType?: WalletType;
}>({})({
  defaultData: async ({ transientType }) => ({
    type: transientType ?? randomEnum(WalletType),
    user: { connect: { id: (await UserFactory.create()).id } },
    community: { connect: { id: COMMUNITY_ID } },
  }),
});

// --- Utility & Ticket ---

export const UtilityFactory = defineUtilityFactory.withTransientFields<{
  transientStatus?: PublishStatus;
}>({})({
  defaultData: async ({ transientStatus }) => ({
    name: `Utility ${Math.random().toString(36).substring(2, 6)}`,
    pointsRequired: 10,
    publishStatus: transientStatus ?? randomEnum(PublishStatus),
    community: { connect: { id: COMMUNITY_ID } },
  }),
});

export const TicketFactory = defineTicketFactory.withTransientFields<{
  transientStatus?: TicketStatus;
  transientReason?: TicketStatusReason;
}>({})({
  defaultData: async ({ transientStatus, transientReason }) => ({
    status: transientStatus ?? randomEnum(TicketStatus),
    reason: transientReason ?? randomEnum(TicketStatusReason),
    wallet: { connect: { id: (await WalletFactory.create()).id } },
    utility: { connect: { id: (await UtilityFactory.create()).id } },
  }),
});

export const TicketStatusHistoryFactory = defineTicketStatusHistoryFactory({
  defaultData: async () => ({
    status: randomEnum(TicketStatus),
    reason: randomEnum(TicketStatusReason),
    ticket: { connect: { id: (await TicketFactory.create()).id } },
    createdByUser: { connect: { id: (await UserFactory.create()).id } },
  }),
});

// --- Opportunity & Slot & Reservation ---

export const OpportunityFactory = defineOpportunityFactory.withTransientFields<{
  transientStatus?: PublishStatus;
  transientCategory?: OpportunityCategory;
}>({})({
  defaultData: async ({ transientStatus, transientCategory }) => ({
    title: `Opportunity ${Math.random().toString(36).substring(2, 6)}`,
    publishStatus: transientStatus ?? randomEnum(PublishStatus),
    requireApproval: false,
    category: transientCategory ?? randomEnum(OpportunityCategory),
    description: "Example opportunity",
    community: { connect: { id: COMMUNITY_ID } },
    createdByUser: { connect: { id: (await UserFactory.create()).id } },
    files: [],
  }),
});

export const OpportunitySlotFactory = defineOpportunitySlotFactory.withTransientFields<{
  transientStatus?: OpportunitySlotHostingStatus;
}>({})({
  defaultData: async ({ transientStatus }) => ({
    hostingStatus: transientStatus ?? randomEnum(OpportunitySlotHostingStatus),
    capacity: 10,
    startsAt,
    endsAt,
    opportunity: { connect: { id: (await OpportunityFactory.create()).id } },
  }),
});

export const ReservationFactory = defineReservationFactory.withTransientFields<{
  transientStatus?: ReservationStatus;
}>({})({
  defaultData: async ({ transientStatus }) => ({
    status: transientStatus ?? randomEnum(ReservationStatus),
    opportunitySlot: { connect: { id: (await OpportunitySlotFactory.create()).id } },
    createdByUser: { connect: { id: (await UserFactory.create()).id } },
  }),
});

// --- Article ---

export const ArticleFactory = defineArticleFactory.withTransientFields<{
  transientStatus?: PublishStatus;
  transientCategory?: ArticleCategory;
}>({})({
  defaultData: async ({ transientStatus, transientCategory }) => ({
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
    community: { connect: { id: COMMUNITY_ID } },
    authors: { connect: [{ id: (await UserFactory.create()).id }] },
    relatedUsers: { connect: [{ id: (await UserFactory.create()).id }] },
    opportunities: { connect: [{ id: (await OpportunityFactory.create()).id }] },
  }),
});

// --- Participation ---

export const ParticipationFactory = defineParticipationFactory.withTransientFields<{
  transientStatus?: ParticipationStatus;
  transientReason?: ParticipationStatusReason;
  transientSource?: Source;
}>({})({
  defaultData: async ({ transientStatus, transientReason, transientSource }) => ({
    status: transientStatus ?? randomEnum(ParticipationStatus),
    reason: transientReason ?? randomEnum(ParticipationStatusReason),
    source: transientSource ?? randomEnum(Source),
    user: { connect: { id: (await UserFactory.create()).id } },
    community: { connect: { id: COMMUNITY_ID } },
    reservation: { connect: { id: (await ReservationFactory.create()).id } },
  }),
});

export const ParticipationImageFactory = defineParticipationImageFactory({
  defaultData: async () => ({
    url: "https://example.com/image.jpg",
    participation: { connect: { id: (await ParticipationFactory.create()).id } },
  }),
});

export const ParticipationStatusHistoryFactory = defineParticipationStatusHistoryFactory({
  defaultData: async () => ({
    status: randomEnum(ParticipationStatus),
    reason: randomEnum(ParticipationStatusReason),
    participation: { connect: { id: (await ParticipationFactory.create()).id } },
    createdByUser: { connect: { id: (await UserFactory.create()).id } },
  }),
});

// --- Evaluation ---

export const EvaluationFactory = defineEvaluationFactory.withTransientFields<{
  transientStatus?: EvaluationStatus;
}>({})({
  defaultData: async ({ transientStatus }) => ({
    status: transientStatus ?? randomEnum(EvaluationStatus),
    participation: { connect: { id: (await ParticipationFactory.create()).id } },
    evaluator: { connect: { id: (await UserFactory.create()).id } },
  }),
});

export const EvaluationHistoryFactory = defineEvaluationHistoryFactory({
  defaultData: async () => ({
    status: randomEnum(EvaluationStatus),
    evaluation: { connect: { id: (await EvaluationFactory.create()).id } },
    createdByUser: { connect: { id: (await UserFactory.create()).id } },
  }),
});

// --- Transaction ---

export const TransactionFactory = defineTransactionFactory.withTransientFields<{
  transientReason?: TransactionReason;
}>({})({
  defaultData: async ({ transientReason }) => ({
    reason: transientReason ?? randomEnum(TransactionReason),
    fromWallet: { connect: { id: (await WalletFactory.create()).id } },
    toWallet: { connect: { id: (await WalletFactory.create()).id } },
    fromPointChange: -10,
    toPointChange: 10,
  }),
});
