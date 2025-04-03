import {
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
import { randAnimal, randFirstName, randLastName } from "@ngneat/falso";
import {
  defineCommunityFactory,
  defineEvaluationFactory,
  defineEvaluationHistoryFactory,
  defineIdentityFactory,
  defineMembershipFactory,
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

export const IdentityFactory = defineIdentityFactory({
  defaultData: () => ({
    platform: randomEnum(IdentityPlatform),
    user: UserFactory,
  }),
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
}>({})({
  defaultData: ({ transientRole, transientStatus, transientReason }) => ({
    user: UserFactory,
    community: CommunityFactory,
    status: transientStatus ?? randomEnum(MembershipStatus),
    reason: transientReason ?? randomEnum(MembershipStatusReason),
    role: transientRole ?? randomEnum(Role),
    // histories: {
    //   create: [
    //     {
    //       status: transientStatus ?? randomEnum(MembershipStatus),
    //       reason: transientReason ?? randomEnum(MembershipStatusReason),
    //       createdByUser: UserFactory,
    //     },
    //   ],
    // },
  }),
});

export const WalletFactory = defineWalletFactory.withTransientFields<{
  transientType?: WalletType;
}>({})({
  defaultData: ({ transientType }) => ({
    type: transientType ?? randomEnum(WalletType),
    user: UserFactory,
    community: CommunityFactory,
  }),
});

export const UtilityFactory = defineUtilityFactory.withTransientFields<{
  transientStatus?: PublishStatus;
}>({})({
  defaultData: ({ transientStatus }) => ({
    name: `Utility ${Math.random().toString(36).substring(2, 6)}`,
    pointsRequired: 10,
    publishStatus: transientStatus ?? randomEnum(PublishStatus),
    community: CommunityFactory,
  }),
});

// --- Ticket ---

export const TicketFactory = defineTicketFactory.withTransientFields<{
  transientStatus?: TicketStatus;
  transientReason?: TicketStatusReason;
}>({})({
  defaultData: ({ transientStatus, transientReason }) => ({
    status: transientStatus ?? randomEnum(TicketStatus),
    reason: transientReason ?? randomEnum(TicketStatusReason),
    wallet: WalletFactory,
    utility: UtilityFactory,
  }),
});

export const TicketStatusHistoryFactory = defineTicketStatusHistoryFactory({
  defaultData: () => ({
    status: randomEnum(TicketStatus),
    reason: randomEnum(TicketStatusReason),
    ticket: TicketFactory,
    createdByUser: UserFactory,
  }),
});

// --- Opportunity & Slot & Reservation ---

export const OpportunityFactory = defineOpportunityFactory.withTransientFields<{
  transientStatus?: PublishStatus;
  transientCategory?: OpportunityCategory;
}>({})({
  defaultData: ({ transientStatus, transientCategory }) => ({
    title: `Opportunity ${Math.random().toString(36).substring(2, 6)}`,
    publishStatus: transientStatus ?? randomEnum(PublishStatus),
    requireApproval: false,
    category: transientCategory ?? randomEnum(OpportunityCategory),
    description: "Example opportunity",
    community: CommunityFactory,
    createdByUser: UserFactory,
    files: [],
  }),
});

export const OpportunitySlotFactory = defineOpportunitySlotFactory.withTransientFields<{
  transientStatus?: OpportunitySlotHostingStatus;
}>({})({
  defaultData: ({ transientStatus }) => ({
    hostingStatus: transientStatus ?? randomEnum(OpportunitySlotHostingStatus),
    capacity: 10,
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 60 * 60 * 1000),
    opportunity: OpportunityFactory,
  }),
});

export const ReservationFactory = defineReservationFactory.withTransientFields<{
  transientStatus?: ReservationStatus;
}>({})({
  defaultData: ({ transientStatus }) => ({
    status: transientStatus ?? randomEnum(ReservationStatus),
    opportunitySlot: OpportunitySlotFactory,
    createdByUser: UserFactory,
  }),
});

// --- Participation ---

export const ParticipationFactory = defineParticipationFactory.withTransientFields<{
  transientStatus?: ParticipationStatus;
  transientReason?: ParticipationStatusReason;
  transientSource?: Source;
}>({})({
  defaultData: ({ transientStatus, transientReason, transientSource }) => ({
    status: transientStatus ?? randomEnum(ParticipationStatus),
    reason: transientReason ?? randomEnum(ParticipationStatusReason),
    source: transientSource ?? randomEnum(Source),
    user: UserFactory,
    community: CommunityFactory,
    reservation: ReservationFactory,
  }),
});

export const ParticipationImageFactory = defineParticipationImageFactory({
  defaultData: () => ({
    url: "https://example.com/image.jpg",
    participation: ParticipationFactory,
  }),
});

export const ParticipationStatusHistoryFactory = defineParticipationStatusHistoryFactory({
  defaultData: () => ({
    status: randomEnum(ParticipationStatus),
    reason: randomEnum(ParticipationStatusReason),
    participation: ParticipationFactory,
    createdByUser: UserFactory,
  }),
});

// --- Evaluation ---

export const EvaluationFactory = defineEvaluationFactory.withTransientFields<{
  transientStatus?: EvaluationStatus;
}>({})({
  defaultData: ({ transientStatus }) => ({
    status: transientStatus ?? randomEnum(EvaluationStatus),
    participation: ParticipationFactory,
    evaluator: UserFactory,
  }),
});

export const EvaluationHistoryFactory = defineEvaluationHistoryFactory({
  defaultData: () => ({
    status: randomEnum(EvaluationStatus),
    evaluation: EvaluationFactory,
    createdByUser: UserFactory,
  }),
});

// --- Transaction ---

export const TransactionFactory = defineTransactionFactory.withTransientFields<{
  transientReason?: TransactionReason;
}>({})({
  defaultData: ({ transientReason }) => ({
    reason: transientReason ?? randomEnum(TransactionReason),
    fromWallet: WalletFactory,
    toWallet: WalletFactory,
    fromPointChange: -10,
    toPointChange: 10,
  }),
});
