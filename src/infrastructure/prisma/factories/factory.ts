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
  Prisma,
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
  randAirportName,
  randAnimal,
  randCatchPhrase,
  randCity,
  randCountryCode,
  randFullName,
  randImg,
  randParagraph,
  randSlug,
  randState,
  randStreetAddress,
  randUuid,
} from "@ngneat/falso";
import {
  defineArticleFactory,
  defineCityFactory,
  defineCommunityFactory,
  defineEvaluationFactory,
  defineMembershipFactory,
  defineOpportunityFactory,
  defineOpportunitySlotFactory,
  defineParticipationFactory,
  definePlaceFactory,
  defineReservationFactory,
  defineStateFactory,
  defineTicketFactory,
  defineTransactionFactory,
  defineUserFactory,
  defineUtilityFactory,
  defineWalletFactory,
  initialize,
} from "@/infrastructure/prisma/factories/__generated__";
import { prismaClient } from "@/infrastructure/prisma/client";
import { randomEnum } from "@/infrastructure/prisma/factories/helper";
import { registerScalarFieldValueGenerator } from "@quramy/prisma-fabbrica";

registerScalarFieldValueGenerator({
  Decimal: ({ modelName, fieldName }) => {
    if (modelName === "Place") {
      if (fieldName === "latitude") {
        const minLat = 32.7;
        const maxLat = 34.4;
        const latitude = Math.random() * (maxLat - minLat) + minLat;
        return new Prisma.Decimal(latitude.toFixed(6));
      }
      if (fieldName === "longitude") {
        const minLng = 132.5;
        const maxLng = 134.6;
        const longitude = Math.random() * (maxLng - minLng) + minLng;
        return new Prisma.Decimal(longitude.toFixed(6));
      }
    }
    return new Prisma.Decimal(0);
  },
});

initialize({ prisma: prismaClient });

// --- User & Community ---

export const CommunityFactory = defineCommunityFactory({
  defaultData: () => ({
    name: randAnimal(),
    pointName: randAirportName(),
  }),
});

export const UserFactory = defineUserFactory({
  defaultData: () => ({
    name: randFullName(),
    slug: randSlug().toLowerCase(),
    currentPrefecture: randomEnum(CurrentPrefecture),
    identities: {
      create: [
        {
          uid: randUuid(),
          platform: IdentityPlatform.LINE,
        },
      ],
    },
  }),
});

// --- State Factory ---
export const StateFactory = defineStateFactory.withTransientFields<{
  transientCountryCode?: string;
}>({
  transientCountryCode: undefined,
})({
  defaultData: ({ transientCountryCode }) => {
    const countryCode = transientCountryCode ?? randCountryCode();
    return {
      code: randUuid(),
      name: randState(),
      countryCode,
    };
  },
});

// --- City Factory ---
export const CityFactory = defineCityFactory.withTransientFields<{
  transientState?: { code: string; countryCode: string };
}>({
  transientState: undefined,
})({
  defaultData: async ({ transientState }) => {
    const state = transientState ?? (await StateFactory.create());

    return {
      code: randUuid(),
      name: randCity(),
      state: {
        connect: {
          code_countryCode: {
            code: state.code,
            countryCode: state.countryCode,
          },
          code: state.code,
          countryCode: state.countryCode,
        },
      },
    };
  },
});

// --- Place Factory ---
export const PlaceFactory = definePlaceFactory.withTransientFields<{
  transientCity?: { code: string };
  transientCommunity?: { id: string };
}>({
  transientCity: undefined,
  transientCommunity: undefined,
})({
  defaultData: async ({ transientCity, transientCommunity }) => {
    const city = transientCity ?? (await CityFactory.create());
    const community = transientCommunity ?? (await CommunityFactory.create());

    return {
      name: randCity() + "会場",
      address: randStreetAddress(),
      isManual: true,
      city: { connect: { code: city.code } },
      community: { connect: { id: community.id } },
    };
  },
});

export const MembershipFactory = defineMembershipFactory.withTransientFields<{
  transientUser?: { id: string };
  transientCommunity?: { id: string };
  transientStatus?: MembershipStatus;
  transientReason?: MembershipStatusReason;
  transientRole?: Role;
}>({
  transientUser: undefined,
  transientCommunity: undefined,
  transientStatus: undefined,
  transientReason: undefined,
  transientRole: undefined,
})({
  defaultData: async ({
    transientUser,
    transientCommunity,
    transientStatus,
    transientReason,
    transientRole,
  }) => {
    const user = transientUser ?? (await UserFactory.create());
    const community = transientCommunity ?? (await CommunityFactory.create());
    const status = transientStatus ?? randomEnum(MembershipStatus);
    const reason = transientReason ?? randomEnum(MembershipStatusReason);
    const role = transientRole ?? randomEnum(Role);

    return {
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
      status,
      reason,
      role,
      histories: {
        create: [{ status, reason, role, createdByUser: { connect: { id: user.id } } }],
      },
    };
  },
});

export const WalletFactory = defineWalletFactory.withTransientFields<{
  transientUser?: { id: string };
  transientCommunity?: { id: string };
  transientType?: WalletType;
}>({
  transientUser: undefined,
  transientCommunity: undefined,
  transientType: undefined,
})({
  defaultData: async ({ transientUser, transientCommunity, transientType }) => {
    const user = transientUser ?? (await UserFactory.create());
    const community = transientCommunity ?? (await CommunityFactory.create());

    return {
      user: { connect: { id: user.id } },
      community: { connect: { id: community.id } },
      type: transientType ?? randomEnum(WalletType),
    };
  },
});

export const UtilityFactory = defineUtilityFactory.withTransientFields<{
  transientCommunity?: { id: string };
}>({
  transientCommunity: undefined,
})({
  defaultData: async ({ transientCommunity }) => {
    const community = transientCommunity ?? (await CommunityFactory.create());

    return {
      name: randAnimal(),
      pointsRequired: 10,
      publishStatus: randomEnum(PublishStatus),
      community: { connect: { id: community.id } },
    };
  },
});

// ✨ Transient fields に全て default 値を明示的に設定した Factory 群

export const TicketFactory = defineTicketFactory.withTransientFields<{
  transientWallet?: { id: string };
  transientUtility?: { id: string };
  transientUser?: { id: string };
  transientStatus?: TicketStatus;
  transientReason?: TicketStatusReason;
}>({
  transientWallet: undefined,
  transientUtility: undefined,
  transientUser: undefined,
  transientStatus: undefined,
  transientReason: undefined,
})({
  defaultData: async ({
    transientWallet,
    transientUtility,
    transientUser,
    transientStatus,
    transientReason,
  }) => {
    const wallet = transientWallet ?? (await WalletFactory.create());
    const utility = transientUtility ?? (await UtilityFactory.create());
    const user = transientUser ?? (await UserFactory.create());
    const status = transientStatus ?? randomEnum(TicketStatus);
    const reason = transientReason ?? randomEnum(TicketStatusReason);

    return {
      status,
      reason,
      wallet: { connect: { id: wallet.id } },
      utility: { connect: { id: utility.id } },
      ticketStatusHistories: {
        create: [
          {
            status,
            reason,
            createdByUser: { connect: { id: user.id } },
          },
        ],
      },
    };
  },
});

export const OpportunityFactory = defineOpportunityFactory.withTransientFields<{
  transientUser?: { id: string };
  transientCommunity?: { id: string };
  transientPlace?: { id: string };
  transientStatus?: PublishStatus;
  transientCategory?: OpportunityCategory;
}>({
  transientUser: undefined,
  transientCommunity: undefined,
  transientPlace: undefined,
  transientStatus: undefined,
  transientCategory: undefined,
})({
  defaultData: async ({
    transientUser,
    transientCommunity,
    transientPlace,
    transientStatus,
    transientCategory,
  }) => {
    const user = transientUser ?? (await UserFactory.create());
    const community = transientCommunity ?? (await CommunityFactory.create());
    const place = transientPlace ?? (await PlaceFactory.create({ transientCommunity: community }));

    return {
      title: randCatchPhrase(),
      description: randParagraph({ length: 3 }).join("\n\n"),
      publishStatus: transientStatus ?? randomEnum(PublishStatus),
      requireApproval: false,
      category: transientCategory ?? randomEnum(OpportunityCategory),
      community: { connect: { id: community.id } },
      createdByUser: { connect: { id: user.id } },
      place: { connect: { id: place.id } },
    };
  },
});

export const OpportunitySlotFactory = defineOpportunitySlotFactory.withTransientFields<{
  transientOpportunity?: { id: string };
  transientStatus?: OpportunitySlotHostingStatus;
}>({
  transientOpportunity: undefined,
  transientStatus: undefined,
})({
  defaultData: async ({ transientOpportunity, transientStatus }) => {
    const opportunity = transientOpportunity ?? (await OpportunityFactory.create());

    return {
      opportunity: { connect: { id: opportunity.id } },
      hostingStatus: transientStatus ?? randomEnum(OpportunitySlotHostingStatus),
      capacity: 10,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  },
});

export const ReservationFactory = defineReservationFactory.withTransientFields<{
  transientSlot?: { id: string };
  transientUser?: { id: string };
  transientStatus?: ReservationStatus;
}>({
  transientSlot: undefined,
  transientUser: undefined,
  transientStatus: undefined,
})({
  defaultData: async ({ transientSlot, transientUser, transientStatus }) => {
    const slot = transientSlot ?? (await OpportunitySlotFactory.create());
    const user = transientUser ?? (await UserFactory.create());
    const status = transientStatus ?? randomEnum(ReservationStatus);

    return {
      opportunitySlot: { connect: { id: slot.id } },
      createdByUser: { connect: { id: user.id } },
      status,
      histories: {
        create: [
          {
            status,
            createdByUser: { connect: { id: user.id } },
          },
        ],
      },
    };
  },
});

export const ParticipationFactory = defineParticipationFactory.withTransientFields<{
  transientUser?: { id: string };
  transientReservation?: { id: string };
  transientCommunity?: { id: string };
  transientStatus?: ParticipationStatus;
  transientReason?: ParticipationStatusReason;
  transientSource?: Source;
}>({
  transientUser: undefined,
  transientReservation: undefined,
  transientCommunity: undefined,
  transientStatus: undefined,
  transientReason: undefined,
  transientSource: undefined,
})({
  defaultData: async ({
    transientUser,
    transientReservation,
    transientCommunity,
    transientStatus,
    transientReason,
    transientSource,
  }) => {
    const user = transientUser ?? (await UserFactory.create());
    const reservation = transientReservation ?? (await ReservationFactory.create());
    const community = transientCommunity ?? (await CommunityFactory.create());

    const status = transientStatus ?? randomEnum(ParticipationStatus);
    const reason = transientReason ?? randomEnum(ParticipationStatusReason);
    const source = transientSource ?? randomEnum(Source);

    return {
      user: { connect: { id: user.id } },
      reservation: { connect: { id: reservation.id } },
      community: { connect: { id: community.id } },
      status,
      reason,
      source,
      statusHistories: {
        create: [
          {
            status,
            reason,
            createdByUser: { connect: { id: user.id } },
          },
        ],
      },
      images: {
        create: [
          {
            url: randImg(),
          },
        ],
      },
    };
  },
});

export const EvaluationFactory = defineEvaluationFactory.withTransientFields<{
  transientParticipation?: { id: string };
  transientUser?: { id: string };
  transientStatus?: EvaluationStatus;
}>({
  transientParticipation: undefined,
  transientUser: undefined,
  transientStatus: undefined,
})({
  defaultData: async ({ transientParticipation, transientUser, transientStatus }) => {
    const participation = transientParticipation ?? (await ParticipationFactory.create());
    const user = transientUser ?? (await UserFactory.create());
    const status = transientStatus ?? randomEnum(EvaluationStatus);

    return {
      status,
      participation: { connect: { id: participation.id } },
      evaluator: { connect: { id: user.id } },
      histories: {
        create: [
          {
            status,
            createdByUser: { connect: { id: user.id } },
          },
        ],
      },
    };
  },
});

export const ArticleFactory = defineArticleFactory.withTransientFields<{
  transientCommunity?: { id: string };
  transientAuthor?: { id: string };
  transientRelatedUsers?: { id: string }[];
  transientOpportunity?: { id: string };
  transientStatus?: PublishStatus;
  transientCategory?: ArticleCategory;
}>({
  transientCommunity: undefined,
  transientAuthor: undefined,
  transientRelatedUsers: undefined,
  transientOpportunity: undefined,
  transientStatus: undefined,
  transientCategory: undefined,
})({
  defaultData: async ({
    transientCommunity,
    transientAuthor,
    transientRelatedUsers,
    transientOpportunity,
    transientStatus,
    transientCategory,
  }) => {
    const community = transientCommunity ?? (await CommunityFactory.create());
    const author = transientAuthor ?? (await UserFactory.create());
    const relatedUsers = transientRelatedUsers ?? [await UserFactory.create()];
    const opportunity = transientOpportunity ?? (await OpportunityFactory.create());

    return {
      title: randCatchPhrase(),
      introduction: randParagraph(),
      category: transientCategory ?? randomEnum(ArticleCategory),
      publishStatus: transientStatus ?? randomEnum(PublishStatus),
      body: randParagraph(),
      thumbnail: [
        {
          url: randImg(),
          alt: "sample image",
        },
      ],
      publishedAt: new Date(),
      community: { connect: { id: community.id } },
      authors: { connect: [{ id: author.id }] },
      relatedUsers: { connect: relatedUsers.map((user) => ({ id: user.id })) },
      opportunities: { connect: [{ id: opportunity.id }] },
    };
  },
});

export const TransactionFactory = defineTransactionFactory.withTransientFields<{
  transientFromWallet?: { id: string };
  transientToWallet?: { id: string };
  transientReason?: TransactionReason;
}>({
  transientFromWallet: undefined,
  transientToWallet: undefined,
  transientReason: undefined,
})({
  defaultData: async ({ transientFromWallet, transientToWallet, transientReason }) => {
    const fromWallet = transientFromWallet ?? (await WalletFactory.create());
    const toWallet = transientToWallet ?? (await WalletFactory.create());
    return {
      reason: transientReason ?? randomEnum(TransactionReason),
      fromWallet: { connect: { id: fromWallet.id } },
      toWallet: { connect: { id: toWallet.id } },
      fromPointChange: -10,
      toPointChange: 10,
    };
  },
});
