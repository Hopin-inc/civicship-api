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
  rand,
  randAirportName,
  randAnimal,
  randCatchPhrase,
  randCity,
  randCountryCode,
  randFullName,
  randNumber,
  randParagraph,
  randPhoneNumber,
  randSlug,
  randState,
  randStreetAddress,
  randUserName,
  randUuid,
} from "@ngneat/falso";
import {
  defineArticleFactory,
  defineCityFactory,
  defineCommunityConfigFactory,
  defineCommunityFactory,
  defineEvaluationFactory,
  defineImageFactory,
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
import * as process from "node:process";

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

const images = [
  "https://storage.googleapis.com/kyoso-dev-civicship-storage-public/images/original/s-1588x1189_v-fms_webp_a528454c-c767-484c-94a2-0b4104c23743.webp",
  "https://storage.googleapis.com/kyoso-dev-civicship-storage-public/images/original/%E3%81%9D%E3%81%86%E3%82%81%E3%82%93%E6%B5%81%E3%81%97%E4%BD%93%E9%A8%93%20%E7%AB%B9%E5%88%87%E3%82%8A%20%E7%AB%B9%E5%89%B2%E3%82%8A%20(1).webp",
  "https://storage.googleapis.com/kyoso-dev-civicship-storage-public/images/original/%E3%81%9D%E3%81%86%E3%82%81%E3%82%93%E6%B5%81%E3%81%97%E4%BD%93%E9%A8%93%20%E7%AB%B9%E5%88%87%E3%82%8A%20%E7%AB%B9%E5%89%B2%E3%82%8A.webp",
  "https://storage.googleapis.com/kyoso-dev-civicship-storage-public/images/original/%E5%A7%AB%E8%B7%AFYMCA%20%E3%83%86%E3%82%99%E3%82%A4%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%95%E3%82%9A%E6%A1%88%E5%86%85%20(1).webp",
  "https://storage.googleapis.com/kyoso-dev-civicship-storage-public/images/original/s-2400x1602_v-frms_webp_69727013-9540-40b9-b660-6bdedf0a82c0_regular.webp",
  "https://storage.googleapis.com/kyoso-dev-civicship-storage-public/images/original/%E5%A7%AB%E8%B7%AFYMCA%20%E3%83%86%E3%82%99%E3%82%A4%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%95%E3%82%9A%E6%A1%88%E5%86%85%20(2).webp",
  "https://storage.googleapis.com/kyoso-dev-civicship-storage-public/images/original/%E5%A7%AB%E8%B7%AFYMCA%20%E3%83%86%E3%82%99%E3%82%A4%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%95%E3%82%9A%E6%A1%88%E5%86%85.webp",
  "https://storage.googleapis.com/kyoso-dev-civicship-storage-public/images/original/2025%20%E5%AD%90%E3%81%A8%E3%82%99%E3%82%82%E4%BC%9A%20%E3%83%86%E3%82%99%E3%82%A4%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%95%E3%82%9A%E6%A1%88%E5%86%85.webp",
];

export const ImageFactory = defineImageFactory({
  defaultData: () => ({
    url: images[Math.floor(Math.random() * images.length)],
  }),
});

// --- User & Community ---

export const CommunityFactory = defineCommunityFactory({
  defaultData: () => ({
    name: randAnimal(),
    pointName: randAirportName(),
  }),
});

export const CommunityConfigFactory = defineCommunityConfigFactory.withTransientFields<{
  transientCommunity?: { id: string };
}>({
  transientCommunity: undefined,
})({
  defaultData: async ({ transientCommunity }) => {
    const community = transientCommunity ?? (await CommunityFactory.create());

    return {
      community: { connect: { id: community.id } },
      firebaseConfig: {
        create: {
          tenantId: process.env.FIREBASE_AUTH_TENANT_ID ?? "",
        },
      },
      lineConfig: {
        create: {
          channelId: process.env.LINE_LIFF_CHANNEL_ID ?? "",
          channelSecret: process.env.LINE_MESSAGING_CHANNEL_SECRET ?? "",
          accessToken: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN ?? "",
          liffId: process.env.LIFF_ID ?? "",
          liffBaseUrl: process.env.LIFF_BASE_URL ?? "",
        },
      },
    };
  },
});

export const UserFactory = defineUserFactory.withTransientFields<{
  transientImage?: { id: string };
}>({
  transientImage: undefined,
})({
  defaultData: async ({ transientImage }) => {
    const image = transientImage ?? (await ImageFactory.create());

    return {
      name: randFullName(),
      slug: randSlug().toLowerCase(),
      phoneNumber: randPhoneNumber(),
      urlInstagram: `https://instagram.com/${randUserName()}`,
      urlX: `https://x.com/${randUserName()}`,
      urlFacebook: `https://facebook.com/${randUserName()}`,
      currentPrefecture: randomEnum(CurrentPrefecture),
      image: { connect: { id: image.id } },
      identities: {
        create: [
          {
            uid: randUuid(),
            platform: IdentityPlatform.LINE,
          },
        ],
      },
    };
  },
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
  transientImage?: { id: string };
}>({
  transientCity: undefined,
  transientCommunity: undefined,
  transientImage: undefined,
})({
  defaultData: async ({ transientCity, transientCommunity, transientImage }) => {
    const city = transientCity ?? (await CityFactory.create());
    const community = transientCommunity ?? (await CommunityFactory.create());
    const image = transientImage ?? (await ImageFactory.create());

    return {
      name: randCity(),
      address: randStreetAddress(),
      isManual: true,
      city: { connect: { code: city.code } },
      community: { connect: { id: community.id } },
      image: { connect: { id: image.id } },
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
      headline: randAnimal(),
      bio: randParagraph({ length: 3 }).join("\n\n"),
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
  transientImages?: { id: string }[];
}>({
  transientCommunity: undefined,
  transientImages: undefined,
})({
  defaultData: async ({ transientCommunity, transientImages }) => {
    const community = transientCommunity ?? (await CommunityFactory.create());
    const images = transientImages ?? (await ImageFactory.createList(3));

    return {
      name: randAnimal(),
      pointsRequired: randNumber({ min: 1000, max: 5000 }),
      publishStatus: rand([
        PublishStatus.PUBLIC,
        PublishStatus.PUBLIC,
        PublishStatus.PUBLIC,
        PublishStatus.COMMUNITY_INTERNAL,
        PublishStatus.PRIVATE,
      ]),
      community: { connect: { id: community.id } },
      images: {
        connect: images.map((image) => ({ id: image.id })),
      },
    };
  },
});

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
  transientImages?: { id: string }[];
  transientUtilities?: { id: string }[];
}>({
  transientUser: undefined,
  transientCommunity: undefined,
  transientPlace: undefined,
  transientStatus: undefined,
  transientCategory: undefined,
  transientImages: undefined,
  transientUtilities: undefined,
})({
  defaultData: async ({
    transientUser,
    transientCommunity,
    transientPlace,
    transientStatus,
    transientCategory,
    transientImages,
    transientUtilities,
  }) => {
    const user = transientUser ?? (await UserFactory.create());
    const community = transientCommunity ?? (await CommunityFactory.create());
    const place = transientPlace ?? (await PlaceFactory.create({ transientCommunity: community }));
    const images = transientImages ?? (await ImageFactory.createList(3));
    const utilities = transientUtilities ?? (await UtilityFactory.createList(3));

    return {
      title: randCatchPhrase(),
      description: randParagraph({ length: 1 }).join("\n\n"),
      body: randParagraph({ length: 10 }).join("\n\n"),
      publishStatus:
        transientStatus ??
        rand([
          PublishStatus.PUBLIC,
          PublishStatus.PUBLIC,
          PublishStatus.PUBLIC,
          PublishStatus.COMMUNITY_INTERNAL,
          PublishStatus.PRIVATE,
        ]),
      requireApproval: true,
      feeRequired: randNumber({ min: 1000, max: 5000 }),
      pointsToEarn: 0,
      category:
        transientCategory ??
        rand([
          OpportunityCategory.ACTIVITY,
          OpportunityCategory.ACTIVITY,
          OpportunityCategory.ACTIVITY,
          OpportunityCategory.ACTIVITY,
          OpportunityCategory.QUEST,
        ]),
      community: { connect: { id: community.id } },
      createdByUser: { connect: { id: user.id } },
      place: { connect: { id: place.id } },
      images: {
        connect: images.map((image) => ({ id: image.id })),
      },
      requiredUtilities: {
        connect: utilities.map((utility) => ({ id: utility.id })),
      },
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
    const offsetDays = randNumber({ min: -7, max: 14 }); // -14日〜+14日（今日±2週間）
    const startsAt = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000); // +1時間

    let hostingStatus: OpportunitySlotHostingStatus;

    // 未来の日時であれば、Scheduled または Cancelled
    if (startsAt > new Date()) {
      hostingStatus =
        transientStatus ??
        rand([OpportunitySlotHostingStatus.SCHEDULED, OpportunitySlotHostingStatus.CANCELLED]);
    }
    // 過去の日時であれば、Completed または Cancelled
    else {
      hostingStatus =
        transientStatus ??
        rand([OpportunitySlotHostingStatus.CANCELLED, OpportunitySlotHostingStatus.COMPLETED]);
    }

    return {
      opportunity: { connect: { id: opportunity.id } },
      hostingStatus,
      capacity: randNumber({ min: 1, max: 30 }),
      startsAt,
      endsAt,
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
  transientImages?: { id: string }[];
  transientStatus?: ParticipationStatus;
  transientReason?: ParticipationStatusReason;
  transientSource?: Source;
}>({
  transientUser: undefined,
  transientReservation: undefined,
  transientCommunity: undefined,
  transientImages: undefined,
  transientStatus: undefined,
  transientReason: undefined,
  transientSource: undefined,
})({
  defaultData: async ({
    transientUser,
    transientReservation,
    transientCommunity,
    transientImages,
    transientStatus,
    transientReason,
    transientSource,
  }) => {
    const user = transientUser ?? (await UserFactory.create());
    const reservation = transientReservation ?? (await ReservationFactory.create());
    const community = transientCommunity ?? (await CommunityFactory.create());
    const images = transientImages ?? (await ImageFactory.createList(3));

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
        connect: images.map((image) => ({ id: image.id })),
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
  transientThumbnail?: { id: string };
}>({
  transientCommunity: undefined,
  transientAuthor: undefined,
  transientRelatedUsers: undefined,
  transientOpportunity: undefined,
  transientStatus: undefined,
  transientCategory: undefined,
  transientThumbnail: undefined,
})({
  defaultData: async ({
    transientCommunity,
    transientAuthor,
    transientRelatedUsers,
    transientOpportunity,
    transientStatus,
    transientCategory,
    transientThumbnail,
  }) => {
    const community = transientCommunity ?? (await CommunityFactory.create());
    const author = transientAuthor ?? (await UserFactory.create());
    const relatedUsers = transientRelatedUsers ?? [await UserFactory.create()];
    const opportunity = transientOpportunity ?? (await OpportunityFactory.create());
    const thumbnail = transientThumbnail ?? (await ImageFactory.create());

    return {
      title: randCatchPhrase(),
      introduction: randParagraph(),
      body: randParagraph({ length: 10 }).join("\n\n"),
      category: transientCategory ?? randomEnum(ArticleCategory),
      publishStatus:
        transientStatus ??
        rand([
          PublishStatus.PUBLIC,
          PublishStatus.PUBLIC,
          PublishStatus.PUBLIC,
          PublishStatus.COMMUNITY_INTERNAL,
          PublishStatus.PRIVATE,
        ]),
      thumbnail: { connect: { id: thumbnail.id } },
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
