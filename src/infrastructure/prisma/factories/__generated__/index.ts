import type { Image } from "@prisma/client";
import type { State } from "@prisma/client";
import type { City } from "@prisma/client";
import type { Place } from "@prisma/client";
import type { Community } from "@prisma/client";
import type { CommunityConfig } from "@prisma/client";
import type { CommunityFirebaseConfig } from "@prisma/client";
import type { CommunityLineConfig } from "@prisma/client";
import type { CommunityLineRichMenuConfig } from "@prisma/client";
import type { User } from "@prisma/client";
import type { Identity } from "@prisma/client";
import type { DidIssuanceRequest } from "@prisma/client";
import type { VcIssuanceRequest } from "@prisma/client";
import type { Membership } from "@prisma/client";
import type { MembershipHistory } from "@prisma/client";
import type { Wallet } from "@prisma/client";
import type { Article } from "@prisma/client";
import type { Opportunity } from "@prisma/client";
import type { OpportunitySlot } from "@prisma/client";
import type { Reservation } from "@prisma/client";
import type { ReservationHistory } from "@prisma/client";
import type { Participation } from "@prisma/client";
import type { ParticipationStatusHistory } from "@prisma/client";
import type { Evaluation } from "@prisma/client";
import type { EvaluationHistory } from "@prisma/client";
import type { Utility } from "@prisma/client";
import type { TicketIssuer } from "@prisma/client";
import type { TicketClaimLink } from "@prisma/client";
import type { Ticket } from "@prisma/client";
import type { TicketStatusHistory } from "@prisma/client";
import type { Transaction } from "@prisma/client";
import type { ApiKey } from "@prisma/client";
import type { NftWallet } from "@prisma/client";
import type { NftToken } from "@prisma/client";
import type { NftInstance } from "@prisma/client";
import type { NftMint } from "@prisma/client";
import type { Order } from "@prisma/client";
import type { OrderItem } from "@prisma/client";
import type { PaymentEvent } from "@prisma/client";
import type { Product } from "@prisma/client";
import type { NftProduct } from "@prisma/client";
import type { PlacePublicOpportunityCountView } from "@prisma/client";
import type { PlaceAccumulatedParticipantsView } from "@prisma/client";
import type { MembershipParticipationGeoView } from "@prisma/client";
import type { MembershipParticipationCountView } from "@prisma/client";
import type { MembershipHostedOpportunityCountView } from "@prisma/client";
import type { CurrentPointView } from "@prisma/client";
import type { AccumulatedPointView } from "@prisma/client";
import type { EarliestReservableSlotView } from "@prisma/client";
import type { OpportunityAccumulatedParticipantsView } from "@prisma/client";
import type { RemainingCapacityView } from "@prisma/client";
import type { LineRichMenuType } from "@prisma/client";
import type { SysRole } from "@prisma/client";
import type { CurrentPrefecture } from "@prisma/client";
import type { IdentityPlatform } from "@prisma/client";
import type { DidIssuanceStatus } from "@prisma/client";
import type { VcIssuanceStatus } from "@prisma/client";
import type { MembershipStatus } from "@prisma/client";
import type { MembershipStatusReason } from "@prisma/client";
import type { Role } from "@prisma/client";
import type { WalletType } from "@prisma/client";
import type { ArticleCategory } from "@prisma/client";
import type { PublishStatus } from "@prisma/client";
import type { OpportunityCategory } from "@prisma/client";
import type { OpportunitySlotHostingStatus } from "@prisma/client";
import type { ReservationStatus } from "@prisma/client";
import type { Source } from "@prisma/client";
import type { ParticipationStatus } from "@prisma/client";
import type { ParticipationStatusReason } from "@prisma/client";
import type { EvaluationStatus } from "@prisma/client";
import type { ClaimLinkStatus } from "@prisma/client";
import type { TicketStatus } from "@prisma/client";
import type { TicketStatusReason } from "@prisma/client";
import type { TransactionReason } from "@prisma/client";
import type { NftWalletType } from "@prisma/client";
import type { NftInstanceStatus } from "@prisma/client";
import type { NftMintStatus } from "@prisma/client";
import type { OrderStatus } from "@prisma/client";
import type { PaymentProvider } from "@prisma/client";
import type { ProductType } from "@prisma/client";
import type { ParticipationType } from "@prisma/client";
import type { Prisma, PrismaClient } from "@prisma/client";
import { createInitializer, createScreener, getScalarFieldValueGenerator, normalizeResolver, normalizeList, getSequenceCounter, createCallbackChain, destructure } from "@quramy/prisma-fabbrica/lib/internal";
import type { ModelWithFields, Resolver, } from "@quramy/prisma-fabbrica/lib/internal";
export { resetSequence, registerScalarFieldValueGenerator, resetScalarFieldValueGenerator } from "@quramy/prisma-fabbrica/lib/internal";

type BuildDataOptions<TTransients extends Record<string, unknown>> = {
    readonly seq: number;
} & TTransients;

type TraitName = string | symbol;

type CallbackDefineOptions<TCreated, TCreateInput, TTransients extends Record<string, unknown>> = {
    onAfterBuild?: (createInput: TCreateInput, transientFields: TTransients) => void | PromiseLike<void>;
    onBeforeCreate?: (createInput: TCreateInput, transientFields: TTransients) => void | PromiseLike<void>;
    onAfterCreate?: (created: TCreated, transientFields: TTransients) => void | PromiseLike<void>;
};

const initializer = createInitializer();

const { getClient } = initializer;

export const { initialize } = initializer;

const modelFieldDefinitions: ModelWithFields[] = [{
        name: "Image",
        fields: [{
                name: "users",
                type: "User",
                relationName: "ImageToUser"
            }, {
                name: "communities",
                type: "Community",
                relationName: "CommunityToImage"
            }, {
                name: "articles",
                type: "Article",
                relationName: "ArticleToImage"
            }, {
                name: "places",
                type: "Place",
                relationName: "ImageToPlace"
            }, {
                name: "opportunities",
                type: "Opportunity",
                relationName: "t_images_on_opportunities"
            }, {
                name: "participations",
                type: "Participation",
                relationName: "t_images_on_participations"
            }, {
                name: "utilities",
                type: "Utility",
                relationName: "t_images_on_utilities"
            }]
    }, {
        name: "State",
        fields: [{
                name: "cities",
                type: "City",
                relationName: "CityToState"
            }]
    }, {
        name: "City",
        fields: [{
                name: "state",
                type: "State",
                relationName: "CityToState"
            }, {
                name: "places",
                type: "Place",
                relationName: "CityToPlace"
            }]
    }, {
        name: "Place",
        fields: [{
                name: "image",
                type: "Image",
                relationName: "ImageToPlace"
            }, {
                name: "city",
                type: "City",
                relationName: "CityToPlace"
            }, {
                name: "community",
                type: "Community",
                relationName: "CommunityToPlace"
            }, {
                name: "opportunities",
                type: "Opportunity",
                relationName: "OpportunityToPlace"
            }, {
                name: "currentPublicOpportunityCount",
                type: "PlacePublicOpportunityCountView",
                relationName: "PlaceToPlacePublicOpportunityCountView"
            }, {
                name: "accumulatedParticipants",
                type: "PlaceAccumulatedParticipantsView",
                relationName: "PlaceToPlaceAccumulatedParticipantsView"
            }]
    }, {
        name: "Community",
        fields: [{
                name: "image",
                type: "Image",
                relationName: "CommunityToImage"
            }, {
                name: "config",
                type: "CommunityConfig",
                relationName: "CommunityToCommunityConfig"
            }, {
                name: "places",
                type: "Place",
                relationName: "CommunityToPlace"
            }, {
                name: "identities",
                type: "Identity",
                relationName: "CommunityToIdentity"
            }, {
                name: "memberships",
                type: "Membership",
                relationName: "CommunityToMembership"
            }, {
                name: "wallets",
                type: "Wallet",
                relationName: "CommunityToWallet"
            }, {
                name: "utilities",
                type: "Utility",
                relationName: "CommunityToUtility"
            }, {
                name: "opportunities",
                type: "Opportunity",
                relationName: "CommunityToOpportunity"
            }, {
                name: "participations",
                type: "Participation",
                relationName: "CommunityToParticipation"
            }, {
                name: "articles",
                type: "Article",
                relationName: "ArticleToCommunity"
            }, {
                name: "nftInstance",
                type: "NftInstance",
                relationName: "CommunityToNftInstance"
            }]
    }, {
        name: "CommunityConfig",
        fields: [{
                name: "community",
                type: "Community",
                relationName: "CommunityToCommunityConfig"
            }, {
                name: "firebaseConfig",
                type: "CommunityFirebaseConfig",
                relationName: "CommunityConfigToCommunityFirebaseConfig"
            }, {
                name: "lineConfig",
                type: "CommunityLineConfig",
                relationName: "CommunityConfigToCommunityLineConfig"
            }]
    }, {
        name: "CommunityFirebaseConfig",
        fields: [{
                name: "config",
                type: "CommunityConfig",
                relationName: "CommunityConfigToCommunityFirebaseConfig"
            }]
    }, {
        name: "CommunityLineConfig",
        fields: [{
                name: "config",
                type: "CommunityConfig",
                relationName: "CommunityConfigToCommunityLineConfig"
            }, {
                name: "richMenus",
                type: "CommunityLineRichMenuConfig",
                relationName: "CommunityLineConfigToCommunityLineRichMenuConfig"
            }]
    }, {
        name: "CommunityLineRichMenuConfig",
        fields: [{
                name: "config",
                type: "CommunityLineConfig",
                relationName: "CommunityLineConfigToCommunityLineRichMenuConfig"
            }]
    }, {
        name: "User",
        fields: [{
                name: "image",
                type: "Image",
                relationName: "ImageToUser"
            }, {
                name: "identities",
                type: "Identity",
                relationName: "IdentityToUser"
            }, {
                name: "nftWallets",
                type: "NftWallet",
                relationName: "NftWalletToUser"
            }, {
                name: "didIssuanceRequests",
                type: "DidIssuanceRequest",
                relationName: "DidIssuanceRequestToUser"
            }, {
                name: "vcIssuanceRequests",
                type: "VcIssuanceRequest",
                relationName: "UserToVcIssuanceRequest"
            }, {
                name: "memberships",
                type: "Membership",
                relationName: "MembershipToUser"
            }, {
                name: "membershipChangedByMe",
                type: "MembershipHistory",
                relationName: "MembershipHistoryToUser"
            }, {
                name: "wallets",
                type: "Wallet",
                relationName: "UserToWallet"
            }, {
                name: "utiltyOwnedByMe",
                type: "Utility",
                relationName: "UserToUtility"
            }, {
                name: "ticketIssuedByMe",
                type: "TicketIssuer",
                relationName: "TicketIssuerToUser"
            }, {
                name: "ticketStatusChangedByMe",
                type: "TicketStatusHistory",
                relationName: "TicketStatusHistoryToUser"
            }, {
                name: "opportunitiesCreatedByMe",
                type: "Opportunity",
                relationName: "OpportunityToUser"
            }, {
                name: "reservationsAppliedByMe",
                type: "Reservation",
                relationName: "ReservationToUser"
            }, {
                name: "reservationStatusChangedByMe",
                type: "ReservationHistory",
                relationName: "ReservationHistoryToUser"
            }, {
                name: "participations",
                type: "Participation",
                relationName: "ParticipationToUser"
            }, {
                name: "participationStatusChangedByMe",
                type: "ParticipationStatusHistory",
                relationName: "ParticipationStatusHistoryToUser"
            }, {
                name: "evaluationsEvaluatedByMe",
                type: "Evaluation",
                relationName: "EvaluationToUser"
            }, {
                name: "evaluationCreatedByMe",
                type: "EvaluationHistory",
                relationName: "EvaluationHistoryToUser"
            }, {
                name: "transactionsCreatedByMe",
                type: "Transaction",
                relationName: "TransactionToUser"
            }, {
                name: "articlesWrittenByMe",
                type: "Article",
                relationName: "t_author_users_on_articles"
            }, {
                name: "articlesAboutMe",
                type: "Article",
                relationName: "t_related_users_on_articles"
            }, {
                name: "orders",
                type: "Order",
                relationName: "OrderToUser"
            }]
    }, {
        name: "Identity",
        fields: [{
                name: "user",
                type: "User",
                relationName: "IdentityToUser"
            }, {
                name: "community",
                type: "Community",
                relationName: "CommunityToIdentity"
            }]
    }, {
        name: "DidIssuanceRequest",
        fields: [{
                name: "user",
                type: "User",
                relationName: "DidIssuanceRequestToUser"
            }]
    }, {
        name: "VcIssuanceRequest",
        fields: [{
                name: "evaluation",
                type: "Evaluation",
                relationName: "EvaluationToVcIssuanceRequest"
            }, {
                name: "user",
                type: "User",
                relationName: "UserToVcIssuanceRequest"
            }]
    }, {
        name: "Membership",
        fields: [{
                name: "user",
                type: "User",
                relationName: "MembershipToUser"
            }, {
                name: "community",
                type: "Community",
                relationName: "CommunityToMembership"
            }, {
                name: "histories",
                type: "MembershipHistory",
                relationName: "MembershipToMembershipHistory"
            }, {
                name: "opportunityHostedCountView",
                type: "MembershipHostedOpportunityCountView",
                relationName: "MembershipToMembershipHostedOpportunityCountView"
            }, {
                name: "participationGeoViews",
                type: "MembershipParticipationGeoView",
                relationName: "MembershipToMembershipParticipationGeoView"
            }, {
                name: "participationCountViews",
                type: "MembershipParticipationCountView",
                relationName: "MembershipToMembershipParticipationCountView"
            }]
    }, {
        name: "MembershipHistory",
        fields: [{
                name: "membership",
                type: "Membership",
                relationName: "MembershipToMembershipHistory"
            }, {
                name: "createdByUser",
                type: "User",
                relationName: "MembershipHistoryToUser"
            }]
    }, {
        name: "Wallet",
        fields: [{
                name: "community",
                type: "Community",
                relationName: "CommunityToWallet"
            }, {
                name: "user",
                type: "User",
                relationName: "UserToWallet"
            }, {
                name: "currentPointView",
                type: "CurrentPointView",
                relationName: "CurrentPointViewToWallet"
            }, {
                name: "accumulatedPointView",
                type: "AccumulatedPointView",
                relationName: "AccumulatedPointViewToWallet"
            }, {
                name: "fromTransactions",
                type: "Transaction",
                relationName: "from_wallet"
            }, {
                name: "toTransactions",
                type: "Transaction",
                relationName: "to_wallet"
            }, {
                name: "tickets",
                type: "Ticket",
                relationName: "TicketToWallet"
            }]
    }, {
        name: "Article",
        fields: [{
                name: "thumbnail",
                type: "Image",
                relationName: "ArticleToImage"
            }, {
                name: "community",
                type: "Community",
                relationName: "ArticleToCommunity"
            }, {
                name: "authors",
                type: "User",
                relationName: "t_author_users_on_articles"
            }, {
                name: "relatedUsers",
                type: "User",
                relationName: "t_related_users_on_articles"
            }, {
                name: "opportunities",
                type: "Opportunity",
                relationName: "t_opportunities_on_articles"
            }]
    }, {
        name: "Opportunity",
        fields: [{
                name: "images",
                type: "Image",
                relationName: "t_images_on_opportunities"
            }, {
                name: "requiredUtilities",
                type: "Utility",
                relationName: "t_required_opportunities_on_utilities"
            }, {
                name: "slots",
                type: "OpportunitySlot",
                relationName: "OpportunityToOpportunitySlot"
            }, {
                name: "earliestReservableSlotView",
                type: "EarliestReservableSlotView",
                relationName: "EarliestReservableSlotViewToOpportunity"
            }, {
                name: "accumulatedParticipants",
                type: "OpportunityAccumulatedParticipantsView",
                relationName: "OpportunityToOpportunityAccumulatedParticipantsView"
            }, {
                name: "community",
                type: "Community",
                relationName: "CommunityToOpportunity"
            }, {
                name: "place",
                type: "Place",
                relationName: "OpportunityToPlace"
            }, {
                name: "articles",
                type: "Article",
                relationName: "t_opportunities_on_articles"
            }, {
                name: "createdByUser",
                type: "User",
                relationName: "OpportunityToUser"
            }]
    }, {
        name: "OpportunitySlot",
        fields: [{
                name: "remainingCapacityView",
                type: "RemainingCapacityView",
                relationName: "OpportunitySlotToRemainingCapacityView"
            }, {
                name: "opportunity",
                type: "Opportunity",
                relationName: "OpportunityToOpportunitySlot"
            }, {
                name: "reservations",
                type: "Reservation",
                relationName: "OpportunitySlotToReservation"
            }, {
                name: "participations",
                type: "Participation",
                relationName: "OpportunitySlotToParticipation"
            }]
    }, {
        name: "Reservation",
        fields: [{
                name: "opportunitySlot",
                type: "OpportunitySlot",
                relationName: "OpportunitySlotToReservation"
            }, {
                name: "participations",
                type: "Participation",
                relationName: "ParticipationToReservation"
            }, {
                name: "createdByUser",
                type: "User",
                relationName: "ReservationToUser"
            }, {
                name: "histories",
                type: "ReservationHistory",
                relationName: "ReservationToReservationHistory"
            }, {
                name: "transactions",
                type: "Transaction",
                relationName: "ReservationToTransaction"
            }]
    }, {
        name: "ReservationHistory",
        fields: [{
                name: "reservation",
                type: "Reservation",
                relationName: "ReservationToReservationHistory"
            }, {
                name: "createdByUser",
                type: "User",
                relationName: "ReservationHistoryToUser"
            }]
    }, {
        name: "Participation",
        fields: [{
                name: "images",
                type: "Image",
                relationName: "t_images_on_participations"
            }, {
                name: "user",
                type: "User",
                relationName: "ParticipationToUser"
            }, {
                name: "opportunitySlot",
                type: "OpportunitySlot",
                relationName: "OpportunitySlotToParticipation"
            }, {
                name: "reservation",
                type: "Reservation",
                relationName: "ParticipationToReservation"
            }, {
                name: "ticketStatusHistories",
                type: "TicketStatusHistory",
                relationName: "ParticipationToTicketStatusHistory"
            }, {
                name: "community",
                type: "Community",
                relationName: "CommunityToParticipation"
            }, {
                name: "evaluation",
                type: "Evaluation",
                relationName: "EvaluationToParticipation"
            }, {
                name: "transactions",
                type: "Transaction",
                relationName: "ParticipationToTransaction"
            }, {
                name: "statusHistories",
                type: "ParticipationStatusHistory",
                relationName: "ParticipationToParticipationStatusHistory"
            }]
    }, {
        name: "ParticipationStatusHistory",
        fields: [{
                name: "participation",
                type: "Participation",
                relationName: "ParticipationToParticipationStatusHistory"
            }, {
                name: "createdByUser",
                type: "User",
                relationName: "ParticipationStatusHistoryToUser"
            }]
    }, {
        name: "Evaluation",
        fields: [{
                name: "participation",
                type: "Participation",
                relationName: "EvaluationToParticipation"
            }, {
                name: "evaluator",
                type: "User",
                relationName: "EvaluationToUser"
            }, {
                name: "vcIssuanceRequest",
                type: "VcIssuanceRequest",
                relationName: "EvaluationToVcIssuanceRequest"
            }, {
                name: "histories",
                type: "EvaluationHistory",
                relationName: "EvaluationToEvaluationHistory"
            }]
    }, {
        name: "EvaluationHistory",
        fields: [{
                name: "evaluation",
                type: "Evaluation",
                relationName: "EvaluationToEvaluationHistory"
            }, {
                name: "createdByUser",
                type: "User",
                relationName: "EvaluationHistoryToUser"
            }]
    }, {
        name: "Utility",
        fields: [{
                name: "images",
                type: "Image",
                relationName: "t_images_on_utilities"
            }, {
                name: "community",
                type: "Community",
                relationName: "CommunityToUtility"
            }, {
                name: "requiredForOpportunities",
                type: "Opportunity",
                relationName: "t_required_opportunities_on_utilities"
            }, {
                name: "ticketIssuer",
                type: "TicketIssuer",
                relationName: "TicketIssuerToUtility"
            }, {
                name: "tickets",
                type: "Ticket",
                relationName: "TicketToUtility"
            }, {
                name: "owner",
                type: "User",
                relationName: "UserToUtility"
            }]
    }, {
        name: "TicketIssuer",
        fields: [{
                name: "utility",
                type: "Utility",
                relationName: "TicketIssuerToUtility"
            }, {
                name: "owner",
                type: "User",
                relationName: "TicketIssuerToUser"
            }, {
                name: "claimLink",
                type: "TicketClaimLink",
                relationName: "TicketClaimLinkToTicketIssuer"
            }]
    }, {
        name: "TicketClaimLink",
        fields: [{
                name: "issuer",
                type: "TicketIssuer",
                relationName: "TicketClaimLinkToTicketIssuer"
            }, {
                name: "tickets",
                type: "Ticket",
                relationName: "TicketToTicketClaimLink"
            }]
    }, {
        name: "Ticket",
        fields: [{
                name: "wallet",
                type: "Wallet",
                relationName: "TicketToWallet"
            }, {
                name: "utility",
                type: "Utility",
                relationName: "TicketToUtility"
            }, {
                name: "claimLink",
                type: "TicketClaimLink",
                relationName: "TicketToTicketClaimLink"
            }, {
                name: "ticketStatusHistories",
                type: "TicketStatusHistory",
                relationName: "TicketToTicketStatusHistory"
            }]
    }, {
        name: "TicketStatusHistory",
        fields: [{
                name: "ticket",
                type: "Ticket",
                relationName: "TicketToTicketStatusHistory"
            }, {
                name: "transaction",
                type: "Transaction",
                relationName: "TicketStatusHistoryToTransaction"
            }, {
                name: "participation",
                type: "Participation",
                relationName: "ParticipationToTicketStatusHistory"
            }, {
                name: "createdByUser",
                type: "User",
                relationName: "TicketStatusHistoryToUser"
            }]
    }, {
        name: "Transaction",
        fields: [{
                name: "fromWallet",
                type: "Wallet",
                relationName: "from_wallet"
            }, {
                name: "toWallet",
                type: "Wallet",
                relationName: "to_wallet"
            }, {
                name: "participation",
                type: "Participation",
                relationName: "ParticipationToTransaction"
            }, {
                name: "reservation",
                type: "Reservation",
                relationName: "ReservationToTransaction"
            }, {
                name: "ticketStatusHistory",
                type: "TicketStatusHistory",
                relationName: "TicketStatusHistoryToTransaction"
            }, {
                name: "createdByUser",
                type: "User",
                relationName: "TransactionToUser"
            }]
    }, {
        name: "ApiKey",
        fields: []
    }, {
        name: "NftWallet",
        fields: [{
                name: "user",
                type: "User",
                relationName: "NftWalletToUser"
            }, {
                name: "nftInstances",
                type: "NftInstance",
                relationName: "NftInstanceToNftWallet"
            }, {
                name: "nftMints",
                type: "NftMint",
                relationName: "NftMintToNftWallet"
            }]
    }, {
        name: "NftToken",
        fields: [{
                name: "nftInstances",
                type: "NftInstance",
                relationName: "NftInstanceToNftToken"
            }]
    }, {
        name: "NftInstance",
        fields: [{
                name: "product",
                type: "Product",
                relationName: "NftInstanceToProduct"
            }, {
                name: "nftWallet",
                type: "NftWallet",
                relationName: "NftInstanceToNftWallet"
            }, {
                name: "nftToken",
                type: "NftToken",
                relationName: "NftInstanceToNftToken"
            }, {
                name: "nftMint",
                type: "NftMint",
                relationName: "NftInstanceToNftMint"
            }, {
                name: "community",
                type: "Community",
                relationName: "CommunityToNftInstance"
            }]
    }, {
        name: "NftMint",
        fields: [{
                name: "orderItem",
                type: "OrderItem",
                relationName: "NftMintToOrderItem"
            }, {
                name: "nftWallet",
                type: "NftWallet",
                relationName: "NftMintToNftWallet"
            }, {
                name: "nftInstance",
                type: "NftInstance",
                relationName: "NftInstanceToNftMint"
            }]
    }, {
        name: "Order",
        fields: [{
                name: "user",
                type: "User",
                relationName: "OrderToUser"
            }, {
                name: "items",
                type: "OrderItem",
                relationName: "OrderToOrderItem"
            }]
    }, {
        name: "OrderItem",
        fields: [{
                name: "order",
                type: "Order",
                relationName: "OrderToOrderItem"
            }, {
                name: "product",
                type: "Product",
                relationName: "OrderItemToProduct"
            }, {
                name: "nftMints",
                type: "NftMint",
                relationName: "NftMintToOrderItem"
            }]
    }, {
        name: "PaymentEvent",
        fields: []
    }, {
        name: "Product",
        fields: [{
                name: "orderItem",
                type: "OrderItem",
                relationName: "OrderItemToProduct"
            }, {
                name: "nftProduct",
                type: "NftProduct",
                relationName: "NftProductToProduct"
            }, {
                name: "nftInstance",
                type: "NftInstance",
                relationName: "NftInstanceToProduct"
            }]
    }, {
        name: "NftProduct",
        fields: [{
                name: "product",
                type: "Product",
                relationName: "NftProductToProduct"
            }]
    }, {
        name: "PlacePublicOpportunityCountView",
        fields: [{
                name: "place",
                type: "Place",
                relationName: "PlaceToPlacePublicOpportunityCountView"
            }]
    }, {
        name: "PlaceAccumulatedParticipantsView",
        fields: [{
                name: "place",
                type: "Place",
                relationName: "PlaceToPlaceAccumulatedParticipantsView"
            }]
    }, {
        name: "MembershipParticipationGeoView",
        fields: [{
                name: "membership",
                type: "Membership",
                relationName: "MembershipToMembershipParticipationGeoView"
            }]
    }, {
        name: "MembershipParticipationCountView",
        fields: [{
                name: "membership",
                type: "Membership",
                relationName: "MembershipToMembershipParticipationCountView"
            }]
    }, {
        name: "MembershipHostedOpportunityCountView",
        fields: [{
                name: "membership",
                type: "Membership",
                relationName: "MembershipToMembershipHostedOpportunityCountView"
            }]
    }, {
        name: "CurrentPointView",
        fields: [{
                name: "wallet",
                type: "Wallet",
                relationName: "CurrentPointViewToWallet"
            }]
    }, {
        name: "AccumulatedPointView",
        fields: [{
                name: "wallet",
                type: "Wallet",
                relationName: "AccumulatedPointViewToWallet"
            }]
    }, {
        name: "EarliestReservableSlotView",
        fields: [{
                name: "opportunity",
                type: "Opportunity",
                relationName: "EarliestReservableSlotViewToOpportunity"
            }]
    }, {
        name: "OpportunityAccumulatedParticipantsView",
        fields: [{
                name: "opportunity",
                type: "Opportunity",
                relationName: "OpportunityToOpportunityAccumulatedParticipantsView"
            }]
    }, {
        name: "RemainingCapacityView",
        fields: [{
                name: "slot",
                type: "OpportunitySlot",
                relationName: "OpportunitySlotToRemainingCapacityView"
            }]
    }];

type ImageScalarOrEnumFields = {
    isPublic: boolean;
    url: string;
    bucket: string;
    folderPath: string;
    filename: string;
    mime: string;
    ext: string;
};

type ImageFactoryDefineInput = {
    id?: string;
    isPublic?: boolean;
    url?: string;
    originalUrl?: string | null;
    bucket?: string;
    folderPath?: string;
    filename?: string;
    size?: number | null;
    width?: number | null;
    height?: number | null;
    mime?: string;
    ext?: string;
    alt?: string | null;
    caption?: string | null;
    strapiId?: number | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    users?: Prisma.UserCreateNestedManyWithoutImageInput;
    communities?: Prisma.CommunityCreateNestedManyWithoutImageInput;
    articles?: Prisma.ArticleCreateNestedManyWithoutThumbnailInput;
    places?: Prisma.PlaceCreateNestedManyWithoutImageInput;
    opportunities?: Prisma.OpportunityCreateNestedManyWithoutImagesInput;
    participations?: Prisma.ParticipationCreateNestedManyWithoutImagesInput;
    utilities?: Prisma.UtilityCreateNestedManyWithoutImagesInput;
};

type ImageTransientFields = Record<string, unknown> & Partial<Record<keyof ImageFactoryDefineInput, never>>;

type ImageFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ImageFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Image, Prisma.ImageCreateInput, TTransients>;

type ImageFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<ImageFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: ImageFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Image, Prisma.ImageCreateInput, TTransients>;

type ImageTraitKeys<TOptions extends ImageFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface ImageFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Image";
    build(inputData?: Partial<Prisma.ImageCreateInput & TTransients>): PromiseLike<Prisma.ImageCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ImageCreateInput & TTransients>): PromiseLike<Prisma.ImageCreateInput>;
    buildList(list: readonly Partial<Prisma.ImageCreateInput & TTransients>[]): PromiseLike<Prisma.ImageCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ImageCreateInput & TTransients>): PromiseLike<Prisma.ImageCreateInput[]>;
    pickForConnect(inputData: Image): Pick<Image, "id">;
    create(inputData?: Partial<Prisma.ImageCreateInput & TTransients>): PromiseLike<Image>;
    createList(list: readonly Partial<Prisma.ImageCreateInput & TTransients>[]): PromiseLike<Image[]>;
    createList(count: number, item?: Partial<Prisma.ImageCreateInput & TTransients>): PromiseLike<Image[]>;
    createForConnect(inputData?: Partial<Prisma.ImageCreateInput & TTransients>): PromiseLike<Pick<Image, "id">>;
}

export interface ImageFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ImageFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ImageFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateImageScalarsOrEnums({ seq }: {
    readonly seq: number;
}): ImageScalarOrEnumFields {
    return {
        isPublic: getScalarFieldValueGenerator().Boolean({ modelName: "Image", fieldName: "isPublic", isId: false, isUnique: false, seq }),
        url: getScalarFieldValueGenerator().String({ modelName: "Image", fieldName: "url", isId: false, isUnique: false, seq }),
        bucket: getScalarFieldValueGenerator().String({ modelName: "Image", fieldName: "bucket", isId: false, isUnique: false, seq }),
        folderPath: getScalarFieldValueGenerator().String({ modelName: "Image", fieldName: "folderPath", isId: false, isUnique: false, seq }),
        filename: getScalarFieldValueGenerator().String({ modelName: "Image", fieldName: "filename", isId: false, isUnique: false, seq }),
        mime: getScalarFieldValueGenerator().String({ modelName: "Image", fieldName: "mime", isId: false, isUnique: false, seq }),
        ext: getScalarFieldValueGenerator().String({ modelName: "Image", fieldName: "ext", isId: false, isUnique: false, seq })
    };
}

function defineImageFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends ImageFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): ImageFactoryInterface<TTransients, ImageTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly ImageTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Image", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.ImageCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateImageScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<ImageFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<ImageFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {} as Prisma.ImageCreateInput;
            const data: Prisma.ImageCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ImageCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Image) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.ImageCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().image.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ImageCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.ImageCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Image" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: ImageTraitKeys<TOptions>, ...names: readonly ImageTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface ImageFactoryBuilder {
    <TOptions extends ImageFactoryDefineOptions>(options?: TOptions): ImageFactoryInterface<{}, ImageTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ImageTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ImageFactoryDefineOptions<TTransients>>(options?: TOptions) => ImageFactoryInterface<TTransients, ImageTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Image} model.
 *
 * @param options
 * @returns factory {@link ImageFactoryInterface}
 */
export const defineImageFactory = (<TOptions extends ImageFactoryDefineOptions>(options?: TOptions): ImageFactoryInterface<TOptions> => {
    return defineImageFactoryInternal(options ?? {}, {});
}) as ImageFactoryBuilder;

defineImageFactory.withTransientFields = defaultTransientFieldValues => options => defineImageFactoryInternal(options ?? {}, defaultTransientFieldValues);

type StateScalarOrEnumFields = {
    code: string;
    name: string;
    countryCode: string;
};

type StateFactoryDefineInput = {
    code?: string;
    name?: string;
    countryCode?: string;
    cities?: Prisma.CityCreateNestedManyWithoutStateInput;
};

type StateTransientFields = Record<string, unknown> & Partial<Record<keyof StateFactoryDefineInput, never>>;

type StateFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<StateFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<State, Prisma.StateCreateInput, TTransients>;

type StateFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<StateFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: StateFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<State, Prisma.StateCreateInput, TTransients>;

type StateTraitKeys<TOptions extends StateFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface StateFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "State";
    build(inputData?: Partial<Prisma.StateCreateInput & TTransients>): PromiseLike<Prisma.StateCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.StateCreateInput & TTransients>): PromiseLike<Prisma.StateCreateInput>;
    buildList(list: readonly Partial<Prisma.StateCreateInput & TTransients>[]): PromiseLike<Prisma.StateCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.StateCreateInput & TTransients>): PromiseLike<Prisma.StateCreateInput[]>;
    pickForConnect(inputData: State): Pick<State, "code" | "countryCode">;
    create(inputData?: Partial<Prisma.StateCreateInput & TTransients>): PromiseLike<State>;
    createList(list: readonly Partial<Prisma.StateCreateInput & TTransients>[]): PromiseLike<State[]>;
    createList(count: number, item?: Partial<Prisma.StateCreateInput & TTransients>): PromiseLike<State[]>;
    createForConnect(inputData?: Partial<Prisma.StateCreateInput & TTransients>): PromiseLike<Pick<State, "code" | "countryCode">>;
}

export interface StateFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends StateFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): StateFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateStateScalarsOrEnums({ seq }: {
    readonly seq: number;
}): StateScalarOrEnumFields {
    return {
        code: getScalarFieldValueGenerator().String({ modelName: "State", fieldName: "code", isId: true, isUnique: false, seq }),
        name: getScalarFieldValueGenerator().String({ modelName: "State", fieldName: "name", isId: false, isUnique: false, seq }),
        countryCode: getScalarFieldValueGenerator().String({ modelName: "State", fieldName: "countryCode", isId: true, isUnique: false, seq })
    };
}

function defineStateFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends StateFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): StateFactoryInterface<TTransients, StateTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly StateTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("State", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.StateCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateStateScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<StateFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<StateFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {} as Prisma.StateCreateInput;
            const data: Prisma.StateCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.StateCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: State) => ({
            code: inputData.code,
            countryCode: inputData.countryCode
        });
        const create = async (inputData: Partial<Prisma.StateCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().state.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.StateCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.StateCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "State" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: StateTraitKeys<TOptions>, ...names: readonly StateTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface StateFactoryBuilder {
    <TOptions extends StateFactoryDefineOptions>(options?: TOptions): StateFactoryInterface<{}, StateTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends StateTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends StateFactoryDefineOptions<TTransients>>(options?: TOptions) => StateFactoryInterface<TTransients, StateTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link State} model.
 *
 * @param options
 * @returns factory {@link StateFactoryInterface}
 */
export const defineStateFactory = (<TOptions extends StateFactoryDefineOptions>(options?: TOptions): StateFactoryInterface<TOptions> => {
    return defineStateFactoryInternal(options ?? {}, {});
}) as StateFactoryBuilder;

defineStateFactory.withTransientFields = defaultTransientFieldValues => options => defineStateFactoryInternal(options ?? {}, defaultTransientFieldValues);

type CityScalarOrEnumFields = {
    code: string;
    name: string;
};

type CitystateFactory = {
    _factoryFor: "State";
    build: () => PromiseLike<Prisma.StateCreateNestedOneWithoutCitiesInput["create"]>;
};

type CityFactoryDefineInput = {
    code?: string;
    name?: string;
    state: CitystateFactory | Prisma.StateCreateNestedOneWithoutCitiesInput;
    places?: Prisma.PlaceCreateNestedManyWithoutCityInput;
};

type CityTransientFields = Record<string, unknown> & Partial<Record<keyof CityFactoryDefineInput, never>>;

type CityFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CityFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<City, Prisma.CityCreateInput, TTransients>;

type CityFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<CityFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: CityFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<City, Prisma.CityCreateInput, TTransients>;

function isCitystateFactory(x: CitystateFactory | Prisma.StateCreateNestedOneWithoutCitiesInput | undefined): x is CitystateFactory {
    return (x as any)?._factoryFor === "State";
}

type CityTraitKeys<TOptions extends CityFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface CityFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "City";
    build(inputData?: Partial<Prisma.CityCreateInput & TTransients>): PromiseLike<Prisma.CityCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.CityCreateInput & TTransients>): PromiseLike<Prisma.CityCreateInput>;
    buildList(list: readonly Partial<Prisma.CityCreateInput & TTransients>[]): PromiseLike<Prisma.CityCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.CityCreateInput & TTransients>): PromiseLike<Prisma.CityCreateInput[]>;
    pickForConnect(inputData: City): Pick<City, "code">;
    create(inputData?: Partial<Prisma.CityCreateInput & TTransients>): PromiseLike<City>;
    createList(list: readonly Partial<Prisma.CityCreateInput & TTransients>[]): PromiseLike<City[]>;
    createList(count: number, item?: Partial<Prisma.CityCreateInput & TTransients>): PromiseLike<City[]>;
    createForConnect(inputData?: Partial<Prisma.CityCreateInput & TTransients>): PromiseLike<Pick<City, "code">>;
}

export interface CityFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends CityFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): CityFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateCityScalarsOrEnums({ seq }: {
    readonly seq: number;
}): CityScalarOrEnumFields {
    return {
        code: getScalarFieldValueGenerator().String({ modelName: "City", fieldName: "code", isId: true, isUnique: false, seq }),
        name: getScalarFieldValueGenerator().String({ modelName: "City", fieldName: "name", isId: false, isUnique: false, seq })
    };
}

function defineCityFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends CityFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): CityFactoryInterface<TTransients, CityTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly CityTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("City", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.CityCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCityScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<CityFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<CityFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                state: isCitystateFactory(defaultData.state) ? {
                    create: await defaultData.state.build()
                } : defaultData.state
            } as Prisma.CityCreateInput;
            const data: Prisma.CityCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CityCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: City) => ({
            code: inputData.code
        });
        const create = async (inputData: Partial<Prisma.CityCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().city.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CityCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.CityCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "City" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: CityTraitKeys<TOptions>, ...names: readonly CityTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface CityFactoryBuilder {
    <TOptions extends CityFactoryDefineOptions>(options: TOptions): CityFactoryInterface<{}, CityTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CityTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CityFactoryDefineOptions<TTransients>>(options: TOptions) => CityFactoryInterface<TTransients, CityTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link City} model.
 *
 * @param options
 * @returns factory {@link CityFactoryInterface}
 */
export const defineCityFactory = (<TOptions extends CityFactoryDefineOptions>(options: TOptions): CityFactoryInterface<TOptions> => {
    return defineCityFactoryInternal(options, {});
}) as CityFactoryBuilder;

defineCityFactory.withTransientFields = defaultTransientFieldValues => options => defineCityFactoryInternal(options, defaultTransientFieldValues);

type PlaceScalarOrEnumFields = {
    name: string;
    address: string;
    latitude: (Prisma.Decimal | Prisma.DecimalJsLike | string);
    longitude: (Prisma.Decimal | Prisma.DecimalJsLike | string);
    isManual: boolean;
};

type PlaceimageFactory = {
    _factoryFor: "Image";
    build: () => PromiseLike<Prisma.ImageCreateNestedOneWithoutPlacesInput["create"]>;
};

type PlacecityFactory = {
    _factoryFor: "City";
    build: () => PromiseLike<Prisma.CityCreateNestedOneWithoutPlacesInput["create"]>;
};

type PlacecommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutPlacesInput["create"]>;
};

type PlacecurrentPublicOpportunityCountFactory = {
    _factoryFor: "PlacePublicOpportunityCountView";
    build: () => PromiseLike<Prisma.PlacePublicOpportunityCountViewCreateNestedOneWithoutPlaceInput["create"]>;
};

type PlaceaccumulatedParticipantsFactory = {
    _factoryFor: "PlaceAccumulatedParticipantsView";
    build: () => PromiseLike<Prisma.PlaceAccumulatedParticipantsViewCreateNestedOneWithoutPlaceInput["create"]>;
};

type PlaceFactoryDefineInput = {
    id?: string;
    name?: string;
    address?: string;
    latitude?: (Prisma.Decimal | Prisma.DecimalJsLike | string);
    longitude?: (Prisma.Decimal | Prisma.DecimalJsLike | string);
    isManual?: boolean;
    googlePlaceId?: string | null;
    mapLocation?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
    createdAt?: Date;
    updatedAt?: Date | null;
    image?: PlaceimageFactory | Prisma.ImageCreateNestedOneWithoutPlacesInput;
    city: PlacecityFactory | Prisma.CityCreateNestedOneWithoutPlacesInput;
    community?: PlacecommunityFactory | Prisma.CommunityCreateNestedOneWithoutPlacesInput;
    opportunities?: Prisma.OpportunityCreateNestedManyWithoutPlaceInput;
    currentPublicOpportunityCount?: PlacecurrentPublicOpportunityCountFactory | Prisma.PlacePublicOpportunityCountViewCreateNestedOneWithoutPlaceInput;
    accumulatedParticipants?: PlaceaccumulatedParticipantsFactory | Prisma.PlaceAccumulatedParticipantsViewCreateNestedOneWithoutPlaceInput;
};

type PlaceTransientFields = Record<string, unknown> & Partial<Record<keyof PlaceFactoryDefineInput, never>>;

type PlaceFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<PlaceFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Place, Prisma.PlaceCreateInput, TTransients>;

type PlaceFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<PlaceFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: PlaceFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Place, Prisma.PlaceCreateInput, TTransients>;

function isPlaceimageFactory(x: PlaceimageFactory | Prisma.ImageCreateNestedOneWithoutPlacesInput | undefined): x is PlaceimageFactory {
    return (x as any)?._factoryFor === "Image";
}

function isPlacecityFactory(x: PlacecityFactory | Prisma.CityCreateNestedOneWithoutPlacesInput | undefined): x is PlacecityFactory {
    return (x as any)?._factoryFor === "City";
}

function isPlacecommunityFactory(x: PlacecommunityFactory | Prisma.CommunityCreateNestedOneWithoutPlacesInput | undefined): x is PlacecommunityFactory {
    return (x as any)?._factoryFor === "Community";
}

function isPlacecurrentPublicOpportunityCountFactory(x: PlacecurrentPublicOpportunityCountFactory | Prisma.PlacePublicOpportunityCountViewCreateNestedOneWithoutPlaceInput | undefined): x is PlacecurrentPublicOpportunityCountFactory {
    return (x as any)?._factoryFor === "PlacePublicOpportunityCountView";
}

function isPlaceaccumulatedParticipantsFactory(x: PlaceaccumulatedParticipantsFactory | Prisma.PlaceAccumulatedParticipantsViewCreateNestedOneWithoutPlaceInput | undefined): x is PlaceaccumulatedParticipantsFactory {
    return (x as any)?._factoryFor === "PlaceAccumulatedParticipantsView";
}

type PlaceTraitKeys<TOptions extends PlaceFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface PlaceFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Place";
    build(inputData?: Partial<Prisma.PlaceCreateInput & TTransients>): PromiseLike<Prisma.PlaceCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.PlaceCreateInput & TTransients>): PromiseLike<Prisma.PlaceCreateInput>;
    buildList(list: readonly Partial<Prisma.PlaceCreateInput & TTransients>[]): PromiseLike<Prisma.PlaceCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.PlaceCreateInput & TTransients>): PromiseLike<Prisma.PlaceCreateInput[]>;
    pickForConnect(inputData: Place): Pick<Place, "id">;
    create(inputData?: Partial<Prisma.PlaceCreateInput & TTransients>): PromiseLike<Place>;
    createList(list: readonly Partial<Prisma.PlaceCreateInput & TTransients>[]): PromiseLike<Place[]>;
    createList(count: number, item?: Partial<Prisma.PlaceCreateInput & TTransients>): PromiseLike<Place[]>;
    createForConnect(inputData?: Partial<Prisma.PlaceCreateInput & TTransients>): PromiseLike<Pick<Place, "id">>;
}

export interface PlaceFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends PlaceFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): PlaceFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGeneratePlaceScalarsOrEnums({ seq }: {
    readonly seq: number;
}): PlaceScalarOrEnumFields {
    return {
        name: getScalarFieldValueGenerator().String({ modelName: "Place", fieldName: "name", isId: false, isUnique: false, seq }),
        address: getScalarFieldValueGenerator().String({ modelName: "Place", fieldName: "address", isId: false, isUnique: false, seq }),
        latitude: getScalarFieldValueGenerator().Decimal({ modelName: "Place", fieldName: "latitude", isId: false, isUnique: false, seq }),
        longitude: getScalarFieldValueGenerator().Decimal({ modelName: "Place", fieldName: "longitude", isId: false, isUnique: false, seq }),
        isManual: getScalarFieldValueGenerator().Boolean({ modelName: "Place", fieldName: "isManual", isId: false, isUnique: false, seq })
    };
}

function definePlaceFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends PlaceFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): PlaceFactoryInterface<TTransients, PlaceTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly PlaceTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Place", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.PlaceCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGeneratePlaceScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<PlaceFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<PlaceFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                image: isPlaceimageFactory(defaultData.image) ? {
                    create: await defaultData.image.build()
                } : defaultData.image,
                city: isPlacecityFactory(defaultData.city) ? {
                    create: await defaultData.city.build()
                } : defaultData.city,
                community: isPlacecommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community,
                currentPublicOpportunityCount: isPlacecurrentPublicOpportunityCountFactory(defaultData.currentPublicOpportunityCount) ? {
                    create: await defaultData.currentPublicOpportunityCount.build()
                } : defaultData.currentPublicOpportunityCount,
                accumulatedParticipants: isPlaceaccumulatedParticipantsFactory(defaultData.accumulatedParticipants) ? {
                    create: await defaultData.accumulatedParticipants.build()
                } : defaultData.accumulatedParticipants
            } as Prisma.PlaceCreateInput;
            const data: Prisma.PlaceCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PlaceCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Place) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.PlaceCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().place.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PlaceCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.PlaceCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Place" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: PlaceTraitKeys<TOptions>, ...names: readonly PlaceTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface PlaceFactoryBuilder {
    <TOptions extends PlaceFactoryDefineOptions>(options: TOptions): PlaceFactoryInterface<{}, PlaceTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends PlaceTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends PlaceFactoryDefineOptions<TTransients>>(options: TOptions) => PlaceFactoryInterface<TTransients, PlaceTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Place} model.
 *
 * @param options
 * @returns factory {@link PlaceFactoryInterface}
 */
export const definePlaceFactory = (<TOptions extends PlaceFactoryDefineOptions>(options: TOptions): PlaceFactoryInterface<TOptions> => {
    return definePlaceFactoryInternal(options, {});
}) as PlaceFactoryBuilder;

definePlaceFactory.withTransientFields = defaultTransientFieldValues => options => definePlaceFactoryInternal(options, defaultTransientFieldValues);

type CommunityScalarOrEnumFields = {
    name: string;
    pointName: string;
};

type CommunityimageFactory = {
    _factoryFor: "Image";
    build: () => PromiseLike<Prisma.ImageCreateNestedOneWithoutCommunitiesInput["create"]>;
};

type CommunityconfigFactory = {
    _factoryFor: "CommunityConfig";
    build: () => PromiseLike<Prisma.CommunityConfigCreateNestedOneWithoutCommunityInput["create"]>;
};

type CommunityFactoryDefineInput = {
    id?: string;
    name?: string;
    pointName?: string;
    bio?: string | null;
    establishedAt?: Date | null;
    website?: string | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    image?: CommunityimageFactory | Prisma.ImageCreateNestedOneWithoutCommunitiesInput;
    config?: CommunityconfigFactory | Prisma.CommunityConfigCreateNestedOneWithoutCommunityInput;
    places?: Prisma.PlaceCreateNestedManyWithoutCommunityInput;
    identities?: Prisma.IdentityCreateNestedManyWithoutCommunityInput;
    memberships?: Prisma.MembershipCreateNestedManyWithoutCommunityInput;
    wallets?: Prisma.WalletCreateNestedManyWithoutCommunityInput;
    utilities?: Prisma.UtilityCreateNestedManyWithoutCommunityInput;
    opportunities?: Prisma.OpportunityCreateNestedManyWithoutCommunityInput;
    participations?: Prisma.ParticipationCreateNestedManyWithoutCommunityInput;
    articles?: Prisma.ArticleCreateNestedManyWithoutCommunityInput;
    nftInstance?: Prisma.NftInstanceCreateNestedManyWithoutCommunityInput;
};

type CommunityTransientFields = Record<string, unknown> & Partial<Record<keyof CommunityFactoryDefineInput, never>>;

type CommunityFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CommunityFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Community, Prisma.CommunityCreateInput, TTransients>;

type CommunityFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<CommunityFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: CommunityFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Community, Prisma.CommunityCreateInput, TTransients>;

function isCommunityimageFactory(x: CommunityimageFactory | Prisma.ImageCreateNestedOneWithoutCommunitiesInput | undefined): x is CommunityimageFactory {
    return (x as any)?._factoryFor === "Image";
}

function isCommunityconfigFactory(x: CommunityconfigFactory | Prisma.CommunityConfigCreateNestedOneWithoutCommunityInput | undefined): x is CommunityconfigFactory {
    return (x as any)?._factoryFor === "CommunityConfig";
}

type CommunityTraitKeys<TOptions extends CommunityFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface CommunityFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Community";
    build(inputData?: Partial<Prisma.CommunityCreateInput & TTransients>): PromiseLike<Prisma.CommunityCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.CommunityCreateInput & TTransients>): PromiseLike<Prisma.CommunityCreateInput>;
    buildList(list: readonly Partial<Prisma.CommunityCreateInput & TTransients>[]): PromiseLike<Prisma.CommunityCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.CommunityCreateInput & TTransients>): PromiseLike<Prisma.CommunityCreateInput[]>;
    pickForConnect(inputData: Community): Pick<Community, "id">;
    create(inputData?: Partial<Prisma.CommunityCreateInput & TTransients>): PromiseLike<Community>;
    createList(list: readonly Partial<Prisma.CommunityCreateInput & TTransients>[]): PromiseLike<Community[]>;
    createList(count: number, item?: Partial<Prisma.CommunityCreateInput & TTransients>): PromiseLike<Community[]>;
    createForConnect(inputData?: Partial<Prisma.CommunityCreateInput & TTransients>): PromiseLike<Pick<Community, "id">>;
}

export interface CommunityFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends CommunityFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): CommunityFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateCommunityScalarsOrEnums({ seq }: {
    readonly seq: number;
}): CommunityScalarOrEnumFields {
    return {
        name: getScalarFieldValueGenerator().String({ modelName: "Community", fieldName: "name", isId: false, isUnique: false, seq }),
        pointName: getScalarFieldValueGenerator().String({ modelName: "Community", fieldName: "pointName", isId: false, isUnique: false, seq })
    };
}

function defineCommunityFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends CommunityFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): CommunityFactoryInterface<TTransients, CommunityTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly CommunityTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Community", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.CommunityCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCommunityScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<CommunityFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<CommunityFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                image: isCommunityimageFactory(defaultData.image) ? {
                    create: await defaultData.image.build()
                } : defaultData.image,
                config: isCommunityconfigFactory(defaultData.config) ? {
                    create: await defaultData.config.build()
                } : defaultData.config
            } as Prisma.CommunityCreateInput;
            const data: Prisma.CommunityCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CommunityCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Community) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.CommunityCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().community.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CommunityCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.CommunityCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Community" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: CommunityTraitKeys<TOptions>, ...names: readonly CommunityTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface CommunityFactoryBuilder {
    <TOptions extends CommunityFactoryDefineOptions>(options?: TOptions): CommunityFactoryInterface<{}, CommunityTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CommunityTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CommunityFactoryDefineOptions<TTransients>>(options?: TOptions) => CommunityFactoryInterface<TTransients, CommunityTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Community} model.
 *
 * @param options
 * @returns factory {@link CommunityFactoryInterface}
 */
export const defineCommunityFactory = (<TOptions extends CommunityFactoryDefineOptions>(options?: TOptions): CommunityFactoryInterface<TOptions> => {
    return defineCommunityFactoryInternal(options ?? {}, {});
}) as CommunityFactoryBuilder;

defineCommunityFactory.withTransientFields = defaultTransientFieldValues => options => defineCommunityFactoryInternal(options ?? {}, defaultTransientFieldValues);

type CommunityConfigScalarOrEnumFields = {};

type CommunityConfigcommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutConfigInput["create"]>;
};

type CommunityConfigfirebaseConfigFactory = {
    _factoryFor: "CommunityFirebaseConfig";
    build: () => PromiseLike<Prisma.CommunityFirebaseConfigCreateNestedOneWithoutConfigInput["create"]>;
};

type CommunityConfiglineConfigFactory = {
    _factoryFor: "CommunityLineConfig";
    build: () => PromiseLike<Prisma.CommunityLineConfigCreateNestedOneWithoutConfigInput["create"]>;
};

type CommunityConfigFactoryDefineInput = {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date | null;
    community: CommunityConfigcommunityFactory | Prisma.CommunityCreateNestedOneWithoutConfigInput;
    firebaseConfig?: CommunityConfigfirebaseConfigFactory | Prisma.CommunityFirebaseConfigCreateNestedOneWithoutConfigInput;
    lineConfig?: CommunityConfiglineConfigFactory | Prisma.CommunityLineConfigCreateNestedOneWithoutConfigInput;
};

type CommunityConfigTransientFields = Record<string, unknown> & Partial<Record<keyof CommunityConfigFactoryDefineInput, never>>;

type CommunityConfigFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CommunityConfigFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<CommunityConfig, Prisma.CommunityConfigCreateInput, TTransients>;

type CommunityConfigFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<CommunityConfigFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: CommunityConfigFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<CommunityConfig, Prisma.CommunityConfigCreateInput, TTransients>;

function isCommunityConfigcommunityFactory(x: CommunityConfigcommunityFactory | Prisma.CommunityCreateNestedOneWithoutConfigInput | undefined): x is CommunityConfigcommunityFactory {
    return (x as any)?._factoryFor === "Community";
}

function isCommunityConfigfirebaseConfigFactory(x: CommunityConfigfirebaseConfigFactory | Prisma.CommunityFirebaseConfigCreateNestedOneWithoutConfigInput | undefined): x is CommunityConfigfirebaseConfigFactory {
    return (x as any)?._factoryFor === "CommunityFirebaseConfig";
}

function isCommunityConfiglineConfigFactory(x: CommunityConfiglineConfigFactory | Prisma.CommunityLineConfigCreateNestedOneWithoutConfigInput | undefined): x is CommunityConfiglineConfigFactory {
    return (x as any)?._factoryFor === "CommunityLineConfig";
}

type CommunityConfigTraitKeys<TOptions extends CommunityConfigFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface CommunityConfigFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "CommunityConfig";
    build(inputData?: Partial<Prisma.CommunityConfigCreateInput & TTransients>): PromiseLike<Prisma.CommunityConfigCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.CommunityConfigCreateInput & TTransients>): PromiseLike<Prisma.CommunityConfigCreateInput>;
    buildList(list: readonly Partial<Prisma.CommunityConfigCreateInput & TTransients>[]): PromiseLike<Prisma.CommunityConfigCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.CommunityConfigCreateInput & TTransients>): PromiseLike<Prisma.CommunityConfigCreateInput[]>;
    pickForConnect(inputData: CommunityConfig): Pick<CommunityConfig, "id">;
    create(inputData?: Partial<Prisma.CommunityConfigCreateInput & TTransients>): PromiseLike<CommunityConfig>;
    createList(list: readonly Partial<Prisma.CommunityConfigCreateInput & TTransients>[]): PromiseLike<CommunityConfig[]>;
    createList(count: number, item?: Partial<Prisma.CommunityConfigCreateInput & TTransients>): PromiseLike<CommunityConfig[]>;
    createForConnect(inputData?: Partial<Prisma.CommunityConfigCreateInput & TTransients>): PromiseLike<Pick<CommunityConfig, "id">>;
}

export interface CommunityConfigFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends CommunityConfigFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): CommunityConfigFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateCommunityConfigScalarsOrEnums({ seq }: {
    readonly seq: number;
}): CommunityConfigScalarOrEnumFields {
    return {};
}

function defineCommunityConfigFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends CommunityConfigFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): CommunityConfigFactoryInterface<TTransients, CommunityConfigTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly CommunityConfigTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("CommunityConfig", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.CommunityConfigCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCommunityConfigScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<CommunityConfigFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<CommunityConfigFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                community: isCommunityConfigcommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community,
                firebaseConfig: isCommunityConfigfirebaseConfigFactory(defaultData.firebaseConfig) ? {
                    create: await defaultData.firebaseConfig.build()
                } : defaultData.firebaseConfig,
                lineConfig: isCommunityConfiglineConfigFactory(defaultData.lineConfig) ? {
                    create: await defaultData.lineConfig.build()
                } : defaultData.lineConfig
            } as Prisma.CommunityConfigCreateInput;
            const data: Prisma.CommunityConfigCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CommunityConfigCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: CommunityConfig) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.CommunityConfigCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().communityConfig.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CommunityConfigCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.CommunityConfigCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "CommunityConfig" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: CommunityConfigTraitKeys<TOptions>, ...names: readonly CommunityConfigTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface CommunityConfigFactoryBuilder {
    <TOptions extends CommunityConfigFactoryDefineOptions>(options: TOptions): CommunityConfigFactoryInterface<{}, CommunityConfigTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CommunityConfigTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CommunityConfigFactoryDefineOptions<TTransients>>(options: TOptions) => CommunityConfigFactoryInterface<TTransients, CommunityConfigTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link CommunityConfig} model.
 *
 * @param options
 * @returns factory {@link CommunityConfigFactoryInterface}
 */
export const defineCommunityConfigFactory = (<TOptions extends CommunityConfigFactoryDefineOptions>(options: TOptions): CommunityConfigFactoryInterface<TOptions> => {
    return defineCommunityConfigFactoryInternal(options, {});
}) as CommunityConfigFactoryBuilder;

defineCommunityConfigFactory.withTransientFields = defaultTransientFieldValues => options => defineCommunityConfigFactoryInternal(options, defaultTransientFieldValues);

type CommunityFirebaseConfigScalarOrEnumFields = {
    tenantId: string;
};

type CommunityFirebaseConfigconfigFactory = {
    _factoryFor: "CommunityConfig";
    build: () => PromiseLike<Prisma.CommunityConfigCreateNestedOneWithoutFirebaseConfigInput["create"]>;
};

type CommunityFirebaseConfigFactoryDefineInput = {
    id?: string;
    tenantId?: string;
    createdAt?: Date;
    updatedAt?: Date | null;
    config?: CommunityFirebaseConfigconfigFactory | Prisma.CommunityConfigCreateNestedOneWithoutFirebaseConfigInput;
};

type CommunityFirebaseConfigTransientFields = Record<string, unknown> & Partial<Record<keyof CommunityFirebaseConfigFactoryDefineInput, never>>;

type CommunityFirebaseConfigFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CommunityFirebaseConfigFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<CommunityFirebaseConfig, Prisma.CommunityFirebaseConfigCreateInput, TTransients>;

type CommunityFirebaseConfigFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<CommunityFirebaseConfigFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: CommunityFirebaseConfigFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<CommunityFirebaseConfig, Prisma.CommunityFirebaseConfigCreateInput, TTransients>;

function isCommunityFirebaseConfigconfigFactory(x: CommunityFirebaseConfigconfigFactory | Prisma.CommunityConfigCreateNestedOneWithoutFirebaseConfigInput | undefined): x is CommunityFirebaseConfigconfigFactory {
    return (x as any)?._factoryFor === "CommunityConfig";
}

type CommunityFirebaseConfigTraitKeys<TOptions extends CommunityFirebaseConfigFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface CommunityFirebaseConfigFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "CommunityFirebaseConfig";
    build(inputData?: Partial<Prisma.CommunityFirebaseConfigCreateInput & TTransients>): PromiseLike<Prisma.CommunityFirebaseConfigCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.CommunityFirebaseConfigCreateInput & TTransients>): PromiseLike<Prisma.CommunityFirebaseConfigCreateInput>;
    buildList(list: readonly Partial<Prisma.CommunityFirebaseConfigCreateInput & TTransients>[]): PromiseLike<Prisma.CommunityFirebaseConfigCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.CommunityFirebaseConfigCreateInput & TTransients>): PromiseLike<Prisma.CommunityFirebaseConfigCreateInput[]>;
    pickForConnect(inputData: CommunityFirebaseConfig): Pick<CommunityFirebaseConfig, "id">;
    create(inputData?: Partial<Prisma.CommunityFirebaseConfigCreateInput & TTransients>): PromiseLike<CommunityFirebaseConfig>;
    createList(list: readonly Partial<Prisma.CommunityFirebaseConfigCreateInput & TTransients>[]): PromiseLike<CommunityFirebaseConfig[]>;
    createList(count: number, item?: Partial<Prisma.CommunityFirebaseConfigCreateInput & TTransients>): PromiseLike<CommunityFirebaseConfig[]>;
    createForConnect(inputData?: Partial<Prisma.CommunityFirebaseConfigCreateInput & TTransients>): PromiseLike<Pick<CommunityFirebaseConfig, "id">>;
}

export interface CommunityFirebaseConfigFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends CommunityFirebaseConfigFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): CommunityFirebaseConfigFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateCommunityFirebaseConfigScalarsOrEnums({ seq }: {
    readonly seq: number;
}): CommunityFirebaseConfigScalarOrEnumFields {
    return {
        tenantId: getScalarFieldValueGenerator().String({ modelName: "CommunityFirebaseConfig", fieldName: "tenantId", isId: false, isUnique: false, seq })
    };
}

function defineCommunityFirebaseConfigFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends CommunityFirebaseConfigFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): CommunityFirebaseConfigFactoryInterface<TTransients, CommunityFirebaseConfigTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly CommunityFirebaseConfigTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("CommunityFirebaseConfig", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.CommunityFirebaseConfigCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCommunityFirebaseConfigScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<CommunityFirebaseConfigFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<CommunityFirebaseConfigFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                config: isCommunityFirebaseConfigconfigFactory(defaultData.config) ? {
                    create: await defaultData.config.build()
                } : defaultData.config
            } as Prisma.CommunityFirebaseConfigCreateInput;
            const data: Prisma.CommunityFirebaseConfigCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CommunityFirebaseConfigCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: CommunityFirebaseConfig) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.CommunityFirebaseConfigCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().communityFirebaseConfig.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CommunityFirebaseConfigCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.CommunityFirebaseConfigCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "CommunityFirebaseConfig" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: CommunityFirebaseConfigTraitKeys<TOptions>, ...names: readonly CommunityFirebaseConfigTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface CommunityFirebaseConfigFactoryBuilder {
    <TOptions extends CommunityFirebaseConfigFactoryDefineOptions>(options?: TOptions): CommunityFirebaseConfigFactoryInterface<{}, CommunityFirebaseConfigTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CommunityFirebaseConfigTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CommunityFirebaseConfigFactoryDefineOptions<TTransients>>(options?: TOptions) => CommunityFirebaseConfigFactoryInterface<TTransients, CommunityFirebaseConfigTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link CommunityFirebaseConfig} model.
 *
 * @param options
 * @returns factory {@link CommunityFirebaseConfigFactoryInterface}
 */
export const defineCommunityFirebaseConfigFactory = (<TOptions extends CommunityFirebaseConfigFactoryDefineOptions>(options?: TOptions): CommunityFirebaseConfigFactoryInterface<TOptions> => {
    return defineCommunityFirebaseConfigFactoryInternal(options ?? {}, {});
}) as CommunityFirebaseConfigFactoryBuilder;

defineCommunityFirebaseConfigFactory.withTransientFields = defaultTransientFieldValues => options => defineCommunityFirebaseConfigFactoryInternal(options ?? {}, defaultTransientFieldValues);

type CommunityLineConfigScalarOrEnumFields = {
    channelId: string;
    channelSecret: string;
    accessToken: string;
    liffId: string;
    liffBaseUrl: string;
};

type CommunityLineConfigconfigFactory = {
    _factoryFor: "CommunityConfig";
    build: () => PromiseLike<Prisma.CommunityConfigCreateNestedOneWithoutLineConfigInput["create"]>;
};

type CommunityLineConfigFactoryDefineInput = {
    id?: string;
    channelId?: string;
    channelSecret?: string;
    accessToken?: string;
    liffId?: string;
    liffBaseUrl?: string;
    createdAt?: Date;
    updatedAt?: Date | null;
    config?: CommunityLineConfigconfigFactory | Prisma.CommunityConfigCreateNestedOneWithoutLineConfigInput;
    richMenus?: Prisma.CommunityLineRichMenuConfigCreateNestedManyWithoutConfigInput;
};

type CommunityLineConfigTransientFields = Record<string, unknown> & Partial<Record<keyof CommunityLineConfigFactoryDefineInput, never>>;

type CommunityLineConfigFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CommunityLineConfigFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<CommunityLineConfig, Prisma.CommunityLineConfigCreateInput, TTransients>;

type CommunityLineConfigFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<CommunityLineConfigFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: CommunityLineConfigFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<CommunityLineConfig, Prisma.CommunityLineConfigCreateInput, TTransients>;

function isCommunityLineConfigconfigFactory(x: CommunityLineConfigconfigFactory | Prisma.CommunityConfigCreateNestedOneWithoutLineConfigInput | undefined): x is CommunityLineConfigconfigFactory {
    return (x as any)?._factoryFor === "CommunityConfig";
}

type CommunityLineConfigTraitKeys<TOptions extends CommunityLineConfigFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface CommunityLineConfigFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "CommunityLineConfig";
    build(inputData?: Partial<Prisma.CommunityLineConfigCreateInput & TTransients>): PromiseLike<Prisma.CommunityLineConfigCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.CommunityLineConfigCreateInput & TTransients>): PromiseLike<Prisma.CommunityLineConfigCreateInput>;
    buildList(list: readonly Partial<Prisma.CommunityLineConfigCreateInput & TTransients>[]): PromiseLike<Prisma.CommunityLineConfigCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.CommunityLineConfigCreateInput & TTransients>): PromiseLike<Prisma.CommunityLineConfigCreateInput[]>;
    pickForConnect(inputData: CommunityLineConfig): Pick<CommunityLineConfig, "id">;
    create(inputData?: Partial<Prisma.CommunityLineConfigCreateInput & TTransients>): PromiseLike<CommunityLineConfig>;
    createList(list: readonly Partial<Prisma.CommunityLineConfigCreateInput & TTransients>[]): PromiseLike<CommunityLineConfig[]>;
    createList(count: number, item?: Partial<Prisma.CommunityLineConfigCreateInput & TTransients>): PromiseLike<CommunityLineConfig[]>;
    createForConnect(inputData?: Partial<Prisma.CommunityLineConfigCreateInput & TTransients>): PromiseLike<Pick<CommunityLineConfig, "id">>;
}

export interface CommunityLineConfigFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends CommunityLineConfigFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): CommunityLineConfigFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateCommunityLineConfigScalarsOrEnums({ seq }: {
    readonly seq: number;
}): CommunityLineConfigScalarOrEnumFields {
    return {
        channelId: getScalarFieldValueGenerator().String({ modelName: "CommunityLineConfig", fieldName: "channelId", isId: false, isUnique: false, seq }),
        channelSecret: getScalarFieldValueGenerator().String({ modelName: "CommunityLineConfig", fieldName: "channelSecret", isId: false, isUnique: false, seq }),
        accessToken: getScalarFieldValueGenerator().String({ modelName: "CommunityLineConfig", fieldName: "accessToken", isId: false, isUnique: false, seq }),
        liffId: getScalarFieldValueGenerator().String({ modelName: "CommunityLineConfig", fieldName: "liffId", isId: false, isUnique: false, seq }),
        liffBaseUrl: getScalarFieldValueGenerator().String({ modelName: "CommunityLineConfig", fieldName: "liffBaseUrl", isId: false, isUnique: false, seq })
    };
}

function defineCommunityLineConfigFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends CommunityLineConfigFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): CommunityLineConfigFactoryInterface<TTransients, CommunityLineConfigTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly CommunityLineConfigTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("CommunityLineConfig", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.CommunityLineConfigCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCommunityLineConfigScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<CommunityLineConfigFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<CommunityLineConfigFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                config: isCommunityLineConfigconfigFactory(defaultData.config) ? {
                    create: await defaultData.config.build()
                } : defaultData.config
            } as Prisma.CommunityLineConfigCreateInput;
            const data: Prisma.CommunityLineConfigCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CommunityLineConfigCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: CommunityLineConfig) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.CommunityLineConfigCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().communityLineConfig.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CommunityLineConfigCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.CommunityLineConfigCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "CommunityLineConfig" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: CommunityLineConfigTraitKeys<TOptions>, ...names: readonly CommunityLineConfigTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface CommunityLineConfigFactoryBuilder {
    <TOptions extends CommunityLineConfigFactoryDefineOptions>(options?: TOptions): CommunityLineConfigFactoryInterface<{}, CommunityLineConfigTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CommunityLineConfigTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CommunityLineConfigFactoryDefineOptions<TTransients>>(options?: TOptions) => CommunityLineConfigFactoryInterface<TTransients, CommunityLineConfigTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link CommunityLineConfig} model.
 *
 * @param options
 * @returns factory {@link CommunityLineConfigFactoryInterface}
 */
export const defineCommunityLineConfigFactory = (<TOptions extends CommunityLineConfigFactoryDefineOptions>(options?: TOptions): CommunityLineConfigFactoryInterface<TOptions> => {
    return defineCommunityLineConfigFactoryInternal(options ?? {}, {});
}) as CommunityLineConfigFactoryBuilder;

defineCommunityLineConfigFactory.withTransientFields = defaultTransientFieldValues => options => defineCommunityLineConfigFactoryInternal(options ?? {}, defaultTransientFieldValues);

type CommunityLineRichMenuConfigScalarOrEnumFields = {
    type: LineRichMenuType;
    richMenuId: string;
};

type CommunityLineRichMenuConfigconfigFactory = {
    _factoryFor: "CommunityLineConfig";
    build: () => PromiseLike<Prisma.CommunityLineConfigCreateNestedOneWithoutRichMenusInput["create"]>;
};

type CommunityLineRichMenuConfigFactoryDefineInput = {
    id?: string;
    type?: LineRichMenuType;
    richMenuId?: string;
    createdAt?: Date;
    updatedAt?: Date | null;
    config: CommunityLineRichMenuConfigconfigFactory | Prisma.CommunityLineConfigCreateNestedOneWithoutRichMenusInput;
};

type CommunityLineRichMenuConfigTransientFields = Record<string, unknown> & Partial<Record<keyof CommunityLineRichMenuConfigFactoryDefineInput, never>>;

type CommunityLineRichMenuConfigFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CommunityLineRichMenuConfigFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<CommunityLineRichMenuConfig, Prisma.CommunityLineRichMenuConfigCreateInput, TTransients>;

type CommunityLineRichMenuConfigFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<CommunityLineRichMenuConfigFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: CommunityLineRichMenuConfigFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<CommunityLineRichMenuConfig, Prisma.CommunityLineRichMenuConfigCreateInput, TTransients>;

function isCommunityLineRichMenuConfigconfigFactory(x: CommunityLineRichMenuConfigconfigFactory | Prisma.CommunityLineConfigCreateNestedOneWithoutRichMenusInput | undefined): x is CommunityLineRichMenuConfigconfigFactory {
    return (x as any)?._factoryFor === "CommunityLineConfig";
}

type CommunityLineRichMenuConfigTraitKeys<TOptions extends CommunityLineRichMenuConfigFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface CommunityLineRichMenuConfigFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "CommunityLineRichMenuConfig";
    build(inputData?: Partial<Prisma.CommunityLineRichMenuConfigCreateInput & TTransients>): PromiseLike<Prisma.CommunityLineRichMenuConfigCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.CommunityLineRichMenuConfigCreateInput & TTransients>): PromiseLike<Prisma.CommunityLineRichMenuConfigCreateInput>;
    buildList(list: readonly Partial<Prisma.CommunityLineRichMenuConfigCreateInput & TTransients>[]): PromiseLike<Prisma.CommunityLineRichMenuConfigCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.CommunityLineRichMenuConfigCreateInput & TTransients>): PromiseLike<Prisma.CommunityLineRichMenuConfigCreateInput[]>;
    pickForConnect(inputData: CommunityLineRichMenuConfig): Pick<CommunityLineRichMenuConfig, "id">;
    create(inputData?: Partial<Prisma.CommunityLineRichMenuConfigCreateInput & TTransients>): PromiseLike<CommunityLineRichMenuConfig>;
    createList(list: readonly Partial<Prisma.CommunityLineRichMenuConfigCreateInput & TTransients>[]): PromiseLike<CommunityLineRichMenuConfig[]>;
    createList(count: number, item?: Partial<Prisma.CommunityLineRichMenuConfigCreateInput & TTransients>): PromiseLike<CommunityLineRichMenuConfig[]>;
    createForConnect(inputData?: Partial<Prisma.CommunityLineRichMenuConfigCreateInput & TTransients>): PromiseLike<Pick<CommunityLineRichMenuConfig, "id">>;
}

export interface CommunityLineRichMenuConfigFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends CommunityLineRichMenuConfigFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): CommunityLineRichMenuConfigFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateCommunityLineRichMenuConfigScalarsOrEnums({ seq }: {
    readonly seq: number;
}): CommunityLineRichMenuConfigScalarOrEnumFields {
    return {
        type: "ADMIN",
        richMenuId: getScalarFieldValueGenerator().String({ modelName: "CommunityLineRichMenuConfig", fieldName: "richMenuId", isId: false, isUnique: false, seq })
    };
}

function defineCommunityLineRichMenuConfigFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends CommunityLineRichMenuConfigFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): CommunityLineRichMenuConfigFactoryInterface<TTransients, CommunityLineRichMenuConfigTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly CommunityLineRichMenuConfigTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("CommunityLineRichMenuConfig", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.CommunityLineRichMenuConfigCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCommunityLineRichMenuConfigScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<CommunityLineRichMenuConfigFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<CommunityLineRichMenuConfigFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                config: isCommunityLineRichMenuConfigconfigFactory(defaultData.config) ? {
                    create: await defaultData.config.build()
                } : defaultData.config
            } as Prisma.CommunityLineRichMenuConfigCreateInput;
            const data: Prisma.CommunityLineRichMenuConfigCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CommunityLineRichMenuConfigCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: CommunityLineRichMenuConfig) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.CommunityLineRichMenuConfigCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().communityLineRichMenuConfig.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CommunityLineRichMenuConfigCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.CommunityLineRichMenuConfigCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "CommunityLineRichMenuConfig" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: CommunityLineRichMenuConfigTraitKeys<TOptions>, ...names: readonly CommunityLineRichMenuConfigTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface CommunityLineRichMenuConfigFactoryBuilder {
    <TOptions extends CommunityLineRichMenuConfigFactoryDefineOptions>(options: TOptions): CommunityLineRichMenuConfigFactoryInterface<{}, CommunityLineRichMenuConfigTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CommunityLineRichMenuConfigTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CommunityLineRichMenuConfigFactoryDefineOptions<TTransients>>(options: TOptions) => CommunityLineRichMenuConfigFactoryInterface<TTransients, CommunityLineRichMenuConfigTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link CommunityLineRichMenuConfig} model.
 *
 * @param options
 * @returns factory {@link CommunityLineRichMenuConfigFactoryInterface}
 */
export const defineCommunityLineRichMenuConfigFactory = (<TOptions extends CommunityLineRichMenuConfigFactoryDefineOptions>(options: TOptions): CommunityLineRichMenuConfigFactoryInterface<TOptions> => {
    return defineCommunityLineRichMenuConfigFactoryInternal(options, {});
}) as CommunityLineRichMenuConfigFactoryBuilder;

defineCommunityLineRichMenuConfigFactory.withTransientFields = defaultTransientFieldValues => options => defineCommunityLineRichMenuConfigFactoryInternal(options, defaultTransientFieldValues);

type UserScalarOrEnumFields = {
    name: string;
    slug: string;
    currentPrefecture: CurrentPrefecture;
};

type UserimageFactory = {
    _factoryFor: "Image";
    build: () => PromiseLike<Prisma.ImageCreateNestedOneWithoutUsersInput["create"]>;
};

type UserFactoryDefineInput = {
    id?: string;
    name?: string;
    slug?: string;
    bio?: string | null;
    sysRole?: SysRole;
    currentPrefecture?: CurrentPrefecture;
    phoneNumber?: string | null;
    urlWebsite?: string | null;
    urlX?: string | null;
    urlFacebook?: string | null;
    urlInstagram?: string | null;
    urlYoutube?: string | null;
    urlTiktok?: string | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    image?: UserimageFactory | Prisma.ImageCreateNestedOneWithoutUsersInput;
    identities?: Prisma.IdentityCreateNestedManyWithoutUserInput;
    nftWallets?: Prisma.NftWalletCreateNestedManyWithoutUserInput;
    didIssuanceRequests?: Prisma.DidIssuanceRequestCreateNestedManyWithoutUserInput;
    vcIssuanceRequests?: Prisma.VcIssuanceRequestCreateNestedManyWithoutUserInput;
    memberships?: Prisma.MembershipCreateNestedManyWithoutUserInput;
    membershipChangedByMe?: Prisma.MembershipHistoryCreateNestedManyWithoutCreatedByUserInput;
    wallets?: Prisma.WalletCreateNestedManyWithoutUserInput;
    utiltyOwnedByMe?: Prisma.UtilityCreateNestedManyWithoutOwnerInput;
    ticketIssuedByMe?: Prisma.TicketIssuerCreateNestedManyWithoutOwnerInput;
    ticketStatusChangedByMe?: Prisma.TicketStatusHistoryCreateNestedManyWithoutCreatedByUserInput;
    opportunitiesCreatedByMe?: Prisma.OpportunityCreateNestedManyWithoutCreatedByUserInput;
    reservationsAppliedByMe?: Prisma.ReservationCreateNestedManyWithoutCreatedByUserInput;
    reservationStatusChangedByMe?: Prisma.ReservationHistoryCreateNestedManyWithoutCreatedByUserInput;
    participations?: Prisma.ParticipationCreateNestedManyWithoutUserInput;
    participationStatusChangedByMe?: Prisma.ParticipationStatusHistoryCreateNestedManyWithoutCreatedByUserInput;
    evaluationsEvaluatedByMe?: Prisma.EvaluationCreateNestedManyWithoutEvaluatorInput;
    evaluationCreatedByMe?: Prisma.EvaluationHistoryCreateNestedManyWithoutCreatedByUserInput;
    transactionsCreatedByMe?: Prisma.TransactionCreateNestedManyWithoutCreatedByUserInput;
    articlesWrittenByMe?: Prisma.ArticleCreateNestedManyWithoutAuthorsInput;
    articlesAboutMe?: Prisma.ArticleCreateNestedManyWithoutRelatedUsersInput;
    orders?: Prisma.OrderCreateNestedManyWithoutUserInput;
};

type UserTransientFields = Record<string, unknown> & Partial<Record<keyof UserFactoryDefineInput, never>>;

type UserFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<UserFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<User, Prisma.UserCreateInput, TTransients>;

type UserFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<UserFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: UserFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<User, Prisma.UserCreateInput, TTransients>;

function isUserimageFactory(x: UserimageFactory | Prisma.ImageCreateNestedOneWithoutUsersInput | undefined): x is UserimageFactory {
    return (x as any)?._factoryFor === "Image";
}

type UserTraitKeys<TOptions extends UserFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface UserFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "User";
    build(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Prisma.UserCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Prisma.UserCreateInput>;
    buildList(list: readonly Partial<Prisma.UserCreateInput & TTransients>[]): PromiseLike<Prisma.UserCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Prisma.UserCreateInput[]>;
    pickForConnect(inputData: User): Pick<User, "id">;
    create(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<User>;
    createList(list: readonly Partial<Prisma.UserCreateInput & TTransients>[]): PromiseLike<User[]>;
    createList(count: number, item?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<User[]>;
    createForConnect(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Pick<User, "id">>;
}

export interface UserFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends UserFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): UserFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateUserScalarsOrEnums({ seq }: {
    readonly seq: number;
}): UserScalarOrEnumFields {
    return {
        name: getScalarFieldValueGenerator().String({ modelName: "User", fieldName: "name", isId: false, isUnique: false, seq }),
        slug: getScalarFieldValueGenerator().String({ modelName: "User", fieldName: "slug", isId: false, isUnique: false, seq }),
        currentPrefecture: "KAGAWA"
    };
}

function defineUserFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends UserFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): UserFactoryInterface<TTransients, UserTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly UserTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("User", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.UserCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateUserScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<UserFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<UserFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                image: isUserimageFactory(defaultData.image) ? {
                    create: await defaultData.image.build()
                } : defaultData.image
            } as Prisma.UserCreateInput;
            const data: Prisma.UserCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.UserCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: User) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.UserCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().user.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.UserCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.UserCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "User" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: UserTraitKeys<TOptions>, ...names: readonly UserTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface UserFactoryBuilder {
    <TOptions extends UserFactoryDefineOptions>(options?: TOptions): UserFactoryInterface<{}, UserTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends UserTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends UserFactoryDefineOptions<TTransients>>(options?: TOptions) => UserFactoryInterface<TTransients, UserTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link User} model.
 *
 * @param options
 * @returns factory {@link UserFactoryInterface}
 */
export const defineUserFactory = (<TOptions extends UserFactoryDefineOptions>(options?: TOptions): UserFactoryInterface<TOptions> => {
    return defineUserFactoryInternal(options ?? {}, {});
}) as UserFactoryBuilder;

defineUserFactory.withTransientFields = defaultTransientFieldValues => options => defineUserFactoryInternal(options ?? {}, defaultTransientFieldValues);

type IdentityScalarOrEnumFields = {
    uid: string;
    platform: IdentityPlatform;
};

type IdentityuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutIdentitiesInput["create"]>;
};

type IdentitycommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutIdentitiesInput["create"]>;
};

type IdentityFactoryDefineInput = {
    uid?: string;
    platform?: IdentityPlatform;
    authToken?: string | null;
    refreshToken?: string | null;
    tokenExpiresAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: IdentityuserFactory | Prisma.UserCreateNestedOneWithoutIdentitiesInput;
    community?: IdentitycommunityFactory | Prisma.CommunityCreateNestedOneWithoutIdentitiesInput;
};

type IdentityTransientFields = Record<string, unknown> & Partial<Record<keyof IdentityFactoryDefineInput, never>>;

type IdentityFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<IdentityFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Identity, Prisma.IdentityCreateInput, TTransients>;

type IdentityFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<IdentityFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: IdentityFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Identity, Prisma.IdentityCreateInput, TTransients>;

function isIdentityuserFactory(x: IdentityuserFactory | Prisma.UserCreateNestedOneWithoutIdentitiesInput | undefined): x is IdentityuserFactory {
    return (x as any)?._factoryFor === "User";
}

function isIdentitycommunityFactory(x: IdentitycommunityFactory | Prisma.CommunityCreateNestedOneWithoutIdentitiesInput | undefined): x is IdentitycommunityFactory {
    return (x as any)?._factoryFor === "Community";
}

type IdentityTraitKeys<TOptions extends IdentityFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface IdentityFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Identity";
    build(inputData?: Partial<Prisma.IdentityCreateInput & TTransients>): PromiseLike<Prisma.IdentityCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.IdentityCreateInput & TTransients>): PromiseLike<Prisma.IdentityCreateInput>;
    buildList(list: readonly Partial<Prisma.IdentityCreateInput & TTransients>[]): PromiseLike<Prisma.IdentityCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.IdentityCreateInput & TTransients>): PromiseLike<Prisma.IdentityCreateInput[]>;
    pickForConnect(inputData: Identity): Pick<Identity, "uid">;
    create(inputData?: Partial<Prisma.IdentityCreateInput & TTransients>): PromiseLike<Identity>;
    createList(list: readonly Partial<Prisma.IdentityCreateInput & TTransients>[]): PromiseLike<Identity[]>;
    createList(count: number, item?: Partial<Prisma.IdentityCreateInput & TTransients>): PromiseLike<Identity[]>;
    createForConnect(inputData?: Partial<Prisma.IdentityCreateInput & TTransients>): PromiseLike<Pick<Identity, "uid">>;
}

export interface IdentityFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends IdentityFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): IdentityFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateIdentityScalarsOrEnums({ seq }: {
    readonly seq: number;
}): IdentityScalarOrEnumFields {
    return {
        uid: getScalarFieldValueGenerator().String({ modelName: "Identity", fieldName: "uid", isId: true, isUnique: false, seq }),
        platform: "LINE"
    };
}

function defineIdentityFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends IdentityFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): IdentityFactoryInterface<TTransients, IdentityTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly IdentityTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Identity", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.IdentityCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateIdentityScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<IdentityFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<IdentityFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isIdentityuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                community: isIdentitycommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community
            } as Prisma.IdentityCreateInput;
            const data: Prisma.IdentityCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.IdentityCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Identity) => ({
            uid: inputData.uid
        });
        const create = async (inputData: Partial<Prisma.IdentityCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().identity.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.IdentityCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.IdentityCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Identity" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: IdentityTraitKeys<TOptions>, ...names: readonly IdentityTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface IdentityFactoryBuilder {
    <TOptions extends IdentityFactoryDefineOptions>(options: TOptions): IdentityFactoryInterface<{}, IdentityTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends IdentityTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends IdentityFactoryDefineOptions<TTransients>>(options: TOptions) => IdentityFactoryInterface<TTransients, IdentityTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Identity} model.
 *
 * @param options
 * @returns factory {@link IdentityFactoryInterface}
 */
export const defineIdentityFactory = (<TOptions extends IdentityFactoryDefineOptions>(options: TOptions): IdentityFactoryInterface<TOptions> => {
    return defineIdentityFactoryInternal(options, {});
}) as IdentityFactoryBuilder;

defineIdentityFactory.withTransientFields = defaultTransientFieldValues => options => defineIdentityFactoryInternal(options, defaultTransientFieldValues);

type DidIssuanceRequestScalarOrEnumFields = {};

type DidIssuanceRequestuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutDidIssuanceRequestsInput["create"]>;
};

type DidIssuanceRequestFactoryDefineInput = {
    id?: string;
    status?: DidIssuanceStatus;
    jobId?: string | null;
    didValue?: string | null;
    errorMessage?: string | null;
    retryCount?: number;
    requestedAt?: Date;
    processedAt?: Date | null;
    completedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: DidIssuanceRequestuserFactory | Prisma.UserCreateNestedOneWithoutDidIssuanceRequestsInput;
};

type DidIssuanceRequestTransientFields = Record<string, unknown> & Partial<Record<keyof DidIssuanceRequestFactoryDefineInput, never>>;

type DidIssuanceRequestFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<DidIssuanceRequestFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<DidIssuanceRequest, Prisma.DidIssuanceRequestCreateInput, TTransients>;

type DidIssuanceRequestFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<DidIssuanceRequestFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: DidIssuanceRequestFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<DidIssuanceRequest, Prisma.DidIssuanceRequestCreateInput, TTransients>;

function isDidIssuanceRequestuserFactory(x: DidIssuanceRequestuserFactory | Prisma.UserCreateNestedOneWithoutDidIssuanceRequestsInput | undefined): x is DidIssuanceRequestuserFactory {
    return (x as any)?._factoryFor === "User";
}

type DidIssuanceRequestTraitKeys<TOptions extends DidIssuanceRequestFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface DidIssuanceRequestFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "DidIssuanceRequest";
    build(inputData?: Partial<Prisma.DidIssuanceRequestCreateInput & TTransients>): PromiseLike<Prisma.DidIssuanceRequestCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.DidIssuanceRequestCreateInput & TTransients>): PromiseLike<Prisma.DidIssuanceRequestCreateInput>;
    buildList(list: readonly Partial<Prisma.DidIssuanceRequestCreateInput & TTransients>[]): PromiseLike<Prisma.DidIssuanceRequestCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.DidIssuanceRequestCreateInput & TTransients>): PromiseLike<Prisma.DidIssuanceRequestCreateInput[]>;
    pickForConnect(inputData: DidIssuanceRequest): Pick<DidIssuanceRequest, "id">;
    create(inputData?: Partial<Prisma.DidIssuanceRequestCreateInput & TTransients>): PromiseLike<DidIssuanceRequest>;
    createList(list: readonly Partial<Prisma.DidIssuanceRequestCreateInput & TTransients>[]): PromiseLike<DidIssuanceRequest[]>;
    createList(count: number, item?: Partial<Prisma.DidIssuanceRequestCreateInput & TTransients>): PromiseLike<DidIssuanceRequest[]>;
    createForConnect(inputData?: Partial<Prisma.DidIssuanceRequestCreateInput & TTransients>): PromiseLike<Pick<DidIssuanceRequest, "id">>;
}

export interface DidIssuanceRequestFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends DidIssuanceRequestFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): DidIssuanceRequestFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateDidIssuanceRequestScalarsOrEnums({ seq }: {
    readonly seq: number;
}): DidIssuanceRequestScalarOrEnumFields {
    return {};
}

function defineDidIssuanceRequestFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends DidIssuanceRequestFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): DidIssuanceRequestFactoryInterface<TTransients, DidIssuanceRequestTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly DidIssuanceRequestTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("DidIssuanceRequest", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.DidIssuanceRequestCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateDidIssuanceRequestScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<DidIssuanceRequestFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<DidIssuanceRequestFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isDidIssuanceRequestuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user
            } as Prisma.DidIssuanceRequestCreateInput;
            const data: Prisma.DidIssuanceRequestCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.DidIssuanceRequestCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: DidIssuanceRequest) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.DidIssuanceRequestCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().didIssuanceRequest.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.DidIssuanceRequestCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.DidIssuanceRequestCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "DidIssuanceRequest" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: DidIssuanceRequestTraitKeys<TOptions>, ...names: readonly DidIssuanceRequestTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface DidIssuanceRequestFactoryBuilder {
    <TOptions extends DidIssuanceRequestFactoryDefineOptions>(options: TOptions): DidIssuanceRequestFactoryInterface<{}, DidIssuanceRequestTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends DidIssuanceRequestTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends DidIssuanceRequestFactoryDefineOptions<TTransients>>(options: TOptions) => DidIssuanceRequestFactoryInterface<TTransients, DidIssuanceRequestTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link DidIssuanceRequest} model.
 *
 * @param options
 * @returns factory {@link DidIssuanceRequestFactoryInterface}
 */
export const defineDidIssuanceRequestFactory = (<TOptions extends DidIssuanceRequestFactoryDefineOptions>(options: TOptions): DidIssuanceRequestFactoryInterface<TOptions> => {
    return defineDidIssuanceRequestFactoryInternal(options, {});
}) as DidIssuanceRequestFactoryBuilder;

defineDidIssuanceRequestFactory.withTransientFields = defaultTransientFieldValues => options => defineDidIssuanceRequestFactoryInternal(options, defaultTransientFieldValues);

type VcIssuanceRequestScalarOrEnumFields = {
    claims: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
};

type VcIssuanceRequestevaluationFactory = {
    _factoryFor: "Evaluation";
    build: () => PromiseLike<Prisma.EvaluationCreateNestedOneWithoutVcIssuanceRequestInput["create"]>;
};

type VcIssuanceRequestuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutVcIssuanceRequestsInput["create"]>;
};

type VcIssuanceRequestFactoryDefineInput = {
    id?: string;
    status?: VcIssuanceStatus;
    jobId?: string | null;
    vcRecordId?: string | null;
    claims?: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
    credentialFormat?: string | null;
    schemaId?: string | null;
    errorMessage?: string | null;
    retryCount?: number;
    requestedAt?: Date;
    processedAt?: Date | null;
    completedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    evaluation: VcIssuanceRequestevaluationFactory | Prisma.EvaluationCreateNestedOneWithoutVcIssuanceRequestInput;
    user: VcIssuanceRequestuserFactory | Prisma.UserCreateNestedOneWithoutVcIssuanceRequestsInput;
};

type VcIssuanceRequestTransientFields = Record<string, unknown> & Partial<Record<keyof VcIssuanceRequestFactoryDefineInput, never>>;

type VcIssuanceRequestFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<VcIssuanceRequestFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<VcIssuanceRequest, Prisma.VcIssuanceRequestCreateInput, TTransients>;

type VcIssuanceRequestFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<VcIssuanceRequestFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: VcIssuanceRequestFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<VcIssuanceRequest, Prisma.VcIssuanceRequestCreateInput, TTransients>;

function isVcIssuanceRequestevaluationFactory(x: VcIssuanceRequestevaluationFactory | Prisma.EvaluationCreateNestedOneWithoutVcIssuanceRequestInput | undefined): x is VcIssuanceRequestevaluationFactory {
    return (x as any)?._factoryFor === "Evaluation";
}

function isVcIssuanceRequestuserFactory(x: VcIssuanceRequestuserFactory | Prisma.UserCreateNestedOneWithoutVcIssuanceRequestsInput | undefined): x is VcIssuanceRequestuserFactory {
    return (x as any)?._factoryFor === "User";
}

type VcIssuanceRequestTraitKeys<TOptions extends VcIssuanceRequestFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface VcIssuanceRequestFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "VcIssuanceRequest";
    build(inputData?: Partial<Prisma.VcIssuanceRequestCreateInput & TTransients>): PromiseLike<Prisma.VcIssuanceRequestCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.VcIssuanceRequestCreateInput & TTransients>): PromiseLike<Prisma.VcIssuanceRequestCreateInput>;
    buildList(list: readonly Partial<Prisma.VcIssuanceRequestCreateInput & TTransients>[]): PromiseLike<Prisma.VcIssuanceRequestCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.VcIssuanceRequestCreateInput & TTransients>): PromiseLike<Prisma.VcIssuanceRequestCreateInput[]>;
    pickForConnect(inputData: VcIssuanceRequest): Pick<VcIssuanceRequest, "id">;
    create(inputData?: Partial<Prisma.VcIssuanceRequestCreateInput & TTransients>): PromiseLike<VcIssuanceRequest>;
    createList(list: readonly Partial<Prisma.VcIssuanceRequestCreateInput & TTransients>[]): PromiseLike<VcIssuanceRequest[]>;
    createList(count: number, item?: Partial<Prisma.VcIssuanceRequestCreateInput & TTransients>): PromiseLike<VcIssuanceRequest[]>;
    createForConnect(inputData?: Partial<Prisma.VcIssuanceRequestCreateInput & TTransients>): PromiseLike<Pick<VcIssuanceRequest, "id">>;
}

export interface VcIssuanceRequestFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends VcIssuanceRequestFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): VcIssuanceRequestFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateVcIssuanceRequestScalarsOrEnums({ seq }: {
    readonly seq: number;
}): VcIssuanceRequestScalarOrEnumFields {
    return {
        claims: getScalarFieldValueGenerator().Json({ modelName: "VcIssuanceRequest", fieldName: "claims", isId: false, isUnique: false, seq })
    };
}

function defineVcIssuanceRequestFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends VcIssuanceRequestFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): VcIssuanceRequestFactoryInterface<TTransients, VcIssuanceRequestTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly VcIssuanceRequestTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("VcIssuanceRequest", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.VcIssuanceRequestCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateVcIssuanceRequestScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<VcIssuanceRequestFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<VcIssuanceRequestFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                evaluation: isVcIssuanceRequestevaluationFactory(defaultData.evaluation) ? {
                    create: await defaultData.evaluation.build()
                } : defaultData.evaluation,
                user: isVcIssuanceRequestuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user
            } as Prisma.VcIssuanceRequestCreateInput;
            const data: Prisma.VcIssuanceRequestCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.VcIssuanceRequestCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: VcIssuanceRequest) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.VcIssuanceRequestCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().vcIssuanceRequest.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.VcIssuanceRequestCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.VcIssuanceRequestCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "VcIssuanceRequest" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: VcIssuanceRequestTraitKeys<TOptions>, ...names: readonly VcIssuanceRequestTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface VcIssuanceRequestFactoryBuilder {
    <TOptions extends VcIssuanceRequestFactoryDefineOptions>(options: TOptions): VcIssuanceRequestFactoryInterface<{}, VcIssuanceRequestTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends VcIssuanceRequestTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends VcIssuanceRequestFactoryDefineOptions<TTransients>>(options: TOptions) => VcIssuanceRequestFactoryInterface<TTransients, VcIssuanceRequestTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link VcIssuanceRequest} model.
 *
 * @param options
 * @returns factory {@link VcIssuanceRequestFactoryInterface}
 */
export const defineVcIssuanceRequestFactory = (<TOptions extends VcIssuanceRequestFactoryDefineOptions>(options: TOptions): VcIssuanceRequestFactoryInterface<TOptions> => {
    return defineVcIssuanceRequestFactoryInternal(options, {});
}) as VcIssuanceRequestFactoryBuilder;

defineVcIssuanceRequestFactory.withTransientFields = defaultTransientFieldValues => options => defineVcIssuanceRequestFactoryInternal(options, defaultTransientFieldValues);

type MembershipScalarOrEnumFields = {
    status: MembershipStatus;
    reason: MembershipStatusReason;
};

type MembershipuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutMembershipsInput["create"]>;
};

type MembershipcommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutMembershipsInput["create"]>;
};

type MembershipopportunityHostedCountViewFactory = {
    _factoryFor: "MembershipHostedOpportunityCountView";
    build: () => PromiseLike<Prisma.MembershipHostedOpportunityCountViewCreateNestedOneWithoutMembershipInput["create"]>;
};

type MembershipFactoryDefineInput = {
    headline?: string | null;
    bio?: string | null;
    status?: MembershipStatus;
    reason?: MembershipStatusReason;
    role?: Role;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: MembershipuserFactory | Prisma.UserCreateNestedOneWithoutMembershipsInput;
    community: MembershipcommunityFactory | Prisma.CommunityCreateNestedOneWithoutMembershipsInput;
    histories?: Prisma.MembershipHistoryCreateNestedManyWithoutMembershipInput;
    opportunityHostedCountView?: MembershipopportunityHostedCountViewFactory | Prisma.MembershipHostedOpportunityCountViewCreateNestedOneWithoutMembershipInput;
    participationGeoViews?: Prisma.MembershipParticipationGeoViewCreateNestedManyWithoutMembershipInput;
    participationCountViews?: Prisma.MembershipParticipationCountViewCreateNestedManyWithoutMembershipInput;
};

type MembershipTransientFields = Record<string, unknown> & Partial<Record<keyof MembershipFactoryDefineInput, never>>;

type MembershipFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<MembershipFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Membership, Prisma.MembershipCreateInput, TTransients>;

type MembershipFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<MembershipFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: MembershipFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Membership, Prisma.MembershipCreateInput, TTransients>;

function isMembershipuserFactory(x: MembershipuserFactory | Prisma.UserCreateNestedOneWithoutMembershipsInput | undefined): x is MembershipuserFactory {
    return (x as any)?._factoryFor === "User";
}

function isMembershipcommunityFactory(x: MembershipcommunityFactory | Prisma.CommunityCreateNestedOneWithoutMembershipsInput | undefined): x is MembershipcommunityFactory {
    return (x as any)?._factoryFor === "Community";
}

function isMembershipopportunityHostedCountViewFactory(x: MembershipopportunityHostedCountViewFactory | Prisma.MembershipHostedOpportunityCountViewCreateNestedOneWithoutMembershipInput | undefined): x is MembershipopportunityHostedCountViewFactory {
    return (x as any)?._factoryFor === "MembershipHostedOpportunityCountView";
}

type MembershipTraitKeys<TOptions extends MembershipFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface MembershipFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Membership";
    build(inputData?: Partial<Prisma.MembershipCreateInput & TTransients>): PromiseLike<Prisma.MembershipCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.MembershipCreateInput & TTransients>): PromiseLike<Prisma.MembershipCreateInput>;
    buildList(list: readonly Partial<Prisma.MembershipCreateInput & TTransients>[]): PromiseLike<Prisma.MembershipCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.MembershipCreateInput & TTransients>): PromiseLike<Prisma.MembershipCreateInput[]>;
    pickForConnect(inputData: Membership): Pick<Membership, "userId" | "communityId">;
    create(inputData?: Partial<Prisma.MembershipCreateInput & TTransients>): PromiseLike<Membership>;
    createList(list: readonly Partial<Prisma.MembershipCreateInput & TTransients>[]): PromiseLike<Membership[]>;
    createList(count: number, item?: Partial<Prisma.MembershipCreateInput & TTransients>): PromiseLike<Membership[]>;
    createForConnect(inputData?: Partial<Prisma.MembershipCreateInput & TTransients>): PromiseLike<Pick<Membership, "userId" | "communityId">>;
}

export interface MembershipFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends MembershipFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): MembershipFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateMembershipScalarsOrEnums({ seq }: {
    readonly seq: number;
}): MembershipScalarOrEnumFields {
    return {
        status: "PENDING",
        reason: "CREATED_COMMUNITY"
    };
}

function defineMembershipFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends MembershipFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): MembershipFactoryInterface<TTransients, MembershipTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly MembershipTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Membership", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.MembershipCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateMembershipScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<MembershipFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<MembershipFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isMembershipuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                community: isMembershipcommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community,
                opportunityHostedCountView: isMembershipopportunityHostedCountViewFactory(defaultData.opportunityHostedCountView) ? {
                    create: await defaultData.opportunityHostedCountView.build()
                } : defaultData.opportunityHostedCountView
            } as Prisma.MembershipCreateInput;
            const data: Prisma.MembershipCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.MembershipCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Membership) => ({
            userId: inputData.userId,
            communityId: inputData.communityId
        });
        const create = async (inputData: Partial<Prisma.MembershipCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().membership.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.MembershipCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.MembershipCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Membership" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: MembershipTraitKeys<TOptions>, ...names: readonly MembershipTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface MembershipFactoryBuilder {
    <TOptions extends MembershipFactoryDefineOptions>(options: TOptions): MembershipFactoryInterface<{}, MembershipTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends MembershipTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends MembershipFactoryDefineOptions<TTransients>>(options: TOptions) => MembershipFactoryInterface<TTransients, MembershipTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Membership} model.
 *
 * @param options
 * @returns factory {@link MembershipFactoryInterface}
 */
export const defineMembershipFactory = (<TOptions extends MembershipFactoryDefineOptions>(options: TOptions): MembershipFactoryInterface<TOptions> => {
    return defineMembershipFactoryInternal(options, {});
}) as MembershipFactoryBuilder;

defineMembershipFactory.withTransientFields = defaultTransientFieldValues => options => defineMembershipFactoryInternal(options, defaultTransientFieldValues);

type MembershipHistoryScalarOrEnumFields = {
    status: MembershipStatus;
    reason: MembershipStatusReason;
};

type MembershipHistorymembershipFactory = {
    _factoryFor: "Membership";
    build: () => PromiseLike<Prisma.MembershipCreateNestedOneWithoutHistoriesInput["create"]>;
};

type MembershipHistorycreatedByUserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutMembershipChangedByMeInput["create"]>;
};

type MembershipHistoryFactoryDefineInput = {
    id?: string;
    role?: Role;
    status?: MembershipStatus;
    reason?: MembershipStatusReason;
    createdAt?: Date;
    membership: MembershipHistorymembershipFactory | Prisma.MembershipCreateNestedOneWithoutHistoriesInput;
    createdByUser?: MembershipHistorycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutMembershipChangedByMeInput;
};

type MembershipHistoryTransientFields = Record<string, unknown> & Partial<Record<keyof MembershipHistoryFactoryDefineInput, never>>;

type MembershipHistoryFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<MembershipHistoryFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<MembershipHistory, Prisma.MembershipHistoryCreateInput, TTransients>;

type MembershipHistoryFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<MembershipHistoryFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: MembershipHistoryFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<MembershipHistory, Prisma.MembershipHistoryCreateInput, TTransients>;

function isMembershipHistorymembershipFactory(x: MembershipHistorymembershipFactory | Prisma.MembershipCreateNestedOneWithoutHistoriesInput | undefined): x is MembershipHistorymembershipFactory {
    return (x as any)?._factoryFor === "Membership";
}

function isMembershipHistorycreatedByUserFactory(x: MembershipHistorycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutMembershipChangedByMeInput | undefined): x is MembershipHistorycreatedByUserFactory {
    return (x as any)?._factoryFor === "User";
}

type MembershipHistoryTraitKeys<TOptions extends MembershipHistoryFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface MembershipHistoryFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "MembershipHistory";
    build(inputData?: Partial<Prisma.MembershipHistoryCreateInput & TTransients>): PromiseLike<Prisma.MembershipHistoryCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.MembershipHistoryCreateInput & TTransients>): PromiseLike<Prisma.MembershipHistoryCreateInput>;
    buildList(list: readonly Partial<Prisma.MembershipHistoryCreateInput & TTransients>[]): PromiseLike<Prisma.MembershipHistoryCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.MembershipHistoryCreateInput & TTransients>): PromiseLike<Prisma.MembershipHistoryCreateInput[]>;
    pickForConnect(inputData: MembershipHistory): Pick<MembershipHistory, "id">;
    create(inputData?: Partial<Prisma.MembershipHistoryCreateInput & TTransients>): PromiseLike<MembershipHistory>;
    createList(list: readonly Partial<Prisma.MembershipHistoryCreateInput & TTransients>[]): PromiseLike<MembershipHistory[]>;
    createList(count: number, item?: Partial<Prisma.MembershipHistoryCreateInput & TTransients>): PromiseLike<MembershipHistory[]>;
    createForConnect(inputData?: Partial<Prisma.MembershipHistoryCreateInput & TTransients>): PromiseLike<Pick<MembershipHistory, "id">>;
}

export interface MembershipHistoryFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends MembershipHistoryFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): MembershipHistoryFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateMembershipHistoryScalarsOrEnums({ seq }: {
    readonly seq: number;
}): MembershipHistoryScalarOrEnumFields {
    return {
        status: "PENDING",
        reason: "CREATED_COMMUNITY"
    };
}

function defineMembershipHistoryFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends MembershipHistoryFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): MembershipHistoryFactoryInterface<TTransients, MembershipHistoryTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly MembershipHistoryTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("MembershipHistory", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.MembershipHistoryCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateMembershipHistoryScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<MembershipHistoryFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<MembershipHistoryFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                membership: isMembershipHistorymembershipFactory(defaultData.membership) ? {
                    create: await defaultData.membership.build()
                } : defaultData.membership,
                createdByUser: isMembershipHistorycreatedByUserFactory(defaultData.createdByUser) ? {
                    create: await defaultData.createdByUser.build()
                } : defaultData.createdByUser
            } as Prisma.MembershipHistoryCreateInput;
            const data: Prisma.MembershipHistoryCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.MembershipHistoryCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: MembershipHistory) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.MembershipHistoryCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().membershipHistory.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.MembershipHistoryCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.MembershipHistoryCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "MembershipHistory" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: MembershipHistoryTraitKeys<TOptions>, ...names: readonly MembershipHistoryTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface MembershipHistoryFactoryBuilder {
    <TOptions extends MembershipHistoryFactoryDefineOptions>(options: TOptions): MembershipHistoryFactoryInterface<{}, MembershipHistoryTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends MembershipHistoryTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends MembershipHistoryFactoryDefineOptions<TTransients>>(options: TOptions) => MembershipHistoryFactoryInterface<TTransients, MembershipHistoryTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link MembershipHistory} model.
 *
 * @param options
 * @returns factory {@link MembershipHistoryFactoryInterface}
 */
export const defineMembershipHistoryFactory = (<TOptions extends MembershipHistoryFactoryDefineOptions>(options: TOptions): MembershipHistoryFactoryInterface<TOptions> => {
    return defineMembershipHistoryFactoryInternal(options, {});
}) as MembershipHistoryFactoryBuilder;

defineMembershipHistoryFactory.withTransientFields = defaultTransientFieldValues => options => defineMembershipHistoryFactoryInternal(options, defaultTransientFieldValues);

type WalletScalarOrEnumFields = {};

type WalletcommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutWalletsInput["create"]>;
};

type WalletuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutWalletsInput["create"]>;
};

type WalletcurrentPointViewFactory = {
    _factoryFor: "CurrentPointView";
    build: () => PromiseLike<Prisma.CurrentPointViewCreateNestedOneWithoutWalletInput["create"]>;
};

type WalletaccumulatedPointViewFactory = {
    _factoryFor: "AccumulatedPointView";
    build: () => PromiseLike<Prisma.AccumulatedPointViewCreateNestedOneWithoutWalletInput["create"]>;
};

type WalletFactoryDefineInput = {
    id?: string;
    type?: WalletType;
    createdAt?: Date;
    updatedAt?: Date | null;
    community: WalletcommunityFactory | Prisma.CommunityCreateNestedOneWithoutWalletsInput;
    user?: WalletuserFactory | Prisma.UserCreateNestedOneWithoutWalletsInput;
    currentPointView?: WalletcurrentPointViewFactory | Prisma.CurrentPointViewCreateNestedOneWithoutWalletInput;
    accumulatedPointView?: WalletaccumulatedPointViewFactory | Prisma.AccumulatedPointViewCreateNestedOneWithoutWalletInput;
    fromTransactions?: Prisma.TransactionCreateNestedManyWithoutFromWalletInput;
    toTransactions?: Prisma.TransactionCreateNestedManyWithoutToWalletInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutWalletInput;
};

type WalletTransientFields = Record<string, unknown> & Partial<Record<keyof WalletFactoryDefineInput, never>>;

type WalletFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<WalletFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Wallet, Prisma.WalletCreateInput, TTransients>;

type WalletFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<WalletFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: WalletFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Wallet, Prisma.WalletCreateInput, TTransients>;

function isWalletcommunityFactory(x: WalletcommunityFactory | Prisma.CommunityCreateNestedOneWithoutWalletsInput | undefined): x is WalletcommunityFactory {
    return (x as any)?._factoryFor === "Community";
}

function isWalletuserFactory(x: WalletuserFactory | Prisma.UserCreateNestedOneWithoutWalletsInput | undefined): x is WalletuserFactory {
    return (x as any)?._factoryFor === "User";
}

function isWalletcurrentPointViewFactory(x: WalletcurrentPointViewFactory | Prisma.CurrentPointViewCreateNestedOneWithoutWalletInput | undefined): x is WalletcurrentPointViewFactory {
    return (x as any)?._factoryFor === "CurrentPointView";
}

function isWalletaccumulatedPointViewFactory(x: WalletaccumulatedPointViewFactory | Prisma.AccumulatedPointViewCreateNestedOneWithoutWalletInput | undefined): x is WalletaccumulatedPointViewFactory {
    return (x as any)?._factoryFor === "AccumulatedPointView";
}

type WalletTraitKeys<TOptions extends WalletFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface WalletFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Wallet";
    build(inputData?: Partial<Prisma.WalletCreateInput & TTransients>): PromiseLike<Prisma.WalletCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.WalletCreateInput & TTransients>): PromiseLike<Prisma.WalletCreateInput>;
    buildList(list: readonly Partial<Prisma.WalletCreateInput & TTransients>[]): PromiseLike<Prisma.WalletCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.WalletCreateInput & TTransients>): PromiseLike<Prisma.WalletCreateInput[]>;
    pickForConnect(inputData: Wallet): Pick<Wallet, "id">;
    create(inputData?: Partial<Prisma.WalletCreateInput & TTransients>): PromiseLike<Wallet>;
    createList(list: readonly Partial<Prisma.WalletCreateInput & TTransients>[]): PromiseLike<Wallet[]>;
    createList(count: number, item?: Partial<Prisma.WalletCreateInput & TTransients>): PromiseLike<Wallet[]>;
    createForConnect(inputData?: Partial<Prisma.WalletCreateInput & TTransients>): PromiseLike<Pick<Wallet, "id">>;
}

export interface WalletFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends WalletFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): WalletFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateWalletScalarsOrEnums({ seq }: {
    readonly seq: number;
}): WalletScalarOrEnumFields {
    return {};
}

function defineWalletFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends WalletFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): WalletFactoryInterface<TTransients, WalletTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly WalletTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Wallet", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.WalletCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateWalletScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<WalletFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<WalletFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                community: isWalletcommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community,
                user: isWalletuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                currentPointView: isWalletcurrentPointViewFactory(defaultData.currentPointView) ? {
                    create: await defaultData.currentPointView.build()
                } : defaultData.currentPointView,
                accumulatedPointView: isWalletaccumulatedPointViewFactory(defaultData.accumulatedPointView) ? {
                    create: await defaultData.accumulatedPointView.build()
                } : defaultData.accumulatedPointView
            } as Prisma.WalletCreateInput;
            const data: Prisma.WalletCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.WalletCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Wallet) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.WalletCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().wallet.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.WalletCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.WalletCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Wallet" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: WalletTraitKeys<TOptions>, ...names: readonly WalletTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface WalletFactoryBuilder {
    <TOptions extends WalletFactoryDefineOptions>(options: TOptions): WalletFactoryInterface<{}, WalletTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends WalletTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends WalletFactoryDefineOptions<TTransients>>(options: TOptions) => WalletFactoryInterface<TTransients, WalletTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Wallet} model.
 *
 * @param options
 * @returns factory {@link WalletFactoryInterface}
 */
export const defineWalletFactory = (<TOptions extends WalletFactoryDefineOptions>(options: TOptions): WalletFactoryInterface<TOptions> => {
    return defineWalletFactoryInternal(options, {});
}) as WalletFactoryBuilder;

defineWalletFactory.withTransientFields = defaultTransientFieldValues => options => defineWalletFactoryInternal(options, defaultTransientFieldValues);

type ArticleScalarOrEnumFields = {
    title: string;
    introduction: string;
    category: ArticleCategory;
    body: string;
    publishedAt: Date;
};

type ArticlethumbnailFactory = {
    _factoryFor: "Image";
    build: () => PromiseLike<Prisma.ImageCreateNestedOneWithoutArticlesInput["create"]>;
};

type ArticlecommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutArticlesInput["create"]>;
};

type ArticleFactoryDefineInput = {
    id?: string;
    title?: string;
    introduction?: string;
    category?: ArticleCategory;
    publishStatus?: PublishStatus;
    body?: string;
    publishedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date | null;
    thumbnail?: ArticlethumbnailFactory | Prisma.ImageCreateNestedOneWithoutArticlesInput;
    community: ArticlecommunityFactory | Prisma.CommunityCreateNestedOneWithoutArticlesInput;
    authors?: Prisma.UserCreateNestedManyWithoutArticlesWrittenByMeInput;
    relatedUsers?: Prisma.UserCreateNestedManyWithoutArticlesAboutMeInput;
    opportunities?: Prisma.OpportunityCreateNestedManyWithoutArticlesInput;
};

type ArticleTransientFields = Record<string, unknown> & Partial<Record<keyof ArticleFactoryDefineInput, never>>;

type ArticleFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ArticleFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Article, Prisma.ArticleCreateInput, TTransients>;

type ArticleFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<ArticleFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: ArticleFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Article, Prisma.ArticleCreateInput, TTransients>;

function isArticlethumbnailFactory(x: ArticlethumbnailFactory | Prisma.ImageCreateNestedOneWithoutArticlesInput | undefined): x is ArticlethumbnailFactory {
    return (x as any)?._factoryFor === "Image";
}

function isArticlecommunityFactory(x: ArticlecommunityFactory | Prisma.CommunityCreateNestedOneWithoutArticlesInput | undefined): x is ArticlecommunityFactory {
    return (x as any)?._factoryFor === "Community";
}

type ArticleTraitKeys<TOptions extends ArticleFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface ArticleFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Article";
    build(inputData?: Partial<Prisma.ArticleCreateInput & TTransients>): PromiseLike<Prisma.ArticleCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ArticleCreateInput & TTransients>): PromiseLike<Prisma.ArticleCreateInput>;
    buildList(list: readonly Partial<Prisma.ArticleCreateInput & TTransients>[]): PromiseLike<Prisma.ArticleCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ArticleCreateInput & TTransients>): PromiseLike<Prisma.ArticleCreateInput[]>;
    pickForConnect(inputData: Article): Pick<Article, "id">;
    create(inputData?: Partial<Prisma.ArticleCreateInput & TTransients>): PromiseLike<Article>;
    createList(list: readonly Partial<Prisma.ArticleCreateInput & TTransients>[]): PromiseLike<Article[]>;
    createList(count: number, item?: Partial<Prisma.ArticleCreateInput & TTransients>): PromiseLike<Article[]>;
    createForConnect(inputData?: Partial<Prisma.ArticleCreateInput & TTransients>): PromiseLike<Pick<Article, "id">>;
}

export interface ArticleFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ArticleFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ArticleFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateArticleScalarsOrEnums({ seq }: {
    readonly seq: number;
}): ArticleScalarOrEnumFields {
    return {
        title: getScalarFieldValueGenerator().String({ modelName: "Article", fieldName: "title", isId: false, isUnique: false, seq }),
        introduction: getScalarFieldValueGenerator().String({ modelName: "Article", fieldName: "introduction", isId: false, isUnique: false, seq }),
        category: "ACTIVITY_REPORT",
        body: getScalarFieldValueGenerator().String({ modelName: "Article", fieldName: "body", isId: false, isUnique: false, seq }),
        publishedAt: getScalarFieldValueGenerator().DateTime({ modelName: "Article", fieldName: "publishedAt", isId: false, isUnique: false, seq })
    };
}

function defineArticleFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends ArticleFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): ArticleFactoryInterface<TTransients, ArticleTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly ArticleTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Article", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.ArticleCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateArticleScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<ArticleFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<ArticleFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                thumbnail: isArticlethumbnailFactory(defaultData.thumbnail) ? {
                    create: await defaultData.thumbnail.build()
                } : defaultData.thumbnail,
                community: isArticlecommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community
            } as Prisma.ArticleCreateInput;
            const data: Prisma.ArticleCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ArticleCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Article) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.ArticleCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().article.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ArticleCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.ArticleCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Article" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: ArticleTraitKeys<TOptions>, ...names: readonly ArticleTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface ArticleFactoryBuilder {
    <TOptions extends ArticleFactoryDefineOptions>(options: TOptions): ArticleFactoryInterface<{}, ArticleTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ArticleTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ArticleFactoryDefineOptions<TTransients>>(options: TOptions) => ArticleFactoryInterface<TTransients, ArticleTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Article} model.
 *
 * @param options
 * @returns factory {@link ArticleFactoryInterface}
 */
export const defineArticleFactory = (<TOptions extends ArticleFactoryDefineOptions>(options: TOptions): ArticleFactoryInterface<TOptions> => {
    return defineArticleFactoryInternal(options, {});
}) as ArticleFactoryBuilder;

defineArticleFactory.withTransientFields = defaultTransientFieldValues => options => defineArticleFactoryInternal(options, defaultTransientFieldValues);

type OpportunityScalarOrEnumFields = {
    title: string;
    category: OpportunityCategory;
    description: string;
};

type OpportunityearliestReservableSlotViewFactory = {
    _factoryFor: "EarliestReservableSlotView";
    build: () => PromiseLike<Prisma.EarliestReservableSlotViewCreateNestedOneWithoutOpportunityInput["create"]>;
};

type OpportunityaccumulatedParticipantsFactory = {
    _factoryFor: "OpportunityAccumulatedParticipantsView";
    build: () => PromiseLike<Prisma.OpportunityAccumulatedParticipantsViewCreateNestedOneWithoutOpportunityInput["create"]>;
};

type OpportunitycommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutOpportunitiesInput["create"]>;
};

type OpportunityplaceFactory = {
    _factoryFor: "Place";
    build: () => PromiseLike<Prisma.PlaceCreateNestedOneWithoutOpportunitiesInput["create"]>;
};

type OpportunitycreatedByUserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutOpportunitiesCreatedByMeInput["create"]>;
};

type OpportunityFactoryDefineInput = {
    id?: string;
    publishStatus?: PublishStatus;
    requireApproval?: boolean;
    title?: string;
    category?: OpportunityCategory;
    description?: string;
    body?: string | null;
    pointsToEarn?: number | null;
    feeRequired?: number | null;
    pointsRequired?: number | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    images?: Prisma.ImageCreateNestedManyWithoutOpportunitiesInput;
    requiredUtilities?: Prisma.UtilityCreateNestedManyWithoutRequiredForOpportunitiesInput;
    slots?: Prisma.OpportunitySlotCreateNestedManyWithoutOpportunityInput;
    earliestReservableSlotView?: OpportunityearliestReservableSlotViewFactory | Prisma.EarliestReservableSlotViewCreateNestedOneWithoutOpportunityInput;
    accumulatedParticipants?: OpportunityaccumulatedParticipantsFactory | Prisma.OpportunityAccumulatedParticipantsViewCreateNestedOneWithoutOpportunityInput;
    community?: OpportunitycommunityFactory | Prisma.CommunityCreateNestedOneWithoutOpportunitiesInput;
    place?: OpportunityplaceFactory | Prisma.PlaceCreateNestedOneWithoutOpportunitiesInput;
    articles?: Prisma.ArticleCreateNestedManyWithoutOpportunitiesInput;
    createdByUser: OpportunitycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutOpportunitiesCreatedByMeInput;
};

type OpportunityTransientFields = Record<string, unknown> & Partial<Record<keyof OpportunityFactoryDefineInput, never>>;

type OpportunityFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<OpportunityFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Opportunity, Prisma.OpportunityCreateInput, TTransients>;

type OpportunityFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<OpportunityFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: OpportunityFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Opportunity, Prisma.OpportunityCreateInput, TTransients>;

function isOpportunityearliestReservableSlotViewFactory(x: OpportunityearliestReservableSlotViewFactory | Prisma.EarliestReservableSlotViewCreateNestedOneWithoutOpportunityInput | undefined): x is OpportunityearliestReservableSlotViewFactory {
    return (x as any)?._factoryFor === "EarliestReservableSlotView";
}

function isOpportunityaccumulatedParticipantsFactory(x: OpportunityaccumulatedParticipantsFactory | Prisma.OpportunityAccumulatedParticipantsViewCreateNestedOneWithoutOpportunityInput | undefined): x is OpportunityaccumulatedParticipantsFactory {
    return (x as any)?._factoryFor === "OpportunityAccumulatedParticipantsView";
}

function isOpportunitycommunityFactory(x: OpportunitycommunityFactory | Prisma.CommunityCreateNestedOneWithoutOpportunitiesInput | undefined): x is OpportunitycommunityFactory {
    return (x as any)?._factoryFor === "Community";
}

function isOpportunityplaceFactory(x: OpportunityplaceFactory | Prisma.PlaceCreateNestedOneWithoutOpportunitiesInput | undefined): x is OpportunityplaceFactory {
    return (x as any)?._factoryFor === "Place";
}

function isOpportunitycreatedByUserFactory(x: OpportunitycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutOpportunitiesCreatedByMeInput | undefined): x is OpportunitycreatedByUserFactory {
    return (x as any)?._factoryFor === "User";
}

type OpportunityTraitKeys<TOptions extends OpportunityFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface OpportunityFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Opportunity";
    build(inputData?: Partial<Prisma.OpportunityCreateInput & TTransients>): PromiseLike<Prisma.OpportunityCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.OpportunityCreateInput & TTransients>): PromiseLike<Prisma.OpportunityCreateInput>;
    buildList(list: readonly Partial<Prisma.OpportunityCreateInput & TTransients>[]): PromiseLike<Prisma.OpportunityCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.OpportunityCreateInput & TTransients>): PromiseLike<Prisma.OpportunityCreateInput[]>;
    pickForConnect(inputData: Opportunity): Pick<Opportunity, "id">;
    create(inputData?: Partial<Prisma.OpportunityCreateInput & TTransients>): PromiseLike<Opportunity>;
    createList(list: readonly Partial<Prisma.OpportunityCreateInput & TTransients>[]): PromiseLike<Opportunity[]>;
    createList(count: number, item?: Partial<Prisma.OpportunityCreateInput & TTransients>): PromiseLike<Opportunity[]>;
    createForConnect(inputData?: Partial<Prisma.OpportunityCreateInput & TTransients>): PromiseLike<Pick<Opportunity, "id">>;
}

export interface OpportunityFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends OpportunityFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): OpportunityFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateOpportunityScalarsOrEnums({ seq }: {
    readonly seq: number;
}): OpportunityScalarOrEnumFields {
    return {
        title: getScalarFieldValueGenerator().String({ modelName: "Opportunity", fieldName: "title", isId: false, isUnique: false, seq }),
        category: "QUEST",
        description: getScalarFieldValueGenerator().String({ modelName: "Opportunity", fieldName: "description", isId: false, isUnique: false, seq })
    };
}

function defineOpportunityFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends OpportunityFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): OpportunityFactoryInterface<TTransients, OpportunityTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly OpportunityTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Opportunity", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.OpportunityCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateOpportunityScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<OpportunityFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<OpportunityFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                earliestReservableSlotView: isOpportunityearliestReservableSlotViewFactory(defaultData.earliestReservableSlotView) ? {
                    create: await defaultData.earliestReservableSlotView.build()
                } : defaultData.earliestReservableSlotView,
                accumulatedParticipants: isOpportunityaccumulatedParticipantsFactory(defaultData.accumulatedParticipants) ? {
                    create: await defaultData.accumulatedParticipants.build()
                } : defaultData.accumulatedParticipants,
                community: isOpportunitycommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community,
                place: isOpportunityplaceFactory(defaultData.place) ? {
                    create: await defaultData.place.build()
                } : defaultData.place,
                createdByUser: isOpportunitycreatedByUserFactory(defaultData.createdByUser) ? {
                    create: await defaultData.createdByUser.build()
                } : defaultData.createdByUser
            } as Prisma.OpportunityCreateInput;
            const data: Prisma.OpportunityCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.OpportunityCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Opportunity) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.OpportunityCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().opportunity.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.OpportunityCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.OpportunityCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Opportunity" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: OpportunityTraitKeys<TOptions>, ...names: readonly OpportunityTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface OpportunityFactoryBuilder {
    <TOptions extends OpportunityFactoryDefineOptions>(options: TOptions): OpportunityFactoryInterface<{}, OpportunityTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends OpportunityTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends OpportunityFactoryDefineOptions<TTransients>>(options: TOptions) => OpportunityFactoryInterface<TTransients, OpportunityTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Opportunity} model.
 *
 * @param options
 * @returns factory {@link OpportunityFactoryInterface}
 */
export const defineOpportunityFactory = (<TOptions extends OpportunityFactoryDefineOptions>(options: TOptions): OpportunityFactoryInterface<TOptions> => {
    return defineOpportunityFactoryInternal(options, {});
}) as OpportunityFactoryBuilder;

defineOpportunityFactory.withTransientFields = defaultTransientFieldValues => options => defineOpportunityFactoryInternal(options, defaultTransientFieldValues);

type OpportunitySlotScalarOrEnumFields = {
    startsAt: Date;
    endsAt: Date;
};

type OpportunitySlotremainingCapacityViewFactory = {
    _factoryFor: "RemainingCapacityView";
    build: () => PromiseLike<Prisma.RemainingCapacityViewCreateNestedOneWithoutSlotInput["create"]>;
};

type OpportunitySlotopportunityFactory = {
    _factoryFor: "Opportunity";
    build: () => PromiseLike<Prisma.OpportunityCreateNestedOneWithoutSlotsInput["create"]>;
};

type OpportunitySlotFactoryDefineInput = {
    id?: string;
    hostingStatus?: OpportunitySlotHostingStatus;
    startsAt?: Date;
    endsAt?: Date;
    capacity?: number | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    remainingCapacityView?: OpportunitySlotremainingCapacityViewFactory | Prisma.RemainingCapacityViewCreateNestedOneWithoutSlotInput;
    opportunity: OpportunitySlotopportunityFactory | Prisma.OpportunityCreateNestedOneWithoutSlotsInput;
    reservations?: Prisma.ReservationCreateNestedManyWithoutOpportunitySlotInput;
    participations?: Prisma.ParticipationCreateNestedManyWithoutOpportunitySlotInput;
};

type OpportunitySlotTransientFields = Record<string, unknown> & Partial<Record<keyof OpportunitySlotFactoryDefineInput, never>>;

type OpportunitySlotFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<OpportunitySlotFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<OpportunitySlot, Prisma.OpportunitySlotCreateInput, TTransients>;

type OpportunitySlotFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<OpportunitySlotFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: OpportunitySlotFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<OpportunitySlot, Prisma.OpportunitySlotCreateInput, TTransients>;

function isOpportunitySlotremainingCapacityViewFactory(x: OpportunitySlotremainingCapacityViewFactory | Prisma.RemainingCapacityViewCreateNestedOneWithoutSlotInput | undefined): x is OpportunitySlotremainingCapacityViewFactory {
    return (x as any)?._factoryFor === "RemainingCapacityView";
}

function isOpportunitySlotopportunityFactory(x: OpportunitySlotopportunityFactory | Prisma.OpportunityCreateNestedOneWithoutSlotsInput | undefined): x is OpportunitySlotopportunityFactory {
    return (x as any)?._factoryFor === "Opportunity";
}

type OpportunitySlotTraitKeys<TOptions extends OpportunitySlotFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface OpportunitySlotFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "OpportunitySlot";
    build(inputData?: Partial<Prisma.OpportunitySlotCreateInput & TTransients>): PromiseLike<Prisma.OpportunitySlotCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.OpportunitySlotCreateInput & TTransients>): PromiseLike<Prisma.OpportunitySlotCreateInput>;
    buildList(list: readonly Partial<Prisma.OpportunitySlotCreateInput & TTransients>[]): PromiseLike<Prisma.OpportunitySlotCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.OpportunitySlotCreateInput & TTransients>): PromiseLike<Prisma.OpportunitySlotCreateInput[]>;
    pickForConnect(inputData: OpportunitySlot): Pick<OpportunitySlot, "id">;
    create(inputData?: Partial<Prisma.OpportunitySlotCreateInput & TTransients>): PromiseLike<OpportunitySlot>;
    createList(list: readonly Partial<Prisma.OpportunitySlotCreateInput & TTransients>[]): PromiseLike<OpportunitySlot[]>;
    createList(count: number, item?: Partial<Prisma.OpportunitySlotCreateInput & TTransients>): PromiseLike<OpportunitySlot[]>;
    createForConnect(inputData?: Partial<Prisma.OpportunitySlotCreateInput & TTransients>): PromiseLike<Pick<OpportunitySlot, "id">>;
}

export interface OpportunitySlotFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends OpportunitySlotFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): OpportunitySlotFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateOpportunitySlotScalarsOrEnums({ seq }: {
    readonly seq: number;
}): OpportunitySlotScalarOrEnumFields {
    return {
        startsAt: getScalarFieldValueGenerator().DateTime({ modelName: "OpportunitySlot", fieldName: "startsAt", isId: false, isUnique: false, seq }),
        endsAt: getScalarFieldValueGenerator().DateTime({ modelName: "OpportunitySlot", fieldName: "endsAt", isId: false, isUnique: false, seq })
    };
}

function defineOpportunitySlotFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends OpportunitySlotFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): OpportunitySlotFactoryInterface<TTransients, OpportunitySlotTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly OpportunitySlotTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("OpportunitySlot", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.OpportunitySlotCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateOpportunitySlotScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<OpportunitySlotFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<OpportunitySlotFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                remainingCapacityView: isOpportunitySlotremainingCapacityViewFactory(defaultData.remainingCapacityView) ? {
                    create: await defaultData.remainingCapacityView.build()
                } : defaultData.remainingCapacityView,
                opportunity: isOpportunitySlotopportunityFactory(defaultData.opportunity) ? {
                    create: await defaultData.opportunity.build()
                } : defaultData.opportunity
            } as Prisma.OpportunitySlotCreateInput;
            const data: Prisma.OpportunitySlotCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.OpportunitySlotCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: OpportunitySlot) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.OpportunitySlotCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().opportunitySlot.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.OpportunitySlotCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.OpportunitySlotCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "OpportunitySlot" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: OpportunitySlotTraitKeys<TOptions>, ...names: readonly OpportunitySlotTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface OpportunitySlotFactoryBuilder {
    <TOptions extends OpportunitySlotFactoryDefineOptions>(options: TOptions): OpportunitySlotFactoryInterface<{}, OpportunitySlotTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends OpportunitySlotTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends OpportunitySlotFactoryDefineOptions<TTransients>>(options: TOptions) => OpportunitySlotFactoryInterface<TTransients, OpportunitySlotTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link OpportunitySlot} model.
 *
 * @param options
 * @returns factory {@link OpportunitySlotFactoryInterface}
 */
export const defineOpportunitySlotFactory = (<TOptions extends OpportunitySlotFactoryDefineOptions>(options: TOptions): OpportunitySlotFactoryInterface<TOptions> => {
    return defineOpportunitySlotFactoryInternal(options, {});
}) as OpportunitySlotFactoryBuilder;

defineOpportunitySlotFactory.withTransientFields = defaultTransientFieldValues => options => defineOpportunitySlotFactoryInternal(options, defaultTransientFieldValues);

type ReservationScalarOrEnumFields = {};

type ReservationopportunitySlotFactory = {
    _factoryFor: "OpportunitySlot";
    build: () => PromiseLike<Prisma.OpportunitySlotCreateNestedOneWithoutReservationsInput["create"]>;
};

type ReservationcreatedByUserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutReservationsAppliedByMeInput["create"]>;
};

type ReservationFactoryDefineInput = {
    id?: string;
    comment?: string | null;
    status?: ReservationStatus;
    participantCountWithPoint?: number;
    createdAt?: Date;
    updatedAt?: Date | null;
    opportunitySlot: ReservationopportunitySlotFactory | Prisma.OpportunitySlotCreateNestedOneWithoutReservationsInput;
    participations?: Prisma.ParticipationCreateNestedManyWithoutReservationInput;
    createdByUser?: ReservationcreatedByUserFactory | Prisma.UserCreateNestedOneWithoutReservationsAppliedByMeInput;
    histories?: Prisma.ReservationHistoryCreateNestedManyWithoutReservationInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutReservationInput;
};

type ReservationTransientFields = Record<string, unknown> & Partial<Record<keyof ReservationFactoryDefineInput, never>>;

type ReservationFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ReservationFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Reservation, Prisma.ReservationCreateInput, TTransients>;

type ReservationFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<ReservationFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: ReservationFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Reservation, Prisma.ReservationCreateInput, TTransients>;

function isReservationopportunitySlotFactory(x: ReservationopportunitySlotFactory | Prisma.OpportunitySlotCreateNestedOneWithoutReservationsInput | undefined): x is ReservationopportunitySlotFactory {
    return (x as any)?._factoryFor === "OpportunitySlot";
}

function isReservationcreatedByUserFactory(x: ReservationcreatedByUserFactory | Prisma.UserCreateNestedOneWithoutReservationsAppliedByMeInput | undefined): x is ReservationcreatedByUserFactory {
    return (x as any)?._factoryFor === "User";
}

type ReservationTraitKeys<TOptions extends ReservationFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface ReservationFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Reservation";
    build(inputData?: Partial<Prisma.ReservationCreateInput & TTransients>): PromiseLike<Prisma.ReservationCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ReservationCreateInput & TTransients>): PromiseLike<Prisma.ReservationCreateInput>;
    buildList(list: readonly Partial<Prisma.ReservationCreateInput & TTransients>[]): PromiseLike<Prisma.ReservationCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ReservationCreateInput & TTransients>): PromiseLike<Prisma.ReservationCreateInput[]>;
    pickForConnect(inputData: Reservation): Pick<Reservation, "id">;
    create(inputData?: Partial<Prisma.ReservationCreateInput & TTransients>): PromiseLike<Reservation>;
    createList(list: readonly Partial<Prisma.ReservationCreateInput & TTransients>[]): PromiseLike<Reservation[]>;
    createList(count: number, item?: Partial<Prisma.ReservationCreateInput & TTransients>): PromiseLike<Reservation[]>;
    createForConnect(inputData?: Partial<Prisma.ReservationCreateInput & TTransients>): PromiseLike<Pick<Reservation, "id">>;
}

export interface ReservationFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ReservationFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ReservationFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateReservationScalarsOrEnums({ seq }: {
    readonly seq: number;
}): ReservationScalarOrEnumFields {
    return {};
}

function defineReservationFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends ReservationFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): ReservationFactoryInterface<TTransients, ReservationTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly ReservationTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Reservation", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.ReservationCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateReservationScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<ReservationFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<ReservationFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                opportunitySlot: isReservationopportunitySlotFactory(defaultData.opportunitySlot) ? {
                    create: await defaultData.opportunitySlot.build()
                } : defaultData.opportunitySlot,
                createdByUser: isReservationcreatedByUserFactory(defaultData.createdByUser) ? {
                    create: await defaultData.createdByUser.build()
                } : defaultData.createdByUser
            } as Prisma.ReservationCreateInput;
            const data: Prisma.ReservationCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ReservationCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Reservation) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.ReservationCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().reservation.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ReservationCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.ReservationCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Reservation" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: ReservationTraitKeys<TOptions>, ...names: readonly ReservationTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface ReservationFactoryBuilder {
    <TOptions extends ReservationFactoryDefineOptions>(options: TOptions): ReservationFactoryInterface<{}, ReservationTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ReservationTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ReservationFactoryDefineOptions<TTransients>>(options: TOptions) => ReservationFactoryInterface<TTransients, ReservationTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Reservation} model.
 *
 * @param options
 * @returns factory {@link ReservationFactoryInterface}
 */
export const defineReservationFactory = (<TOptions extends ReservationFactoryDefineOptions>(options: TOptions): ReservationFactoryInterface<TOptions> => {
    return defineReservationFactoryInternal(options, {});
}) as ReservationFactoryBuilder;

defineReservationFactory.withTransientFields = defaultTransientFieldValues => options => defineReservationFactoryInternal(options, defaultTransientFieldValues);

type ReservationHistoryScalarOrEnumFields = {
    status: ReservationStatus;
};

type ReservationHistoryreservationFactory = {
    _factoryFor: "Reservation";
    build: () => PromiseLike<Prisma.ReservationCreateNestedOneWithoutHistoriesInput["create"]>;
};

type ReservationHistorycreatedByUserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutReservationStatusChangedByMeInput["create"]>;
};

type ReservationHistoryFactoryDefineInput = {
    id?: string;
    status?: ReservationStatus;
    createdAt?: Date;
    reservation: ReservationHistoryreservationFactory | Prisma.ReservationCreateNestedOneWithoutHistoriesInput;
    createdByUser?: ReservationHistorycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutReservationStatusChangedByMeInput;
};

type ReservationHistoryTransientFields = Record<string, unknown> & Partial<Record<keyof ReservationHistoryFactoryDefineInput, never>>;

type ReservationHistoryFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ReservationHistoryFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<ReservationHistory, Prisma.ReservationHistoryCreateInput, TTransients>;

type ReservationHistoryFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<ReservationHistoryFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: ReservationHistoryFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<ReservationHistory, Prisma.ReservationHistoryCreateInput, TTransients>;

function isReservationHistoryreservationFactory(x: ReservationHistoryreservationFactory | Prisma.ReservationCreateNestedOneWithoutHistoriesInput | undefined): x is ReservationHistoryreservationFactory {
    return (x as any)?._factoryFor === "Reservation";
}

function isReservationHistorycreatedByUserFactory(x: ReservationHistorycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutReservationStatusChangedByMeInput | undefined): x is ReservationHistorycreatedByUserFactory {
    return (x as any)?._factoryFor === "User";
}

type ReservationHistoryTraitKeys<TOptions extends ReservationHistoryFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface ReservationHistoryFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "ReservationHistory";
    build(inputData?: Partial<Prisma.ReservationHistoryCreateInput & TTransients>): PromiseLike<Prisma.ReservationHistoryCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ReservationHistoryCreateInput & TTransients>): PromiseLike<Prisma.ReservationHistoryCreateInput>;
    buildList(list: readonly Partial<Prisma.ReservationHistoryCreateInput & TTransients>[]): PromiseLike<Prisma.ReservationHistoryCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ReservationHistoryCreateInput & TTransients>): PromiseLike<Prisma.ReservationHistoryCreateInput[]>;
    pickForConnect(inputData: ReservationHistory): Pick<ReservationHistory, "id">;
    create(inputData?: Partial<Prisma.ReservationHistoryCreateInput & TTransients>): PromiseLike<ReservationHistory>;
    createList(list: readonly Partial<Prisma.ReservationHistoryCreateInput & TTransients>[]): PromiseLike<ReservationHistory[]>;
    createList(count: number, item?: Partial<Prisma.ReservationHistoryCreateInput & TTransients>): PromiseLike<ReservationHistory[]>;
    createForConnect(inputData?: Partial<Prisma.ReservationHistoryCreateInput & TTransients>): PromiseLike<Pick<ReservationHistory, "id">>;
}

export interface ReservationHistoryFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ReservationHistoryFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ReservationHistoryFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateReservationHistoryScalarsOrEnums({ seq }: {
    readonly seq: number;
}): ReservationHistoryScalarOrEnumFields {
    return {
        status: "APPLIED"
    };
}

function defineReservationHistoryFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends ReservationHistoryFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): ReservationHistoryFactoryInterface<TTransients, ReservationHistoryTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly ReservationHistoryTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("ReservationHistory", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.ReservationHistoryCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateReservationHistoryScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<ReservationHistoryFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<ReservationHistoryFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                reservation: isReservationHistoryreservationFactory(defaultData.reservation) ? {
                    create: await defaultData.reservation.build()
                } : defaultData.reservation,
                createdByUser: isReservationHistorycreatedByUserFactory(defaultData.createdByUser) ? {
                    create: await defaultData.createdByUser.build()
                } : defaultData.createdByUser
            } as Prisma.ReservationHistoryCreateInput;
            const data: Prisma.ReservationHistoryCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ReservationHistoryCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: ReservationHistory) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.ReservationHistoryCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().reservationHistory.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ReservationHistoryCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.ReservationHistoryCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "ReservationHistory" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: ReservationHistoryTraitKeys<TOptions>, ...names: readonly ReservationHistoryTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface ReservationHistoryFactoryBuilder {
    <TOptions extends ReservationHistoryFactoryDefineOptions>(options: TOptions): ReservationHistoryFactoryInterface<{}, ReservationHistoryTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ReservationHistoryTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ReservationHistoryFactoryDefineOptions<TTransients>>(options: TOptions) => ReservationHistoryFactoryInterface<TTransients, ReservationHistoryTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link ReservationHistory} model.
 *
 * @param options
 * @returns factory {@link ReservationHistoryFactoryInterface}
 */
export const defineReservationHistoryFactory = (<TOptions extends ReservationHistoryFactoryDefineOptions>(options: TOptions): ReservationHistoryFactoryInterface<TOptions> => {
    return defineReservationHistoryFactoryInternal(options, {});
}) as ReservationHistoryFactoryBuilder;

defineReservationHistoryFactory.withTransientFields = defaultTransientFieldValues => options => defineReservationHistoryFactoryInternal(options, defaultTransientFieldValues);

type ParticipationScalarOrEnumFields = {
    reason: ParticipationStatusReason;
};

type ParticipationuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutParticipationsInput["create"]>;
};

type ParticipationopportunitySlotFactory = {
    _factoryFor: "OpportunitySlot";
    build: () => PromiseLike<Prisma.OpportunitySlotCreateNestedOneWithoutParticipationsInput["create"]>;
};

type ParticipationreservationFactory = {
    _factoryFor: "Reservation";
    build: () => PromiseLike<Prisma.ReservationCreateNestedOneWithoutParticipationsInput["create"]>;
};

type ParticipationcommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutParticipationsInput["create"]>;
};

type ParticipationevaluationFactory = {
    _factoryFor: "Evaluation";
    build: () => PromiseLike<Prisma.EvaluationCreateNestedOneWithoutParticipationInput["create"]>;
};

type ParticipationFactoryDefineInput = {
    id?: string;
    source?: Source;
    status?: ParticipationStatus;
    reason?: ParticipationStatusReason;
    description?: string | null;
    evaluationId?: string | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    images?: Prisma.ImageCreateNestedManyWithoutParticipationsInput;
    user?: ParticipationuserFactory | Prisma.UserCreateNestedOneWithoutParticipationsInput;
    opportunitySlot?: ParticipationopportunitySlotFactory | Prisma.OpportunitySlotCreateNestedOneWithoutParticipationsInput;
    reservation?: ParticipationreservationFactory | Prisma.ReservationCreateNestedOneWithoutParticipationsInput;
    ticketStatusHistories?: Prisma.TicketStatusHistoryCreateNestedManyWithoutParticipationInput;
    community?: ParticipationcommunityFactory | Prisma.CommunityCreateNestedOneWithoutParticipationsInput;
    evaluation?: ParticipationevaluationFactory | Prisma.EvaluationCreateNestedOneWithoutParticipationInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutParticipationInput;
    statusHistories?: Prisma.ParticipationStatusHistoryCreateNestedManyWithoutParticipationInput;
};

type ParticipationTransientFields = Record<string, unknown> & Partial<Record<keyof ParticipationFactoryDefineInput, never>>;

type ParticipationFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ParticipationFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Participation, Prisma.ParticipationCreateInput, TTransients>;

type ParticipationFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<ParticipationFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: ParticipationFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Participation, Prisma.ParticipationCreateInput, TTransients>;

function isParticipationuserFactory(x: ParticipationuserFactory | Prisma.UserCreateNestedOneWithoutParticipationsInput | undefined): x is ParticipationuserFactory {
    return (x as any)?._factoryFor === "User";
}

function isParticipationopportunitySlotFactory(x: ParticipationopportunitySlotFactory | Prisma.OpportunitySlotCreateNestedOneWithoutParticipationsInput | undefined): x is ParticipationopportunitySlotFactory {
    return (x as any)?._factoryFor === "OpportunitySlot";
}

function isParticipationreservationFactory(x: ParticipationreservationFactory | Prisma.ReservationCreateNestedOneWithoutParticipationsInput | undefined): x is ParticipationreservationFactory {
    return (x as any)?._factoryFor === "Reservation";
}

function isParticipationcommunityFactory(x: ParticipationcommunityFactory | Prisma.CommunityCreateNestedOneWithoutParticipationsInput | undefined): x is ParticipationcommunityFactory {
    return (x as any)?._factoryFor === "Community";
}

function isParticipationevaluationFactory(x: ParticipationevaluationFactory | Prisma.EvaluationCreateNestedOneWithoutParticipationInput | undefined): x is ParticipationevaluationFactory {
    return (x as any)?._factoryFor === "Evaluation";
}

type ParticipationTraitKeys<TOptions extends ParticipationFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface ParticipationFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Participation";
    build(inputData?: Partial<Prisma.ParticipationCreateInput & TTransients>): PromiseLike<Prisma.ParticipationCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ParticipationCreateInput & TTransients>): PromiseLike<Prisma.ParticipationCreateInput>;
    buildList(list: readonly Partial<Prisma.ParticipationCreateInput & TTransients>[]): PromiseLike<Prisma.ParticipationCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ParticipationCreateInput & TTransients>): PromiseLike<Prisma.ParticipationCreateInput[]>;
    pickForConnect(inputData: Participation): Pick<Participation, "id">;
    create(inputData?: Partial<Prisma.ParticipationCreateInput & TTransients>): PromiseLike<Participation>;
    createList(list: readonly Partial<Prisma.ParticipationCreateInput & TTransients>[]): PromiseLike<Participation[]>;
    createList(count: number, item?: Partial<Prisma.ParticipationCreateInput & TTransients>): PromiseLike<Participation[]>;
    createForConnect(inputData?: Partial<Prisma.ParticipationCreateInput & TTransients>): PromiseLike<Pick<Participation, "id">>;
}

export interface ParticipationFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ParticipationFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ParticipationFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateParticipationScalarsOrEnums({ seq }: {
    readonly seq: number;
}): ParticipationScalarOrEnumFields {
    return {
        reason: "PERSONAL_RECORD"
    };
}

function defineParticipationFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends ParticipationFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): ParticipationFactoryInterface<TTransients, ParticipationTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly ParticipationTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Participation", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.ParticipationCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateParticipationScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<ParticipationFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<ParticipationFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isParticipationuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                opportunitySlot: isParticipationopportunitySlotFactory(defaultData.opportunitySlot) ? {
                    create: await defaultData.opportunitySlot.build()
                } : defaultData.opportunitySlot,
                reservation: isParticipationreservationFactory(defaultData.reservation) ? {
                    create: await defaultData.reservation.build()
                } : defaultData.reservation,
                community: isParticipationcommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community,
                evaluation: isParticipationevaluationFactory(defaultData.evaluation) ? {
                    create: await defaultData.evaluation.build()
                } : defaultData.evaluation
            } as Prisma.ParticipationCreateInput;
            const data: Prisma.ParticipationCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ParticipationCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Participation) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.ParticipationCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().participation.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ParticipationCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.ParticipationCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Participation" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: ParticipationTraitKeys<TOptions>, ...names: readonly ParticipationTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface ParticipationFactoryBuilder {
    <TOptions extends ParticipationFactoryDefineOptions>(options?: TOptions): ParticipationFactoryInterface<{}, ParticipationTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ParticipationTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ParticipationFactoryDefineOptions<TTransients>>(options?: TOptions) => ParticipationFactoryInterface<TTransients, ParticipationTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Participation} model.
 *
 * @param options
 * @returns factory {@link ParticipationFactoryInterface}
 */
export const defineParticipationFactory = (<TOptions extends ParticipationFactoryDefineOptions>(options?: TOptions): ParticipationFactoryInterface<TOptions> => {
    return defineParticipationFactoryInternal(options ?? {}, {});
}) as ParticipationFactoryBuilder;

defineParticipationFactory.withTransientFields = defaultTransientFieldValues => options => defineParticipationFactoryInternal(options ?? {}, defaultTransientFieldValues);

type ParticipationStatusHistoryScalarOrEnumFields = {
    status: ParticipationStatus;
    reason: ParticipationStatusReason;
};

type ParticipationStatusHistoryparticipationFactory = {
    _factoryFor: "Participation";
    build: () => PromiseLike<Prisma.ParticipationCreateNestedOneWithoutStatusHistoriesInput["create"]>;
};

type ParticipationStatusHistorycreatedByUserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutParticipationStatusChangedByMeInput["create"]>;
};

type ParticipationStatusHistoryFactoryDefineInput = {
    id?: string;
    status?: ParticipationStatus;
    reason?: ParticipationStatusReason;
    createdAt?: Date;
    participation: ParticipationStatusHistoryparticipationFactory | Prisma.ParticipationCreateNestedOneWithoutStatusHistoriesInput;
    createdByUser?: ParticipationStatusHistorycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutParticipationStatusChangedByMeInput;
};

type ParticipationStatusHistoryTransientFields = Record<string, unknown> & Partial<Record<keyof ParticipationStatusHistoryFactoryDefineInput, never>>;

type ParticipationStatusHistoryFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ParticipationStatusHistoryFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<ParticipationStatusHistory, Prisma.ParticipationStatusHistoryCreateInput, TTransients>;

type ParticipationStatusHistoryFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<ParticipationStatusHistoryFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: ParticipationStatusHistoryFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<ParticipationStatusHistory, Prisma.ParticipationStatusHistoryCreateInput, TTransients>;

function isParticipationStatusHistoryparticipationFactory(x: ParticipationStatusHistoryparticipationFactory | Prisma.ParticipationCreateNestedOneWithoutStatusHistoriesInput | undefined): x is ParticipationStatusHistoryparticipationFactory {
    return (x as any)?._factoryFor === "Participation";
}

function isParticipationStatusHistorycreatedByUserFactory(x: ParticipationStatusHistorycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutParticipationStatusChangedByMeInput | undefined): x is ParticipationStatusHistorycreatedByUserFactory {
    return (x as any)?._factoryFor === "User";
}

type ParticipationStatusHistoryTraitKeys<TOptions extends ParticipationStatusHistoryFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface ParticipationStatusHistoryFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "ParticipationStatusHistory";
    build(inputData?: Partial<Prisma.ParticipationStatusHistoryCreateInput & TTransients>): PromiseLike<Prisma.ParticipationStatusHistoryCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ParticipationStatusHistoryCreateInput & TTransients>): PromiseLike<Prisma.ParticipationStatusHistoryCreateInput>;
    buildList(list: readonly Partial<Prisma.ParticipationStatusHistoryCreateInput & TTransients>[]): PromiseLike<Prisma.ParticipationStatusHistoryCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ParticipationStatusHistoryCreateInput & TTransients>): PromiseLike<Prisma.ParticipationStatusHistoryCreateInput[]>;
    pickForConnect(inputData: ParticipationStatusHistory): Pick<ParticipationStatusHistory, "id">;
    create(inputData?: Partial<Prisma.ParticipationStatusHistoryCreateInput & TTransients>): PromiseLike<ParticipationStatusHistory>;
    createList(list: readonly Partial<Prisma.ParticipationStatusHistoryCreateInput & TTransients>[]): PromiseLike<ParticipationStatusHistory[]>;
    createList(count: number, item?: Partial<Prisma.ParticipationStatusHistoryCreateInput & TTransients>): PromiseLike<ParticipationStatusHistory[]>;
    createForConnect(inputData?: Partial<Prisma.ParticipationStatusHistoryCreateInput & TTransients>): PromiseLike<Pick<ParticipationStatusHistory, "id">>;
}

export interface ParticipationStatusHistoryFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ParticipationStatusHistoryFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ParticipationStatusHistoryFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateParticipationStatusHistoryScalarsOrEnums({ seq }: {
    readonly seq: number;
}): ParticipationStatusHistoryScalarOrEnumFields {
    return {
        status: "PENDING",
        reason: "PERSONAL_RECORD"
    };
}

function defineParticipationStatusHistoryFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends ParticipationStatusHistoryFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): ParticipationStatusHistoryFactoryInterface<TTransients, ParticipationStatusHistoryTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly ParticipationStatusHistoryTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("ParticipationStatusHistory", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.ParticipationStatusHistoryCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateParticipationStatusHistoryScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<ParticipationStatusHistoryFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<ParticipationStatusHistoryFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                participation: isParticipationStatusHistoryparticipationFactory(defaultData.participation) ? {
                    create: await defaultData.participation.build()
                } : defaultData.participation,
                createdByUser: isParticipationStatusHistorycreatedByUserFactory(defaultData.createdByUser) ? {
                    create: await defaultData.createdByUser.build()
                } : defaultData.createdByUser
            } as Prisma.ParticipationStatusHistoryCreateInput;
            const data: Prisma.ParticipationStatusHistoryCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ParticipationStatusHistoryCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: ParticipationStatusHistory) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.ParticipationStatusHistoryCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().participationStatusHistory.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ParticipationStatusHistoryCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.ParticipationStatusHistoryCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "ParticipationStatusHistory" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: ParticipationStatusHistoryTraitKeys<TOptions>, ...names: readonly ParticipationStatusHistoryTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface ParticipationStatusHistoryFactoryBuilder {
    <TOptions extends ParticipationStatusHistoryFactoryDefineOptions>(options: TOptions): ParticipationStatusHistoryFactoryInterface<{}, ParticipationStatusHistoryTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ParticipationStatusHistoryTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ParticipationStatusHistoryFactoryDefineOptions<TTransients>>(options: TOptions) => ParticipationStatusHistoryFactoryInterface<TTransients, ParticipationStatusHistoryTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link ParticipationStatusHistory} model.
 *
 * @param options
 * @returns factory {@link ParticipationStatusHistoryFactoryInterface}
 */
export const defineParticipationStatusHistoryFactory = (<TOptions extends ParticipationStatusHistoryFactoryDefineOptions>(options: TOptions): ParticipationStatusHistoryFactoryInterface<TOptions> => {
    return defineParticipationStatusHistoryFactoryInternal(options, {});
}) as ParticipationStatusHistoryFactoryBuilder;

defineParticipationStatusHistoryFactory.withTransientFields = defaultTransientFieldValues => options => defineParticipationStatusHistoryFactoryInternal(options, defaultTransientFieldValues);

type EvaluationScalarOrEnumFields = {};

type EvaluationparticipationFactory = {
    _factoryFor: "Participation";
    build: () => PromiseLike<Prisma.ParticipationCreateNestedOneWithoutEvaluationInput["create"]>;
};

type EvaluationevaluatorFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutEvaluationsEvaluatedByMeInput["create"]>;
};

type EvaluationvcIssuanceRequestFactory = {
    _factoryFor: "VcIssuanceRequest";
    build: () => PromiseLike<Prisma.VcIssuanceRequestCreateNestedOneWithoutEvaluationInput["create"]>;
};

type EvaluationFactoryDefineInput = {
    id?: string;
    status?: EvaluationStatus;
    comment?: string | null;
    credentialUrl?: string | null;
    issuedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    participation: EvaluationparticipationFactory | Prisma.ParticipationCreateNestedOneWithoutEvaluationInput;
    evaluator: EvaluationevaluatorFactory | Prisma.UserCreateNestedOneWithoutEvaluationsEvaluatedByMeInput;
    vcIssuanceRequest?: EvaluationvcIssuanceRequestFactory | Prisma.VcIssuanceRequestCreateNestedOneWithoutEvaluationInput;
    histories?: Prisma.EvaluationHistoryCreateNestedManyWithoutEvaluationInput;
};

type EvaluationTransientFields = Record<string, unknown> & Partial<Record<keyof EvaluationFactoryDefineInput, never>>;

type EvaluationFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<EvaluationFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Evaluation, Prisma.EvaluationCreateInput, TTransients>;

type EvaluationFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<EvaluationFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: EvaluationFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Evaluation, Prisma.EvaluationCreateInput, TTransients>;

function isEvaluationparticipationFactory(x: EvaluationparticipationFactory | Prisma.ParticipationCreateNestedOneWithoutEvaluationInput | undefined): x is EvaluationparticipationFactory {
    return (x as any)?._factoryFor === "Participation";
}

function isEvaluationevaluatorFactory(x: EvaluationevaluatorFactory | Prisma.UserCreateNestedOneWithoutEvaluationsEvaluatedByMeInput | undefined): x is EvaluationevaluatorFactory {
    return (x as any)?._factoryFor === "User";
}

function isEvaluationvcIssuanceRequestFactory(x: EvaluationvcIssuanceRequestFactory | Prisma.VcIssuanceRequestCreateNestedOneWithoutEvaluationInput | undefined): x is EvaluationvcIssuanceRequestFactory {
    return (x as any)?._factoryFor === "VcIssuanceRequest";
}

type EvaluationTraitKeys<TOptions extends EvaluationFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface EvaluationFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Evaluation";
    build(inputData?: Partial<Prisma.EvaluationCreateInput & TTransients>): PromiseLike<Prisma.EvaluationCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.EvaluationCreateInput & TTransients>): PromiseLike<Prisma.EvaluationCreateInput>;
    buildList(list: readonly Partial<Prisma.EvaluationCreateInput & TTransients>[]): PromiseLike<Prisma.EvaluationCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.EvaluationCreateInput & TTransients>): PromiseLike<Prisma.EvaluationCreateInput[]>;
    pickForConnect(inputData: Evaluation): Pick<Evaluation, "id">;
    create(inputData?: Partial<Prisma.EvaluationCreateInput & TTransients>): PromiseLike<Evaluation>;
    createList(list: readonly Partial<Prisma.EvaluationCreateInput & TTransients>[]): PromiseLike<Evaluation[]>;
    createList(count: number, item?: Partial<Prisma.EvaluationCreateInput & TTransients>): PromiseLike<Evaluation[]>;
    createForConnect(inputData?: Partial<Prisma.EvaluationCreateInput & TTransients>): PromiseLike<Pick<Evaluation, "id">>;
}

export interface EvaluationFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends EvaluationFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): EvaluationFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateEvaluationScalarsOrEnums({ seq }: {
    readonly seq: number;
}): EvaluationScalarOrEnumFields {
    return {};
}

function defineEvaluationFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends EvaluationFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): EvaluationFactoryInterface<TTransients, EvaluationTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly EvaluationTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Evaluation", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.EvaluationCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateEvaluationScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<EvaluationFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<EvaluationFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                participation: isEvaluationparticipationFactory(defaultData.participation) ? {
                    create: await defaultData.participation.build()
                } : defaultData.participation,
                evaluator: isEvaluationevaluatorFactory(defaultData.evaluator) ? {
                    create: await defaultData.evaluator.build()
                } : defaultData.evaluator,
                vcIssuanceRequest: isEvaluationvcIssuanceRequestFactory(defaultData.vcIssuanceRequest) ? {
                    create: await defaultData.vcIssuanceRequest.build()
                } : defaultData.vcIssuanceRequest
            } as Prisma.EvaluationCreateInput;
            const data: Prisma.EvaluationCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.EvaluationCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Evaluation) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.EvaluationCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().evaluation.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.EvaluationCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.EvaluationCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Evaluation" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: EvaluationTraitKeys<TOptions>, ...names: readonly EvaluationTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface EvaluationFactoryBuilder {
    <TOptions extends EvaluationFactoryDefineOptions>(options: TOptions): EvaluationFactoryInterface<{}, EvaluationTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends EvaluationTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends EvaluationFactoryDefineOptions<TTransients>>(options: TOptions) => EvaluationFactoryInterface<TTransients, EvaluationTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Evaluation} model.
 *
 * @param options
 * @returns factory {@link EvaluationFactoryInterface}
 */
export const defineEvaluationFactory = (<TOptions extends EvaluationFactoryDefineOptions>(options: TOptions): EvaluationFactoryInterface<TOptions> => {
    return defineEvaluationFactoryInternal(options, {});
}) as EvaluationFactoryBuilder;

defineEvaluationFactory.withTransientFields = defaultTransientFieldValues => options => defineEvaluationFactoryInternal(options, defaultTransientFieldValues);

type EvaluationHistoryScalarOrEnumFields = {
    status: EvaluationStatus;
};

type EvaluationHistoryevaluationFactory = {
    _factoryFor: "Evaluation";
    build: () => PromiseLike<Prisma.EvaluationCreateNestedOneWithoutHistoriesInput["create"]>;
};

type EvaluationHistorycreatedByUserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutEvaluationCreatedByMeInput["create"]>;
};

type EvaluationHistoryFactoryDefineInput = {
    id?: string;
    status?: EvaluationStatus;
    comment?: string | null;
    createdAt?: Date;
    evaluation: EvaluationHistoryevaluationFactory | Prisma.EvaluationCreateNestedOneWithoutHistoriesInput;
    createdByUser?: EvaluationHistorycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutEvaluationCreatedByMeInput;
};

type EvaluationHistoryTransientFields = Record<string, unknown> & Partial<Record<keyof EvaluationHistoryFactoryDefineInput, never>>;

type EvaluationHistoryFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<EvaluationHistoryFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<EvaluationHistory, Prisma.EvaluationHistoryCreateInput, TTransients>;

type EvaluationHistoryFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<EvaluationHistoryFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: EvaluationHistoryFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<EvaluationHistory, Prisma.EvaluationHistoryCreateInput, TTransients>;

function isEvaluationHistoryevaluationFactory(x: EvaluationHistoryevaluationFactory | Prisma.EvaluationCreateNestedOneWithoutHistoriesInput | undefined): x is EvaluationHistoryevaluationFactory {
    return (x as any)?._factoryFor === "Evaluation";
}

function isEvaluationHistorycreatedByUserFactory(x: EvaluationHistorycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutEvaluationCreatedByMeInput | undefined): x is EvaluationHistorycreatedByUserFactory {
    return (x as any)?._factoryFor === "User";
}

type EvaluationHistoryTraitKeys<TOptions extends EvaluationHistoryFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface EvaluationHistoryFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "EvaluationHistory";
    build(inputData?: Partial<Prisma.EvaluationHistoryCreateInput & TTransients>): PromiseLike<Prisma.EvaluationHistoryCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.EvaluationHistoryCreateInput & TTransients>): PromiseLike<Prisma.EvaluationHistoryCreateInput>;
    buildList(list: readonly Partial<Prisma.EvaluationHistoryCreateInput & TTransients>[]): PromiseLike<Prisma.EvaluationHistoryCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.EvaluationHistoryCreateInput & TTransients>): PromiseLike<Prisma.EvaluationHistoryCreateInput[]>;
    pickForConnect(inputData: EvaluationHistory): Pick<EvaluationHistory, "id">;
    create(inputData?: Partial<Prisma.EvaluationHistoryCreateInput & TTransients>): PromiseLike<EvaluationHistory>;
    createList(list: readonly Partial<Prisma.EvaluationHistoryCreateInput & TTransients>[]): PromiseLike<EvaluationHistory[]>;
    createList(count: number, item?: Partial<Prisma.EvaluationHistoryCreateInput & TTransients>): PromiseLike<EvaluationHistory[]>;
    createForConnect(inputData?: Partial<Prisma.EvaluationHistoryCreateInput & TTransients>): PromiseLike<Pick<EvaluationHistory, "id">>;
}

export interface EvaluationHistoryFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends EvaluationHistoryFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): EvaluationHistoryFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateEvaluationHistoryScalarsOrEnums({ seq }: {
    readonly seq: number;
}): EvaluationHistoryScalarOrEnumFields {
    return {
        status: "PENDING"
    };
}

function defineEvaluationHistoryFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends EvaluationHistoryFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): EvaluationHistoryFactoryInterface<TTransients, EvaluationHistoryTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly EvaluationHistoryTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("EvaluationHistory", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.EvaluationHistoryCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateEvaluationHistoryScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<EvaluationHistoryFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<EvaluationHistoryFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                evaluation: isEvaluationHistoryevaluationFactory(defaultData.evaluation) ? {
                    create: await defaultData.evaluation.build()
                } : defaultData.evaluation,
                createdByUser: isEvaluationHistorycreatedByUserFactory(defaultData.createdByUser) ? {
                    create: await defaultData.createdByUser.build()
                } : defaultData.createdByUser
            } as Prisma.EvaluationHistoryCreateInput;
            const data: Prisma.EvaluationHistoryCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.EvaluationHistoryCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: EvaluationHistory) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.EvaluationHistoryCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().evaluationHistory.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.EvaluationHistoryCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.EvaluationHistoryCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "EvaluationHistory" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: EvaluationHistoryTraitKeys<TOptions>, ...names: readonly EvaluationHistoryTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface EvaluationHistoryFactoryBuilder {
    <TOptions extends EvaluationHistoryFactoryDefineOptions>(options: TOptions): EvaluationHistoryFactoryInterface<{}, EvaluationHistoryTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends EvaluationHistoryTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends EvaluationHistoryFactoryDefineOptions<TTransients>>(options: TOptions) => EvaluationHistoryFactoryInterface<TTransients, EvaluationHistoryTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link EvaluationHistory} model.
 *
 * @param options
 * @returns factory {@link EvaluationHistoryFactoryInterface}
 */
export const defineEvaluationHistoryFactory = (<TOptions extends EvaluationHistoryFactoryDefineOptions>(options: TOptions): EvaluationHistoryFactoryInterface<TOptions> => {
    return defineEvaluationHistoryFactoryInternal(options, {});
}) as EvaluationHistoryFactoryBuilder;

defineEvaluationHistoryFactory.withTransientFields = defaultTransientFieldValues => options => defineEvaluationHistoryFactoryInternal(options, defaultTransientFieldValues);

type UtilityScalarOrEnumFields = {
    name: string;
    pointsRequired: number;
};

type UtilitycommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutUtilitiesInput["create"]>;
};

type UtilityownerFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutUtiltyOwnedByMeInput["create"]>;
};

type UtilityFactoryDefineInput = {
    id?: string;
    publishStatus?: PublishStatus;
    name?: string;
    description?: string | null;
    pointsRequired?: number;
    createdAt?: Date;
    updatedAt?: Date | null;
    images?: Prisma.ImageCreateNestedManyWithoutUtilitiesInput;
    community: UtilitycommunityFactory | Prisma.CommunityCreateNestedOneWithoutUtilitiesInput;
    requiredForOpportunities?: Prisma.OpportunityCreateNestedManyWithoutRequiredUtilitiesInput;
    ticketIssuer?: Prisma.TicketIssuerCreateNestedManyWithoutUtilityInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutUtilityInput;
    owner?: UtilityownerFactory | Prisma.UserCreateNestedOneWithoutUtiltyOwnedByMeInput;
};

type UtilityTransientFields = Record<string, unknown> & Partial<Record<keyof UtilityFactoryDefineInput, never>>;

type UtilityFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<UtilityFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Utility, Prisma.UtilityCreateInput, TTransients>;

type UtilityFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<UtilityFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: UtilityFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Utility, Prisma.UtilityCreateInput, TTransients>;

function isUtilitycommunityFactory(x: UtilitycommunityFactory | Prisma.CommunityCreateNestedOneWithoutUtilitiesInput | undefined): x is UtilitycommunityFactory {
    return (x as any)?._factoryFor === "Community";
}

function isUtilityownerFactory(x: UtilityownerFactory | Prisma.UserCreateNestedOneWithoutUtiltyOwnedByMeInput | undefined): x is UtilityownerFactory {
    return (x as any)?._factoryFor === "User";
}

type UtilityTraitKeys<TOptions extends UtilityFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface UtilityFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Utility";
    build(inputData?: Partial<Prisma.UtilityCreateInput & TTransients>): PromiseLike<Prisma.UtilityCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.UtilityCreateInput & TTransients>): PromiseLike<Prisma.UtilityCreateInput>;
    buildList(list: readonly Partial<Prisma.UtilityCreateInput & TTransients>[]): PromiseLike<Prisma.UtilityCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.UtilityCreateInput & TTransients>): PromiseLike<Prisma.UtilityCreateInput[]>;
    pickForConnect(inputData: Utility): Pick<Utility, "id">;
    create(inputData?: Partial<Prisma.UtilityCreateInput & TTransients>): PromiseLike<Utility>;
    createList(list: readonly Partial<Prisma.UtilityCreateInput & TTransients>[]): PromiseLike<Utility[]>;
    createList(count: number, item?: Partial<Prisma.UtilityCreateInput & TTransients>): PromiseLike<Utility[]>;
    createForConnect(inputData?: Partial<Prisma.UtilityCreateInput & TTransients>): PromiseLike<Pick<Utility, "id">>;
}

export interface UtilityFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends UtilityFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): UtilityFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateUtilityScalarsOrEnums({ seq }: {
    readonly seq: number;
}): UtilityScalarOrEnumFields {
    return {
        name: getScalarFieldValueGenerator().String({ modelName: "Utility", fieldName: "name", isId: false, isUnique: false, seq }),
        pointsRequired: getScalarFieldValueGenerator().Int({ modelName: "Utility", fieldName: "pointsRequired", isId: false, isUnique: false, seq })
    };
}

function defineUtilityFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends UtilityFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): UtilityFactoryInterface<TTransients, UtilityTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly UtilityTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Utility", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.UtilityCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateUtilityScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<UtilityFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<UtilityFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                community: isUtilitycommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community,
                owner: isUtilityownerFactory(defaultData.owner) ? {
                    create: await defaultData.owner.build()
                } : defaultData.owner
            } as Prisma.UtilityCreateInput;
            const data: Prisma.UtilityCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.UtilityCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Utility) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.UtilityCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().utility.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.UtilityCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.UtilityCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Utility" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: UtilityTraitKeys<TOptions>, ...names: readonly UtilityTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface UtilityFactoryBuilder {
    <TOptions extends UtilityFactoryDefineOptions>(options: TOptions): UtilityFactoryInterface<{}, UtilityTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends UtilityTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends UtilityFactoryDefineOptions<TTransients>>(options: TOptions) => UtilityFactoryInterface<TTransients, UtilityTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Utility} model.
 *
 * @param options
 * @returns factory {@link UtilityFactoryInterface}
 */
export const defineUtilityFactory = (<TOptions extends UtilityFactoryDefineOptions>(options: TOptions): UtilityFactoryInterface<TOptions> => {
    return defineUtilityFactoryInternal(options, {});
}) as UtilityFactoryBuilder;

defineUtilityFactory.withTransientFields = defaultTransientFieldValues => options => defineUtilityFactoryInternal(options, defaultTransientFieldValues);

type TicketIssuerScalarOrEnumFields = {};

type TicketIssuerutilityFactory = {
    _factoryFor: "Utility";
    build: () => PromiseLike<Prisma.UtilityCreateNestedOneWithoutTicketIssuerInput["create"]>;
};

type TicketIssuerownerFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutTicketIssuedByMeInput["create"]>;
};

type TicketIssuerclaimLinkFactory = {
    _factoryFor: "TicketClaimLink";
    build: () => PromiseLike<Prisma.TicketClaimLinkCreateNestedOneWithoutIssuerInput["create"]>;
};

type TicketIssuerFactoryDefineInput = {
    id?: string;
    qtyToBeIssued?: number;
    createdAt?: Date;
    updatedAt?: Date | null;
    utility: TicketIssuerutilityFactory | Prisma.UtilityCreateNestedOneWithoutTicketIssuerInput;
    owner: TicketIssuerownerFactory | Prisma.UserCreateNestedOneWithoutTicketIssuedByMeInput;
    claimLink?: TicketIssuerclaimLinkFactory | Prisma.TicketClaimLinkCreateNestedOneWithoutIssuerInput;
};

type TicketIssuerTransientFields = Record<string, unknown> & Partial<Record<keyof TicketIssuerFactoryDefineInput, never>>;

type TicketIssuerFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<TicketIssuerFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<TicketIssuer, Prisma.TicketIssuerCreateInput, TTransients>;

type TicketIssuerFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<TicketIssuerFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: TicketIssuerFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<TicketIssuer, Prisma.TicketIssuerCreateInput, TTransients>;

function isTicketIssuerutilityFactory(x: TicketIssuerutilityFactory | Prisma.UtilityCreateNestedOneWithoutTicketIssuerInput | undefined): x is TicketIssuerutilityFactory {
    return (x as any)?._factoryFor === "Utility";
}

function isTicketIssuerownerFactory(x: TicketIssuerownerFactory | Prisma.UserCreateNestedOneWithoutTicketIssuedByMeInput | undefined): x is TicketIssuerownerFactory {
    return (x as any)?._factoryFor === "User";
}

function isTicketIssuerclaimLinkFactory(x: TicketIssuerclaimLinkFactory | Prisma.TicketClaimLinkCreateNestedOneWithoutIssuerInput | undefined): x is TicketIssuerclaimLinkFactory {
    return (x as any)?._factoryFor === "TicketClaimLink";
}

type TicketIssuerTraitKeys<TOptions extends TicketIssuerFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface TicketIssuerFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "TicketIssuer";
    build(inputData?: Partial<Prisma.TicketIssuerCreateInput & TTransients>): PromiseLike<Prisma.TicketIssuerCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.TicketIssuerCreateInput & TTransients>): PromiseLike<Prisma.TicketIssuerCreateInput>;
    buildList(list: readonly Partial<Prisma.TicketIssuerCreateInput & TTransients>[]): PromiseLike<Prisma.TicketIssuerCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.TicketIssuerCreateInput & TTransients>): PromiseLike<Prisma.TicketIssuerCreateInput[]>;
    pickForConnect(inputData: TicketIssuer): Pick<TicketIssuer, "id">;
    create(inputData?: Partial<Prisma.TicketIssuerCreateInput & TTransients>): PromiseLike<TicketIssuer>;
    createList(list: readonly Partial<Prisma.TicketIssuerCreateInput & TTransients>[]): PromiseLike<TicketIssuer[]>;
    createList(count: number, item?: Partial<Prisma.TicketIssuerCreateInput & TTransients>): PromiseLike<TicketIssuer[]>;
    createForConnect(inputData?: Partial<Prisma.TicketIssuerCreateInput & TTransients>): PromiseLike<Pick<TicketIssuer, "id">>;
}

export interface TicketIssuerFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends TicketIssuerFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): TicketIssuerFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateTicketIssuerScalarsOrEnums({ seq }: {
    readonly seq: number;
}): TicketIssuerScalarOrEnumFields {
    return {};
}

function defineTicketIssuerFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends TicketIssuerFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): TicketIssuerFactoryInterface<TTransients, TicketIssuerTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly TicketIssuerTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("TicketIssuer", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.TicketIssuerCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateTicketIssuerScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<TicketIssuerFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<TicketIssuerFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                utility: isTicketIssuerutilityFactory(defaultData.utility) ? {
                    create: await defaultData.utility.build()
                } : defaultData.utility,
                owner: isTicketIssuerownerFactory(defaultData.owner) ? {
                    create: await defaultData.owner.build()
                } : defaultData.owner,
                claimLink: isTicketIssuerclaimLinkFactory(defaultData.claimLink) ? {
                    create: await defaultData.claimLink.build()
                } : defaultData.claimLink
            } as Prisma.TicketIssuerCreateInput;
            const data: Prisma.TicketIssuerCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.TicketIssuerCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: TicketIssuer) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.TicketIssuerCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().ticketIssuer.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.TicketIssuerCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.TicketIssuerCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "TicketIssuer" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: TicketIssuerTraitKeys<TOptions>, ...names: readonly TicketIssuerTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface TicketIssuerFactoryBuilder {
    <TOptions extends TicketIssuerFactoryDefineOptions>(options: TOptions): TicketIssuerFactoryInterface<{}, TicketIssuerTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends TicketIssuerTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends TicketIssuerFactoryDefineOptions<TTransients>>(options: TOptions) => TicketIssuerFactoryInterface<TTransients, TicketIssuerTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link TicketIssuer} model.
 *
 * @param options
 * @returns factory {@link TicketIssuerFactoryInterface}
 */
export const defineTicketIssuerFactory = (<TOptions extends TicketIssuerFactoryDefineOptions>(options: TOptions): TicketIssuerFactoryInterface<TOptions> => {
    return defineTicketIssuerFactoryInternal(options, {});
}) as TicketIssuerFactoryBuilder;

defineTicketIssuerFactory.withTransientFields = defaultTransientFieldValues => options => defineTicketIssuerFactoryInternal(options, defaultTransientFieldValues);

type TicketClaimLinkScalarOrEnumFields = {};

type TicketClaimLinkissuerFactory = {
    _factoryFor: "TicketIssuer";
    build: () => PromiseLike<Prisma.TicketIssuerCreateNestedOneWithoutClaimLinkInput["create"]>;
};

type TicketClaimLinkFactoryDefineInput = {
    id?: string;
    status?: ClaimLinkStatus;
    qty?: number;
    claimedAt?: Date | null;
    createdAt?: Date;
    issuer: TicketClaimLinkissuerFactory | Prisma.TicketIssuerCreateNestedOneWithoutClaimLinkInput;
    tickets?: Prisma.TicketCreateNestedManyWithoutClaimLinkInput;
};

type TicketClaimLinkTransientFields = Record<string, unknown> & Partial<Record<keyof TicketClaimLinkFactoryDefineInput, never>>;

type TicketClaimLinkFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<TicketClaimLinkFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<TicketClaimLink, Prisma.TicketClaimLinkCreateInput, TTransients>;

type TicketClaimLinkFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<TicketClaimLinkFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: TicketClaimLinkFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<TicketClaimLink, Prisma.TicketClaimLinkCreateInput, TTransients>;

function isTicketClaimLinkissuerFactory(x: TicketClaimLinkissuerFactory | Prisma.TicketIssuerCreateNestedOneWithoutClaimLinkInput | undefined): x is TicketClaimLinkissuerFactory {
    return (x as any)?._factoryFor === "TicketIssuer";
}

type TicketClaimLinkTraitKeys<TOptions extends TicketClaimLinkFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface TicketClaimLinkFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "TicketClaimLink";
    build(inputData?: Partial<Prisma.TicketClaimLinkCreateInput & TTransients>): PromiseLike<Prisma.TicketClaimLinkCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.TicketClaimLinkCreateInput & TTransients>): PromiseLike<Prisma.TicketClaimLinkCreateInput>;
    buildList(list: readonly Partial<Prisma.TicketClaimLinkCreateInput & TTransients>[]): PromiseLike<Prisma.TicketClaimLinkCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.TicketClaimLinkCreateInput & TTransients>): PromiseLike<Prisma.TicketClaimLinkCreateInput[]>;
    pickForConnect(inputData: TicketClaimLink): Pick<TicketClaimLink, "id">;
    create(inputData?: Partial<Prisma.TicketClaimLinkCreateInput & TTransients>): PromiseLike<TicketClaimLink>;
    createList(list: readonly Partial<Prisma.TicketClaimLinkCreateInput & TTransients>[]): PromiseLike<TicketClaimLink[]>;
    createList(count: number, item?: Partial<Prisma.TicketClaimLinkCreateInput & TTransients>): PromiseLike<TicketClaimLink[]>;
    createForConnect(inputData?: Partial<Prisma.TicketClaimLinkCreateInput & TTransients>): PromiseLike<Pick<TicketClaimLink, "id">>;
}

export interface TicketClaimLinkFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends TicketClaimLinkFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): TicketClaimLinkFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateTicketClaimLinkScalarsOrEnums({ seq }: {
    readonly seq: number;
}): TicketClaimLinkScalarOrEnumFields {
    return {};
}

function defineTicketClaimLinkFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends TicketClaimLinkFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): TicketClaimLinkFactoryInterface<TTransients, TicketClaimLinkTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly TicketClaimLinkTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("TicketClaimLink", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.TicketClaimLinkCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateTicketClaimLinkScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<TicketClaimLinkFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<TicketClaimLinkFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                issuer: isTicketClaimLinkissuerFactory(defaultData.issuer) ? {
                    create: await defaultData.issuer.build()
                } : defaultData.issuer
            } as Prisma.TicketClaimLinkCreateInput;
            const data: Prisma.TicketClaimLinkCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.TicketClaimLinkCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: TicketClaimLink) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.TicketClaimLinkCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().ticketClaimLink.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.TicketClaimLinkCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.TicketClaimLinkCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "TicketClaimLink" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: TicketClaimLinkTraitKeys<TOptions>, ...names: readonly TicketClaimLinkTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface TicketClaimLinkFactoryBuilder {
    <TOptions extends TicketClaimLinkFactoryDefineOptions>(options: TOptions): TicketClaimLinkFactoryInterface<{}, TicketClaimLinkTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends TicketClaimLinkTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends TicketClaimLinkFactoryDefineOptions<TTransients>>(options: TOptions) => TicketClaimLinkFactoryInterface<TTransients, TicketClaimLinkTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link TicketClaimLink} model.
 *
 * @param options
 * @returns factory {@link TicketClaimLinkFactoryInterface}
 */
export const defineTicketClaimLinkFactory = (<TOptions extends TicketClaimLinkFactoryDefineOptions>(options: TOptions): TicketClaimLinkFactoryInterface<TOptions> => {
    return defineTicketClaimLinkFactoryInternal(options, {});
}) as TicketClaimLinkFactoryBuilder;

defineTicketClaimLinkFactory.withTransientFields = defaultTransientFieldValues => options => defineTicketClaimLinkFactoryInternal(options, defaultTransientFieldValues);

type TicketScalarOrEnumFields = {};

type TicketwalletFactory = {
    _factoryFor: "Wallet";
    build: () => PromiseLike<Prisma.WalletCreateNestedOneWithoutTicketsInput["create"]>;
};

type TicketutilityFactory = {
    _factoryFor: "Utility";
    build: () => PromiseLike<Prisma.UtilityCreateNestedOneWithoutTicketsInput["create"]>;
};

type TicketclaimLinkFactory = {
    _factoryFor: "TicketClaimLink";
    build: () => PromiseLike<Prisma.TicketClaimLinkCreateNestedOneWithoutTicketsInput["create"]>;
};

type TicketFactoryDefineInput = {
    id?: string;
    status?: TicketStatus;
    reason?: TicketStatusReason;
    createdAt?: Date;
    updatedAt?: Date | null;
    wallet: TicketwalletFactory | Prisma.WalletCreateNestedOneWithoutTicketsInput;
    utility: TicketutilityFactory | Prisma.UtilityCreateNestedOneWithoutTicketsInput;
    claimLink?: TicketclaimLinkFactory | Prisma.TicketClaimLinkCreateNestedOneWithoutTicketsInput;
    ticketStatusHistories?: Prisma.TicketStatusHistoryCreateNestedManyWithoutTicketInput;
};

type TicketTransientFields = Record<string, unknown> & Partial<Record<keyof TicketFactoryDefineInput, never>>;

type TicketFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<TicketFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Ticket, Prisma.TicketCreateInput, TTransients>;

type TicketFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<TicketFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: TicketFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Ticket, Prisma.TicketCreateInput, TTransients>;

function isTicketwalletFactory(x: TicketwalletFactory | Prisma.WalletCreateNestedOneWithoutTicketsInput | undefined): x is TicketwalletFactory {
    return (x as any)?._factoryFor === "Wallet";
}

function isTicketutilityFactory(x: TicketutilityFactory | Prisma.UtilityCreateNestedOneWithoutTicketsInput | undefined): x is TicketutilityFactory {
    return (x as any)?._factoryFor === "Utility";
}

function isTicketclaimLinkFactory(x: TicketclaimLinkFactory | Prisma.TicketClaimLinkCreateNestedOneWithoutTicketsInput | undefined): x is TicketclaimLinkFactory {
    return (x as any)?._factoryFor === "TicketClaimLink";
}

type TicketTraitKeys<TOptions extends TicketFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface TicketFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Ticket";
    build(inputData?: Partial<Prisma.TicketCreateInput & TTransients>): PromiseLike<Prisma.TicketCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.TicketCreateInput & TTransients>): PromiseLike<Prisma.TicketCreateInput>;
    buildList(list: readonly Partial<Prisma.TicketCreateInput & TTransients>[]): PromiseLike<Prisma.TicketCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.TicketCreateInput & TTransients>): PromiseLike<Prisma.TicketCreateInput[]>;
    pickForConnect(inputData: Ticket): Pick<Ticket, "id">;
    create(inputData?: Partial<Prisma.TicketCreateInput & TTransients>): PromiseLike<Ticket>;
    createList(list: readonly Partial<Prisma.TicketCreateInput & TTransients>[]): PromiseLike<Ticket[]>;
    createList(count: number, item?: Partial<Prisma.TicketCreateInput & TTransients>): PromiseLike<Ticket[]>;
    createForConnect(inputData?: Partial<Prisma.TicketCreateInput & TTransients>): PromiseLike<Pick<Ticket, "id">>;
}

export interface TicketFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends TicketFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): TicketFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateTicketScalarsOrEnums({ seq }: {
    readonly seq: number;
}): TicketScalarOrEnumFields {
    return {};
}

function defineTicketFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends TicketFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): TicketFactoryInterface<TTransients, TicketTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly TicketTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Ticket", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.TicketCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateTicketScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<TicketFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<TicketFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                wallet: isTicketwalletFactory(defaultData.wallet) ? {
                    create: await defaultData.wallet.build()
                } : defaultData.wallet,
                utility: isTicketutilityFactory(defaultData.utility) ? {
                    create: await defaultData.utility.build()
                } : defaultData.utility,
                claimLink: isTicketclaimLinkFactory(defaultData.claimLink) ? {
                    create: await defaultData.claimLink.build()
                } : defaultData.claimLink
            } as Prisma.TicketCreateInput;
            const data: Prisma.TicketCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.TicketCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Ticket) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.TicketCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().ticket.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.TicketCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.TicketCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Ticket" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: TicketTraitKeys<TOptions>, ...names: readonly TicketTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface TicketFactoryBuilder {
    <TOptions extends TicketFactoryDefineOptions>(options: TOptions): TicketFactoryInterface<{}, TicketTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends TicketTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends TicketFactoryDefineOptions<TTransients>>(options: TOptions) => TicketFactoryInterface<TTransients, TicketTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Ticket} model.
 *
 * @param options
 * @returns factory {@link TicketFactoryInterface}
 */
export const defineTicketFactory = (<TOptions extends TicketFactoryDefineOptions>(options: TOptions): TicketFactoryInterface<TOptions> => {
    return defineTicketFactoryInternal(options, {});
}) as TicketFactoryBuilder;

defineTicketFactory.withTransientFields = defaultTransientFieldValues => options => defineTicketFactoryInternal(options, defaultTransientFieldValues);

type TicketStatusHistoryScalarOrEnumFields = {};

type TicketStatusHistoryticketFactory = {
    _factoryFor: "Ticket";
    build: () => PromiseLike<Prisma.TicketCreateNestedOneWithoutTicketStatusHistoriesInput["create"]>;
};

type TicketStatusHistorytransactionFactory = {
    _factoryFor: "Transaction";
    build: () => PromiseLike<Prisma.TransactionCreateNestedOneWithoutTicketStatusHistoryInput["create"]>;
};

type TicketStatusHistoryparticipationFactory = {
    _factoryFor: "Participation";
    build: () => PromiseLike<Prisma.ParticipationCreateNestedOneWithoutTicketStatusHistoriesInput["create"]>;
};

type TicketStatusHistorycreatedByUserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutTicketStatusChangedByMeInput["create"]>;
};

type TicketStatusHistoryFactoryDefineInput = {
    id?: string;
    status?: TicketStatus;
    reason?: TicketStatusReason;
    createdAt?: Date;
    updatedAt?: Date | null;
    ticket: TicketStatusHistoryticketFactory | Prisma.TicketCreateNestedOneWithoutTicketStatusHistoriesInput;
    transaction?: TicketStatusHistorytransactionFactory | Prisma.TransactionCreateNestedOneWithoutTicketStatusHistoryInput;
    participation?: TicketStatusHistoryparticipationFactory | Prisma.ParticipationCreateNestedOneWithoutTicketStatusHistoriesInput;
    createdByUser?: TicketStatusHistorycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutTicketStatusChangedByMeInput;
};

type TicketStatusHistoryTransientFields = Record<string, unknown> & Partial<Record<keyof TicketStatusHistoryFactoryDefineInput, never>>;

type TicketStatusHistoryFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<TicketStatusHistoryFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<TicketStatusHistory, Prisma.TicketStatusHistoryCreateInput, TTransients>;

type TicketStatusHistoryFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<TicketStatusHistoryFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: TicketStatusHistoryFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<TicketStatusHistory, Prisma.TicketStatusHistoryCreateInput, TTransients>;

function isTicketStatusHistoryticketFactory(x: TicketStatusHistoryticketFactory | Prisma.TicketCreateNestedOneWithoutTicketStatusHistoriesInput | undefined): x is TicketStatusHistoryticketFactory {
    return (x as any)?._factoryFor === "Ticket";
}

function isTicketStatusHistorytransactionFactory(x: TicketStatusHistorytransactionFactory | Prisma.TransactionCreateNestedOneWithoutTicketStatusHistoryInput | undefined): x is TicketStatusHistorytransactionFactory {
    return (x as any)?._factoryFor === "Transaction";
}

function isTicketStatusHistoryparticipationFactory(x: TicketStatusHistoryparticipationFactory | Prisma.ParticipationCreateNestedOneWithoutTicketStatusHistoriesInput | undefined): x is TicketStatusHistoryparticipationFactory {
    return (x as any)?._factoryFor === "Participation";
}

function isTicketStatusHistorycreatedByUserFactory(x: TicketStatusHistorycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutTicketStatusChangedByMeInput | undefined): x is TicketStatusHistorycreatedByUserFactory {
    return (x as any)?._factoryFor === "User";
}

type TicketStatusHistoryTraitKeys<TOptions extends TicketStatusHistoryFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface TicketStatusHistoryFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "TicketStatusHistory";
    build(inputData?: Partial<Prisma.TicketStatusHistoryCreateInput & TTransients>): PromiseLike<Prisma.TicketStatusHistoryCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.TicketStatusHistoryCreateInput & TTransients>): PromiseLike<Prisma.TicketStatusHistoryCreateInput>;
    buildList(list: readonly Partial<Prisma.TicketStatusHistoryCreateInput & TTransients>[]): PromiseLike<Prisma.TicketStatusHistoryCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.TicketStatusHistoryCreateInput & TTransients>): PromiseLike<Prisma.TicketStatusHistoryCreateInput[]>;
    pickForConnect(inputData: TicketStatusHistory): Pick<TicketStatusHistory, "id">;
    create(inputData?: Partial<Prisma.TicketStatusHistoryCreateInput & TTransients>): PromiseLike<TicketStatusHistory>;
    createList(list: readonly Partial<Prisma.TicketStatusHistoryCreateInput & TTransients>[]): PromiseLike<TicketStatusHistory[]>;
    createList(count: number, item?: Partial<Prisma.TicketStatusHistoryCreateInput & TTransients>): PromiseLike<TicketStatusHistory[]>;
    createForConnect(inputData?: Partial<Prisma.TicketStatusHistoryCreateInput & TTransients>): PromiseLike<Pick<TicketStatusHistory, "id">>;
}

export interface TicketStatusHistoryFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends TicketStatusHistoryFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): TicketStatusHistoryFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateTicketStatusHistoryScalarsOrEnums({ seq }: {
    readonly seq: number;
}): TicketStatusHistoryScalarOrEnumFields {
    return {};
}

function defineTicketStatusHistoryFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends TicketStatusHistoryFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): TicketStatusHistoryFactoryInterface<TTransients, TicketStatusHistoryTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly TicketStatusHistoryTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("TicketStatusHistory", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.TicketStatusHistoryCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateTicketStatusHistoryScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<TicketStatusHistoryFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<TicketStatusHistoryFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                ticket: isTicketStatusHistoryticketFactory(defaultData.ticket) ? {
                    create: await defaultData.ticket.build()
                } : defaultData.ticket,
                transaction: isTicketStatusHistorytransactionFactory(defaultData.transaction) ? {
                    create: await defaultData.transaction.build()
                } : defaultData.transaction,
                participation: isTicketStatusHistoryparticipationFactory(defaultData.participation) ? {
                    create: await defaultData.participation.build()
                } : defaultData.participation,
                createdByUser: isTicketStatusHistorycreatedByUserFactory(defaultData.createdByUser) ? {
                    create: await defaultData.createdByUser.build()
                } : defaultData.createdByUser
            } as Prisma.TicketStatusHistoryCreateInput;
            const data: Prisma.TicketStatusHistoryCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.TicketStatusHistoryCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: TicketStatusHistory) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.TicketStatusHistoryCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().ticketStatusHistory.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.TicketStatusHistoryCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.TicketStatusHistoryCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "TicketStatusHistory" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: TicketStatusHistoryTraitKeys<TOptions>, ...names: readonly TicketStatusHistoryTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface TicketStatusHistoryFactoryBuilder {
    <TOptions extends TicketStatusHistoryFactoryDefineOptions>(options: TOptions): TicketStatusHistoryFactoryInterface<{}, TicketStatusHistoryTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends TicketStatusHistoryTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends TicketStatusHistoryFactoryDefineOptions<TTransients>>(options: TOptions) => TicketStatusHistoryFactoryInterface<TTransients, TicketStatusHistoryTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link TicketStatusHistory} model.
 *
 * @param options
 * @returns factory {@link TicketStatusHistoryFactoryInterface}
 */
export const defineTicketStatusHistoryFactory = (<TOptions extends TicketStatusHistoryFactoryDefineOptions>(options: TOptions): TicketStatusHistoryFactoryInterface<TOptions> => {
    return defineTicketStatusHistoryFactoryInternal(options, {});
}) as TicketStatusHistoryFactoryBuilder;

defineTicketStatusHistoryFactory.withTransientFields = defaultTransientFieldValues => options => defineTicketStatusHistoryFactoryInternal(options, defaultTransientFieldValues);

type TransactionScalarOrEnumFields = {
    reason: TransactionReason;
    fromPointChange: number;
    toPointChange: number;
};

type TransactionfromWalletFactory = {
    _factoryFor: "Wallet";
    build: () => PromiseLike<Prisma.WalletCreateNestedOneWithoutFromTransactionsInput["create"]>;
};

type TransactiontoWalletFactory = {
    _factoryFor: "Wallet";
    build: () => PromiseLike<Prisma.WalletCreateNestedOneWithoutToTransactionsInput["create"]>;
};

type TransactionparticipationFactory = {
    _factoryFor: "Participation";
    build: () => PromiseLike<Prisma.ParticipationCreateNestedOneWithoutTransactionsInput["create"]>;
};

type TransactionreservationFactory = {
    _factoryFor: "Reservation";
    build: () => PromiseLike<Prisma.ReservationCreateNestedOneWithoutTransactionsInput["create"]>;
};

type TransactionticketStatusHistoryFactory = {
    _factoryFor: "TicketStatusHistory";
    build: () => PromiseLike<Prisma.TicketStatusHistoryCreateNestedOneWithoutTransactionInput["create"]>;
};

type TransactioncreatedByUserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutTransactionsCreatedByMeInput["create"]>;
};

type TransactionFactoryDefineInput = {
    id?: string;
    reason?: TransactionReason;
    fromPointChange?: number;
    toPointChange?: number;
    createdAt?: Date;
    updatedAt?: Date | null;
    fromWallet?: TransactionfromWalletFactory | Prisma.WalletCreateNestedOneWithoutFromTransactionsInput;
    toWallet?: TransactiontoWalletFactory | Prisma.WalletCreateNestedOneWithoutToTransactionsInput;
    participation?: TransactionparticipationFactory | Prisma.ParticipationCreateNestedOneWithoutTransactionsInput;
    reservation?: TransactionreservationFactory | Prisma.ReservationCreateNestedOneWithoutTransactionsInput;
    ticketStatusHistory?: TransactionticketStatusHistoryFactory | Prisma.TicketStatusHistoryCreateNestedOneWithoutTransactionInput;
    createdByUser?: TransactioncreatedByUserFactory | Prisma.UserCreateNestedOneWithoutTransactionsCreatedByMeInput;
};

type TransactionTransientFields = Record<string, unknown> & Partial<Record<keyof TransactionFactoryDefineInput, never>>;

type TransactionFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<TransactionFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Transaction, Prisma.TransactionCreateInput, TTransients>;

type TransactionFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<TransactionFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: TransactionFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Transaction, Prisma.TransactionCreateInput, TTransients>;

function isTransactionfromWalletFactory(x: TransactionfromWalletFactory | Prisma.WalletCreateNestedOneWithoutFromTransactionsInput | undefined): x is TransactionfromWalletFactory {
    return (x as any)?._factoryFor === "Wallet";
}

function isTransactiontoWalletFactory(x: TransactiontoWalletFactory | Prisma.WalletCreateNestedOneWithoutToTransactionsInput | undefined): x is TransactiontoWalletFactory {
    return (x as any)?._factoryFor === "Wallet";
}

function isTransactionparticipationFactory(x: TransactionparticipationFactory | Prisma.ParticipationCreateNestedOneWithoutTransactionsInput | undefined): x is TransactionparticipationFactory {
    return (x as any)?._factoryFor === "Participation";
}

function isTransactionreservationFactory(x: TransactionreservationFactory | Prisma.ReservationCreateNestedOneWithoutTransactionsInput | undefined): x is TransactionreservationFactory {
    return (x as any)?._factoryFor === "Reservation";
}

function isTransactionticketStatusHistoryFactory(x: TransactionticketStatusHistoryFactory | Prisma.TicketStatusHistoryCreateNestedOneWithoutTransactionInput | undefined): x is TransactionticketStatusHistoryFactory {
    return (x as any)?._factoryFor === "TicketStatusHistory";
}

function isTransactioncreatedByUserFactory(x: TransactioncreatedByUserFactory | Prisma.UserCreateNestedOneWithoutTransactionsCreatedByMeInput | undefined): x is TransactioncreatedByUserFactory {
    return (x as any)?._factoryFor === "User";
}

type TransactionTraitKeys<TOptions extends TransactionFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface TransactionFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Transaction";
    build(inputData?: Partial<Prisma.TransactionCreateInput & TTransients>): PromiseLike<Prisma.TransactionCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.TransactionCreateInput & TTransients>): PromiseLike<Prisma.TransactionCreateInput>;
    buildList(list: readonly Partial<Prisma.TransactionCreateInput & TTransients>[]): PromiseLike<Prisma.TransactionCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.TransactionCreateInput & TTransients>): PromiseLike<Prisma.TransactionCreateInput[]>;
    pickForConnect(inputData: Transaction): Pick<Transaction, "id">;
    create(inputData?: Partial<Prisma.TransactionCreateInput & TTransients>): PromiseLike<Transaction>;
    createList(list: readonly Partial<Prisma.TransactionCreateInput & TTransients>[]): PromiseLike<Transaction[]>;
    createList(count: number, item?: Partial<Prisma.TransactionCreateInput & TTransients>): PromiseLike<Transaction[]>;
    createForConnect(inputData?: Partial<Prisma.TransactionCreateInput & TTransients>): PromiseLike<Pick<Transaction, "id">>;
}

export interface TransactionFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends TransactionFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): TransactionFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateTransactionScalarsOrEnums({ seq }: {
    readonly seq: number;
}): TransactionScalarOrEnumFields {
    return {
        reason: "POINT_ISSUED",
        fromPointChange: getScalarFieldValueGenerator().Int({ modelName: "Transaction", fieldName: "fromPointChange", isId: false, isUnique: false, seq }),
        toPointChange: getScalarFieldValueGenerator().Int({ modelName: "Transaction", fieldName: "toPointChange", isId: false, isUnique: false, seq })
    };
}

function defineTransactionFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends TransactionFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): TransactionFactoryInterface<TTransients, TransactionTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly TransactionTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Transaction", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.TransactionCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateTransactionScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<TransactionFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<TransactionFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                fromWallet: isTransactionfromWalletFactory(defaultData.fromWallet) ? {
                    create: await defaultData.fromWallet.build()
                } : defaultData.fromWallet,
                toWallet: isTransactiontoWalletFactory(defaultData.toWallet) ? {
                    create: await defaultData.toWallet.build()
                } : defaultData.toWallet,
                participation: isTransactionparticipationFactory(defaultData.participation) ? {
                    create: await defaultData.participation.build()
                } : defaultData.participation,
                reservation: isTransactionreservationFactory(defaultData.reservation) ? {
                    create: await defaultData.reservation.build()
                } : defaultData.reservation,
                ticketStatusHistory: isTransactionticketStatusHistoryFactory(defaultData.ticketStatusHistory) ? {
                    create: await defaultData.ticketStatusHistory.build()
                } : defaultData.ticketStatusHistory,
                createdByUser: isTransactioncreatedByUserFactory(defaultData.createdByUser) ? {
                    create: await defaultData.createdByUser.build()
                } : defaultData.createdByUser
            } as Prisma.TransactionCreateInput;
            const data: Prisma.TransactionCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.TransactionCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Transaction) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.TransactionCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().transaction.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.TransactionCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.TransactionCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Transaction" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: TransactionTraitKeys<TOptions>, ...names: readonly TransactionTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface TransactionFactoryBuilder {
    <TOptions extends TransactionFactoryDefineOptions>(options?: TOptions): TransactionFactoryInterface<{}, TransactionTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends TransactionTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends TransactionFactoryDefineOptions<TTransients>>(options?: TOptions) => TransactionFactoryInterface<TTransients, TransactionTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Transaction} model.
 *
 * @param options
 * @returns factory {@link TransactionFactoryInterface}
 */
export const defineTransactionFactory = (<TOptions extends TransactionFactoryDefineOptions>(options?: TOptions): TransactionFactoryInterface<TOptions> => {
    return defineTransactionFactoryInternal(options ?? {}, {});
}) as TransactionFactoryBuilder;

defineTransactionFactory.withTransientFields = defaultTransientFieldValues => options => defineTransactionFactoryInternal(options ?? {}, defaultTransientFieldValues);

type ApiKeyScalarOrEnumFields = {
    key: string;
    name: string;
};

type ApiKeyFactoryDefineInput = {
    id?: string;
    key?: string;
    name?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date | null;
};

type ApiKeyTransientFields = Record<string, unknown> & Partial<Record<keyof ApiKeyFactoryDefineInput, never>>;

type ApiKeyFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ApiKeyFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<ApiKey, Prisma.ApiKeyCreateInput, TTransients>;

type ApiKeyFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<ApiKeyFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: ApiKeyFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<ApiKey, Prisma.ApiKeyCreateInput, TTransients>;

type ApiKeyTraitKeys<TOptions extends ApiKeyFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface ApiKeyFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "ApiKey";
    build(inputData?: Partial<Prisma.ApiKeyCreateInput & TTransients>): PromiseLike<Prisma.ApiKeyCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ApiKeyCreateInput & TTransients>): PromiseLike<Prisma.ApiKeyCreateInput>;
    buildList(list: readonly Partial<Prisma.ApiKeyCreateInput & TTransients>[]): PromiseLike<Prisma.ApiKeyCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ApiKeyCreateInput & TTransients>): PromiseLike<Prisma.ApiKeyCreateInput[]>;
    pickForConnect(inputData: ApiKey): Pick<ApiKey, "id">;
    create(inputData?: Partial<Prisma.ApiKeyCreateInput & TTransients>): PromiseLike<ApiKey>;
    createList(list: readonly Partial<Prisma.ApiKeyCreateInput & TTransients>[]): PromiseLike<ApiKey[]>;
    createList(count: number, item?: Partial<Prisma.ApiKeyCreateInput & TTransients>): PromiseLike<ApiKey[]>;
    createForConnect(inputData?: Partial<Prisma.ApiKeyCreateInput & TTransients>): PromiseLike<Pick<ApiKey, "id">>;
}

export interface ApiKeyFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ApiKeyFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ApiKeyFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateApiKeyScalarsOrEnums({ seq }: {
    readonly seq: number;
}): ApiKeyScalarOrEnumFields {
    return {
        key: getScalarFieldValueGenerator().String({ modelName: "ApiKey", fieldName: "key", isId: false, isUnique: true, seq }),
        name: getScalarFieldValueGenerator().String({ modelName: "ApiKey", fieldName: "name", isId: false, isUnique: false, seq })
    };
}

function defineApiKeyFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends ApiKeyFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): ApiKeyFactoryInterface<TTransients, ApiKeyTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly ApiKeyTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("ApiKey", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.ApiKeyCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateApiKeyScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<ApiKeyFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<ApiKeyFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {} as Prisma.ApiKeyCreateInput;
            const data: Prisma.ApiKeyCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ApiKeyCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: ApiKey) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.ApiKeyCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().apiKey.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ApiKeyCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.ApiKeyCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "ApiKey" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: ApiKeyTraitKeys<TOptions>, ...names: readonly ApiKeyTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface ApiKeyFactoryBuilder {
    <TOptions extends ApiKeyFactoryDefineOptions>(options?: TOptions): ApiKeyFactoryInterface<{}, ApiKeyTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ApiKeyTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ApiKeyFactoryDefineOptions<TTransients>>(options?: TOptions) => ApiKeyFactoryInterface<TTransients, ApiKeyTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link ApiKey} model.
 *
 * @param options
 * @returns factory {@link ApiKeyFactoryInterface}
 */
export const defineApiKeyFactory = (<TOptions extends ApiKeyFactoryDefineOptions>(options?: TOptions): ApiKeyFactoryInterface<TOptions> => {
    return defineApiKeyFactoryInternal(options ?? {}, {});
}) as ApiKeyFactoryBuilder;

defineApiKeyFactory.withTransientFields = defaultTransientFieldValues => options => defineApiKeyFactoryInternal(options ?? {}, defaultTransientFieldValues);

type NftWalletScalarOrEnumFields = {
    walletAddress: string;
};

type NftWalletuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutNftWalletsInput["create"]>;
};

type NftWalletFactoryDefineInput = {
    id?: string;
    type?: NftWalletType;
    walletAddress?: string;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: NftWalletuserFactory | Prisma.UserCreateNestedOneWithoutNftWalletsInput;
    nftInstances?: Prisma.NftInstanceCreateNestedManyWithoutNftWalletInput;
    nftMints?: Prisma.NftMintCreateNestedManyWithoutNftWalletInput;
};

type NftWalletTransientFields = Record<string, unknown> & Partial<Record<keyof NftWalletFactoryDefineInput, never>>;

type NftWalletFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<NftWalletFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<NftWallet, Prisma.NftWalletCreateInput, TTransients>;

type NftWalletFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<NftWalletFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: NftWalletFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<NftWallet, Prisma.NftWalletCreateInput, TTransients>;

function isNftWalletuserFactory(x: NftWalletuserFactory | Prisma.UserCreateNestedOneWithoutNftWalletsInput | undefined): x is NftWalletuserFactory {
    return (x as any)?._factoryFor === "User";
}

type NftWalletTraitKeys<TOptions extends NftWalletFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface NftWalletFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "NftWallet";
    build(inputData?: Partial<Prisma.NftWalletCreateInput & TTransients>): PromiseLike<Prisma.NftWalletCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.NftWalletCreateInput & TTransients>): PromiseLike<Prisma.NftWalletCreateInput>;
    buildList(list: readonly Partial<Prisma.NftWalletCreateInput & TTransients>[]): PromiseLike<Prisma.NftWalletCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.NftWalletCreateInput & TTransients>): PromiseLike<Prisma.NftWalletCreateInput[]>;
    pickForConnect(inputData: NftWallet): Pick<NftWallet, "id">;
    create(inputData?: Partial<Prisma.NftWalletCreateInput & TTransients>): PromiseLike<NftWallet>;
    createList(list: readonly Partial<Prisma.NftWalletCreateInput & TTransients>[]): PromiseLike<NftWallet[]>;
    createList(count: number, item?: Partial<Prisma.NftWalletCreateInput & TTransients>): PromiseLike<NftWallet[]>;
    createForConnect(inputData?: Partial<Prisma.NftWalletCreateInput & TTransients>): PromiseLike<Pick<NftWallet, "id">>;
}

export interface NftWalletFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends NftWalletFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): NftWalletFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateNftWalletScalarsOrEnums({ seq }: {
    readonly seq: number;
}): NftWalletScalarOrEnumFields {
    return {
        walletAddress: getScalarFieldValueGenerator().String({ modelName: "NftWallet", fieldName: "walletAddress", isId: false, isUnique: true, seq })
    };
}

function defineNftWalletFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends NftWalletFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): NftWalletFactoryInterface<TTransients, NftWalletTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly NftWalletTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("NftWallet", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.NftWalletCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateNftWalletScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<NftWalletFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<NftWalletFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isNftWalletuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user
            } as Prisma.NftWalletCreateInput;
            const data: Prisma.NftWalletCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.NftWalletCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: NftWallet) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.NftWalletCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().nftWallet.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.NftWalletCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.NftWalletCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "NftWallet" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: NftWalletTraitKeys<TOptions>, ...names: readonly NftWalletTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface NftWalletFactoryBuilder {
    <TOptions extends NftWalletFactoryDefineOptions>(options: TOptions): NftWalletFactoryInterface<{}, NftWalletTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends NftWalletTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends NftWalletFactoryDefineOptions<TTransients>>(options: TOptions) => NftWalletFactoryInterface<TTransients, NftWalletTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link NftWallet} model.
 *
 * @param options
 * @returns factory {@link NftWalletFactoryInterface}
 */
export const defineNftWalletFactory = (<TOptions extends NftWalletFactoryDefineOptions>(options: TOptions): NftWalletFactoryInterface<TOptions> => {
    return defineNftWalletFactoryInternal(options, {});
}) as NftWalletFactoryBuilder;

defineNftWalletFactory.withTransientFields = defaultTransientFieldValues => options => defineNftWalletFactoryInternal(options, defaultTransientFieldValues);

type NftTokenScalarOrEnumFields = {
    address: string;
    type: string;
};

type NftTokenFactoryDefineInput = {
    id?: string;
    address?: string;
    type?: string;
    name?: string | null;
    symbol?: string | null;
    json?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
    createdAt?: Date;
    updatedAt?: Date | null;
    nftInstances?: Prisma.NftInstanceCreateNestedManyWithoutNftTokenInput;
};

type NftTokenTransientFields = Record<string, unknown> & Partial<Record<keyof NftTokenFactoryDefineInput, never>>;

type NftTokenFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<NftTokenFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<NftToken, Prisma.NftTokenCreateInput, TTransients>;

type NftTokenFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<NftTokenFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: NftTokenFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<NftToken, Prisma.NftTokenCreateInput, TTransients>;

type NftTokenTraitKeys<TOptions extends NftTokenFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface NftTokenFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "NftToken";
    build(inputData?: Partial<Prisma.NftTokenCreateInput & TTransients>): PromiseLike<Prisma.NftTokenCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.NftTokenCreateInput & TTransients>): PromiseLike<Prisma.NftTokenCreateInput>;
    buildList(list: readonly Partial<Prisma.NftTokenCreateInput & TTransients>[]): PromiseLike<Prisma.NftTokenCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.NftTokenCreateInput & TTransients>): PromiseLike<Prisma.NftTokenCreateInput[]>;
    pickForConnect(inputData: NftToken): Pick<NftToken, "id">;
    create(inputData?: Partial<Prisma.NftTokenCreateInput & TTransients>): PromiseLike<NftToken>;
    createList(list: readonly Partial<Prisma.NftTokenCreateInput & TTransients>[]): PromiseLike<NftToken[]>;
    createList(count: number, item?: Partial<Prisma.NftTokenCreateInput & TTransients>): PromiseLike<NftToken[]>;
    createForConnect(inputData?: Partial<Prisma.NftTokenCreateInput & TTransients>): PromiseLike<Pick<NftToken, "id">>;
}

export interface NftTokenFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends NftTokenFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): NftTokenFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateNftTokenScalarsOrEnums({ seq }: {
    readonly seq: number;
}): NftTokenScalarOrEnumFields {
    return {
        address: getScalarFieldValueGenerator().String({ modelName: "NftToken", fieldName: "address", isId: false, isUnique: true, seq }),
        type: getScalarFieldValueGenerator().String({ modelName: "NftToken", fieldName: "type", isId: false, isUnique: false, seq })
    };
}

function defineNftTokenFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends NftTokenFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): NftTokenFactoryInterface<TTransients, NftTokenTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly NftTokenTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("NftToken", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.NftTokenCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateNftTokenScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<NftTokenFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<NftTokenFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {} as Prisma.NftTokenCreateInput;
            const data: Prisma.NftTokenCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.NftTokenCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: NftToken) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.NftTokenCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().nftToken.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.NftTokenCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.NftTokenCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "NftToken" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: NftTokenTraitKeys<TOptions>, ...names: readonly NftTokenTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface NftTokenFactoryBuilder {
    <TOptions extends NftTokenFactoryDefineOptions>(options?: TOptions): NftTokenFactoryInterface<{}, NftTokenTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends NftTokenTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends NftTokenFactoryDefineOptions<TTransients>>(options?: TOptions) => NftTokenFactoryInterface<TTransients, NftTokenTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link NftToken} model.
 *
 * @param options
 * @returns factory {@link NftTokenFactoryInterface}
 */
export const defineNftTokenFactory = (<TOptions extends NftTokenFactoryDefineOptions>(options?: TOptions): NftTokenFactoryInterface<TOptions> => {
    return defineNftTokenFactoryInternal(options ?? {}, {});
}) as NftTokenFactoryBuilder;

defineNftTokenFactory.withTransientFields = defaultTransientFieldValues => options => defineNftTokenFactoryInternal(options ?? {}, defaultTransientFieldValues);

type NftInstanceScalarOrEnumFields = {
    instanceId: string;
};

type NftInstanceproductFactory = {
    _factoryFor: "Product";
    build: () => PromiseLike<Prisma.ProductCreateNestedOneWithoutNftInstanceInput["create"]>;
};

type NftInstancenftWalletFactory = {
    _factoryFor: "NftWallet";
    build: () => PromiseLike<Prisma.NftWalletCreateNestedOneWithoutNftInstancesInput["create"]>;
};

type NftInstancenftTokenFactory = {
    _factoryFor: "NftToken";
    build: () => PromiseLike<Prisma.NftTokenCreateNestedOneWithoutNftInstancesInput["create"]>;
};

type NftInstancenftMintFactory = {
    _factoryFor: "NftMint";
    build: () => PromiseLike<Prisma.NftMintCreateNestedOneWithoutNftInstanceInput["create"]>;
};

type NftInstancecommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutNftInstanceInput["create"]>;
};

type NftInstanceFactoryDefineInput = {
    id?: string;
    instanceId?: string;
    sequenceNum?: number | null;
    status?: NftInstanceStatus;
    name?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    json?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
    createdAt?: Date;
    updatedAt?: Date | null;
    product?: NftInstanceproductFactory | Prisma.ProductCreateNestedOneWithoutNftInstanceInput;
    nftWallet?: NftInstancenftWalletFactory | Prisma.NftWalletCreateNestedOneWithoutNftInstancesInput;
    nftToken?: NftInstancenftTokenFactory | Prisma.NftTokenCreateNestedOneWithoutNftInstancesInput;
    nftMint?: NftInstancenftMintFactory | Prisma.NftMintCreateNestedOneWithoutNftInstanceInput;
    community?: NftInstancecommunityFactory | Prisma.CommunityCreateNestedOneWithoutNftInstanceInput;
};

type NftInstanceTransientFields = Record<string, unknown> & Partial<Record<keyof NftInstanceFactoryDefineInput, never>>;

type NftInstanceFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<NftInstanceFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<NftInstance, Prisma.NftInstanceCreateInput, TTransients>;

type NftInstanceFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<NftInstanceFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: NftInstanceFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<NftInstance, Prisma.NftInstanceCreateInput, TTransients>;

function isNftInstanceproductFactory(x: NftInstanceproductFactory | Prisma.ProductCreateNestedOneWithoutNftInstanceInput | undefined): x is NftInstanceproductFactory {
    return (x as any)?._factoryFor === "Product";
}

function isNftInstancenftWalletFactory(x: NftInstancenftWalletFactory | Prisma.NftWalletCreateNestedOneWithoutNftInstancesInput | undefined): x is NftInstancenftWalletFactory {
    return (x as any)?._factoryFor === "NftWallet";
}

function isNftInstancenftTokenFactory(x: NftInstancenftTokenFactory | Prisma.NftTokenCreateNestedOneWithoutNftInstancesInput | undefined): x is NftInstancenftTokenFactory {
    return (x as any)?._factoryFor === "NftToken";
}

function isNftInstancenftMintFactory(x: NftInstancenftMintFactory | Prisma.NftMintCreateNestedOneWithoutNftInstanceInput | undefined): x is NftInstancenftMintFactory {
    return (x as any)?._factoryFor === "NftMint";
}

function isNftInstancecommunityFactory(x: NftInstancecommunityFactory | Prisma.CommunityCreateNestedOneWithoutNftInstanceInput | undefined): x is NftInstancecommunityFactory {
    return (x as any)?._factoryFor === "Community";
}

type NftInstanceTraitKeys<TOptions extends NftInstanceFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface NftInstanceFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "NftInstance";
    build(inputData?: Partial<Prisma.NftInstanceCreateInput & TTransients>): PromiseLike<Prisma.NftInstanceCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.NftInstanceCreateInput & TTransients>): PromiseLike<Prisma.NftInstanceCreateInput>;
    buildList(list: readonly Partial<Prisma.NftInstanceCreateInput & TTransients>[]): PromiseLike<Prisma.NftInstanceCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.NftInstanceCreateInput & TTransients>): PromiseLike<Prisma.NftInstanceCreateInput[]>;
    pickForConnect(inputData: NftInstance): Pick<NftInstance, "id">;
    create(inputData?: Partial<Prisma.NftInstanceCreateInput & TTransients>): PromiseLike<NftInstance>;
    createList(list: readonly Partial<Prisma.NftInstanceCreateInput & TTransients>[]): PromiseLike<NftInstance[]>;
    createList(count: number, item?: Partial<Prisma.NftInstanceCreateInput & TTransients>): PromiseLike<NftInstance[]>;
    createForConnect(inputData?: Partial<Prisma.NftInstanceCreateInput & TTransients>): PromiseLike<Pick<NftInstance, "id">>;
}

export interface NftInstanceFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends NftInstanceFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): NftInstanceFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateNftInstanceScalarsOrEnums({ seq }: {
    readonly seq: number;
}): NftInstanceScalarOrEnumFields {
    return {
        instanceId: getScalarFieldValueGenerator().String({ modelName: "NftInstance", fieldName: "instanceId", isId: false, isUnique: true, seq })
    };
}

function defineNftInstanceFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends NftInstanceFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): NftInstanceFactoryInterface<TTransients, NftInstanceTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly NftInstanceTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("NftInstance", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.NftInstanceCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateNftInstanceScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<NftInstanceFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<NftInstanceFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                product: isNftInstanceproductFactory(defaultData.product) ? {
                    create: await defaultData.product.build()
                } : defaultData.product,
                nftWallet: isNftInstancenftWalletFactory(defaultData.nftWallet) ? {
                    create: await defaultData.nftWallet.build()
                } : defaultData.nftWallet,
                nftToken: isNftInstancenftTokenFactory(defaultData.nftToken) ? {
                    create: await defaultData.nftToken.build()
                } : defaultData.nftToken,
                nftMint: isNftInstancenftMintFactory(defaultData.nftMint) ? {
                    create: await defaultData.nftMint.build()
                } : defaultData.nftMint,
                community: isNftInstancecommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community
            } as Prisma.NftInstanceCreateInput;
            const data: Prisma.NftInstanceCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.NftInstanceCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: NftInstance) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.NftInstanceCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().nftInstance.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.NftInstanceCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.NftInstanceCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "NftInstance" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: NftInstanceTraitKeys<TOptions>, ...names: readonly NftInstanceTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface NftInstanceFactoryBuilder {
    <TOptions extends NftInstanceFactoryDefineOptions>(options?: TOptions): NftInstanceFactoryInterface<{}, NftInstanceTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends NftInstanceTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends NftInstanceFactoryDefineOptions<TTransients>>(options?: TOptions) => NftInstanceFactoryInterface<TTransients, NftInstanceTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link NftInstance} model.
 *
 * @param options
 * @returns factory {@link NftInstanceFactoryInterface}
 */
export const defineNftInstanceFactory = (<TOptions extends NftInstanceFactoryDefineOptions>(options?: TOptions): NftInstanceFactoryInterface<TOptions> => {
    return defineNftInstanceFactoryInternal(options ?? {}, {});
}) as NftInstanceFactoryBuilder;

defineNftInstanceFactory.withTransientFields = defaultTransientFieldValues => options => defineNftInstanceFactoryInternal(options ?? {}, defaultTransientFieldValues);

type NftMintScalarOrEnumFields = {};

type NftMintorderItemFactory = {
    _factoryFor: "OrderItem";
    build: () => PromiseLike<Prisma.OrderItemCreateNestedOneWithoutNftMintsInput["create"]>;
};

type NftMintnftWalletFactory = {
    _factoryFor: "NftWallet";
    build: () => PromiseLike<Prisma.NftWalletCreateNestedOneWithoutNftMintsInput["create"]>;
};

type NftMintnftInstanceFactory = {
    _factoryFor: "NftInstance";
    build: () => PromiseLike<Prisma.NftInstanceCreateNestedOneWithoutNftMintInput["create"]>;
};

type NftMintFactoryDefineInput = {
    id?: string;
    status?: NftMintStatus;
    txHash?: string | null;
    error?: string | null;
    retryCount?: number;
    createdAt?: Date;
    updatedAt?: Date | null;
    orderItem: NftMintorderItemFactory | Prisma.OrderItemCreateNestedOneWithoutNftMintsInput;
    nftWallet: NftMintnftWalletFactory | Prisma.NftWalletCreateNestedOneWithoutNftMintsInput;
    nftInstance?: NftMintnftInstanceFactory | Prisma.NftInstanceCreateNestedOneWithoutNftMintInput;
};

type NftMintTransientFields = Record<string, unknown> & Partial<Record<keyof NftMintFactoryDefineInput, never>>;

type NftMintFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<NftMintFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<NftMint, Prisma.NftMintCreateInput, TTransients>;

type NftMintFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<NftMintFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: NftMintFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<NftMint, Prisma.NftMintCreateInput, TTransients>;

function isNftMintorderItemFactory(x: NftMintorderItemFactory | Prisma.OrderItemCreateNestedOneWithoutNftMintsInput | undefined): x is NftMintorderItemFactory {
    return (x as any)?._factoryFor === "OrderItem";
}

function isNftMintnftWalletFactory(x: NftMintnftWalletFactory | Prisma.NftWalletCreateNestedOneWithoutNftMintsInput | undefined): x is NftMintnftWalletFactory {
    return (x as any)?._factoryFor === "NftWallet";
}

function isNftMintnftInstanceFactory(x: NftMintnftInstanceFactory | Prisma.NftInstanceCreateNestedOneWithoutNftMintInput | undefined): x is NftMintnftInstanceFactory {
    return (x as any)?._factoryFor === "NftInstance";
}

type NftMintTraitKeys<TOptions extends NftMintFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface NftMintFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "NftMint";
    build(inputData?: Partial<Prisma.NftMintCreateInput & TTransients>): PromiseLike<Prisma.NftMintCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.NftMintCreateInput & TTransients>): PromiseLike<Prisma.NftMintCreateInput>;
    buildList(list: readonly Partial<Prisma.NftMintCreateInput & TTransients>[]): PromiseLike<Prisma.NftMintCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.NftMintCreateInput & TTransients>): PromiseLike<Prisma.NftMintCreateInput[]>;
    pickForConnect(inputData: NftMint): Pick<NftMint, "id">;
    create(inputData?: Partial<Prisma.NftMintCreateInput & TTransients>): PromiseLike<NftMint>;
    createList(list: readonly Partial<Prisma.NftMintCreateInput & TTransients>[]): PromiseLike<NftMint[]>;
    createList(count: number, item?: Partial<Prisma.NftMintCreateInput & TTransients>): PromiseLike<NftMint[]>;
    createForConnect(inputData?: Partial<Prisma.NftMintCreateInput & TTransients>): PromiseLike<Pick<NftMint, "id">>;
}

export interface NftMintFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends NftMintFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): NftMintFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateNftMintScalarsOrEnums({ seq }: {
    readonly seq: number;
}): NftMintScalarOrEnumFields {
    return {};
}

function defineNftMintFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends NftMintFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): NftMintFactoryInterface<TTransients, NftMintTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly NftMintTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("NftMint", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.NftMintCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateNftMintScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<NftMintFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<NftMintFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                orderItem: isNftMintorderItemFactory(defaultData.orderItem) ? {
                    create: await defaultData.orderItem.build()
                } : defaultData.orderItem,
                nftWallet: isNftMintnftWalletFactory(defaultData.nftWallet) ? {
                    create: await defaultData.nftWallet.build()
                } : defaultData.nftWallet,
                nftInstance: isNftMintnftInstanceFactory(defaultData.nftInstance) ? {
                    create: await defaultData.nftInstance.build()
                } : defaultData.nftInstance
            } as Prisma.NftMintCreateInput;
            const data: Prisma.NftMintCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.NftMintCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: NftMint) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.NftMintCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().nftMint.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.NftMintCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.NftMintCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "NftMint" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: NftMintTraitKeys<TOptions>, ...names: readonly NftMintTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface NftMintFactoryBuilder {
    <TOptions extends NftMintFactoryDefineOptions>(options: TOptions): NftMintFactoryInterface<{}, NftMintTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends NftMintTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends NftMintFactoryDefineOptions<TTransients>>(options: TOptions) => NftMintFactoryInterface<TTransients, NftMintTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link NftMint} model.
 *
 * @param options
 * @returns factory {@link NftMintFactoryInterface}
 */
export const defineNftMintFactory = (<TOptions extends NftMintFactoryDefineOptions>(options: TOptions): NftMintFactoryInterface<TOptions> => {
    return defineNftMintFactoryInternal(options, {});
}) as NftMintFactoryBuilder;

defineNftMintFactory.withTransientFields = defaultTransientFieldValues => options => defineNftMintFactoryInternal(options, defaultTransientFieldValues);

type OrderScalarOrEnumFields = {};

type OrderuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutOrdersInput["create"]>;
};

type OrderFactoryDefineInput = {
    id?: string;
    status?: OrderStatus;
    paymentProvider?: PaymentProvider;
    externalRef?: string | null;
    totalAmount?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
    user: OrderuserFactory | Prisma.UserCreateNestedOneWithoutOrdersInput;
    items?: Prisma.OrderItemCreateNestedManyWithoutOrderInput;
};

type OrderTransientFields = Record<string, unknown> & Partial<Record<keyof OrderFactoryDefineInput, never>>;

type OrderFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<OrderFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Order, Prisma.OrderCreateInput, TTransients>;

type OrderFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<OrderFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: OrderFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Order, Prisma.OrderCreateInput, TTransients>;

function isOrderuserFactory(x: OrderuserFactory | Prisma.UserCreateNestedOneWithoutOrdersInput | undefined): x is OrderuserFactory {
    return (x as any)?._factoryFor === "User";
}

type OrderTraitKeys<TOptions extends OrderFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface OrderFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Order";
    build(inputData?: Partial<Prisma.OrderCreateInput & TTransients>): PromiseLike<Prisma.OrderCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.OrderCreateInput & TTransients>): PromiseLike<Prisma.OrderCreateInput>;
    buildList(list: readonly Partial<Prisma.OrderCreateInput & TTransients>[]): PromiseLike<Prisma.OrderCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.OrderCreateInput & TTransients>): PromiseLike<Prisma.OrderCreateInput[]>;
    pickForConnect(inputData: Order): Pick<Order, "id">;
    create(inputData?: Partial<Prisma.OrderCreateInput & TTransients>): PromiseLike<Order>;
    createList(list: readonly Partial<Prisma.OrderCreateInput & TTransients>[]): PromiseLike<Order[]>;
    createList(count: number, item?: Partial<Prisma.OrderCreateInput & TTransients>): PromiseLike<Order[]>;
    createForConnect(inputData?: Partial<Prisma.OrderCreateInput & TTransients>): PromiseLike<Pick<Order, "id">>;
}

export interface OrderFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends OrderFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): OrderFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateOrderScalarsOrEnums({ seq }: {
    readonly seq: number;
}): OrderScalarOrEnumFields {
    return {};
}

function defineOrderFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends OrderFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): OrderFactoryInterface<TTransients, OrderTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly OrderTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Order", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.OrderCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateOrderScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<OrderFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<OrderFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isOrderuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user
            } as Prisma.OrderCreateInput;
            const data: Prisma.OrderCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.OrderCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Order) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.OrderCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().order.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.OrderCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.OrderCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Order" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: OrderTraitKeys<TOptions>, ...names: readonly OrderTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface OrderFactoryBuilder {
    <TOptions extends OrderFactoryDefineOptions>(options: TOptions): OrderFactoryInterface<{}, OrderTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends OrderTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends OrderFactoryDefineOptions<TTransients>>(options: TOptions) => OrderFactoryInterface<TTransients, OrderTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Order} model.
 *
 * @param options
 * @returns factory {@link OrderFactoryInterface}
 */
export const defineOrderFactory = (<TOptions extends OrderFactoryDefineOptions>(options: TOptions): OrderFactoryInterface<TOptions> => {
    return defineOrderFactoryInternal(options, {});
}) as OrderFactoryBuilder;

defineOrderFactory.withTransientFields = defaultTransientFieldValues => options => defineOrderFactoryInternal(options, defaultTransientFieldValues);

type OrderItemScalarOrEnumFields = {
    priceSnapshot: number;
    quantity: number;
};

type OrderItemorderFactory = {
    _factoryFor: "Order";
    build: () => PromiseLike<Prisma.OrderCreateNestedOneWithoutItemsInput["create"]>;
};

type OrderItemproductFactory = {
    _factoryFor: "Product";
    build: () => PromiseLike<Prisma.ProductCreateNestedOneWithoutOrderItemInput["create"]>;
};

type OrderItemFactoryDefineInput = {
    id?: string;
    priceSnapshot?: number;
    quantity?: number;
    createdAt?: Date;
    updatedAt?: Date;
    order: OrderItemorderFactory | Prisma.OrderCreateNestedOneWithoutItemsInput;
    product: OrderItemproductFactory | Prisma.ProductCreateNestedOneWithoutOrderItemInput;
    nftMints?: Prisma.NftMintCreateNestedManyWithoutOrderItemInput;
};

type OrderItemTransientFields = Record<string, unknown> & Partial<Record<keyof OrderItemFactoryDefineInput, never>>;

type OrderItemFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<OrderItemFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<OrderItem, Prisma.OrderItemCreateInput, TTransients>;

type OrderItemFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<OrderItemFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: OrderItemFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<OrderItem, Prisma.OrderItemCreateInput, TTransients>;

function isOrderItemorderFactory(x: OrderItemorderFactory | Prisma.OrderCreateNestedOneWithoutItemsInput | undefined): x is OrderItemorderFactory {
    return (x as any)?._factoryFor === "Order";
}

function isOrderItemproductFactory(x: OrderItemproductFactory | Prisma.ProductCreateNestedOneWithoutOrderItemInput | undefined): x is OrderItemproductFactory {
    return (x as any)?._factoryFor === "Product";
}

type OrderItemTraitKeys<TOptions extends OrderItemFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface OrderItemFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "OrderItem";
    build(inputData?: Partial<Prisma.OrderItemCreateInput & TTransients>): PromiseLike<Prisma.OrderItemCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.OrderItemCreateInput & TTransients>): PromiseLike<Prisma.OrderItemCreateInput>;
    buildList(list: readonly Partial<Prisma.OrderItemCreateInput & TTransients>[]): PromiseLike<Prisma.OrderItemCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.OrderItemCreateInput & TTransients>): PromiseLike<Prisma.OrderItemCreateInput[]>;
    pickForConnect(inputData: OrderItem): Pick<OrderItem, "id">;
    create(inputData?: Partial<Prisma.OrderItemCreateInput & TTransients>): PromiseLike<OrderItem>;
    createList(list: readonly Partial<Prisma.OrderItemCreateInput & TTransients>[]): PromiseLike<OrderItem[]>;
    createList(count: number, item?: Partial<Prisma.OrderItemCreateInput & TTransients>): PromiseLike<OrderItem[]>;
    createForConnect(inputData?: Partial<Prisma.OrderItemCreateInput & TTransients>): PromiseLike<Pick<OrderItem, "id">>;
}

export interface OrderItemFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends OrderItemFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): OrderItemFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateOrderItemScalarsOrEnums({ seq }: {
    readonly seq: number;
}): OrderItemScalarOrEnumFields {
    return {
        priceSnapshot: getScalarFieldValueGenerator().Int({ modelName: "OrderItem", fieldName: "priceSnapshot", isId: false, isUnique: false, seq }),
        quantity: getScalarFieldValueGenerator().Int({ modelName: "OrderItem", fieldName: "quantity", isId: false, isUnique: false, seq })
    };
}

function defineOrderItemFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends OrderItemFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): OrderItemFactoryInterface<TTransients, OrderItemTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly OrderItemTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("OrderItem", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.OrderItemCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateOrderItemScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<OrderItemFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<OrderItemFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                order: isOrderItemorderFactory(defaultData.order) ? {
                    create: await defaultData.order.build()
                } : defaultData.order,
                product: isOrderItemproductFactory(defaultData.product) ? {
                    create: await defaultData.product.build()
                } : defaultData.product
            } as Prisma.OrderItemCreateInput;
            const data: Prisma.OrderItemCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.OrderItemCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: OrderItem) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.OrderItemCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().orderItem.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.OrderItemCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.OrderItemCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "OrderItem" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: OrderItemTraitKeys<TOptions>, ...names: readonly OrderItemTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface OrderItemFactoryBuilder {
    <TOptions extends OrderItemFactoryDefineOptions>(options: TOptions): OrderItemFactoryInterface<{}, OrderItemTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends OrderItemTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends OrderItemFactoryDefineOptions<TTransients>>(options: TOptions) => OrderItemFactoryInterface<TTransients, OrderItemTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link OrderItem} model.
 *
 * @param options
 * @returns factory {@link OrderItemFactoryInterface}
 */
export const defineOrderItemFactory = (<TOptions extends OrderItemFactoryDefineOptions>(options: TOptions): OrderItemFactoryInterface<TOptions> => {
    return defineOrderItemFactoryInternal(options, {});
}) as OrderItemFactoryBuilder;

defineOrderItemFactory.withTransientFields = defaultTransientFieldValues => options => defineOrderItemFactoryInternal(options, defaultTransientFieldValues);

type PaymentEventScalarOrEnumFields = {
    eventId: string;
    eventType: string;
};

type PaymentEventFactoryDefineInput = {
    id?: string;
    eventId?: string;
    eventType?: string;
    orderId?: string | null;
    processedAt?: Date;
};

type PaymentEventTransientFields = Record<string, unknown> & Partial<Record<keyof PaymentEventFactoryDefineInput, never>>;

type PaymentEventFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<PaymentEventFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<PaymentEvent, Prisma.PaymentEventCreateInput, TTransients>;

type PaymentEventFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<PaymentEventFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: PaymentEventFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<PaymentEvent, Prisma.PaymentEventCreateInput, TTransients>;

type PaymentEventTraitKeys<TOptions extends PaymentEventFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface PaymentEventFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "PaymentEvent";
    build(inputData?: Partial<Prisma.PaymentEventCreateInput & TTransients>): PromiseLike<Prisma.PaymentEventCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.PaymentEventCreateInput & TTransients>): PromiseLike<Prisma.PaymentEventCreateInput>;
    buildList(list: readonly Partial<Prisma.PaymentEventCreateInput & TTransients>[]): PromiseLike<Prisma.PaymentEventCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.PaymentEventCreateInput & TTransients>): PromiseLike<Prisma.PaymentEventCreateInput[]>;
    pickForConnect(inputData: PaymentEvent): Pick<PaymentEvent, "id">;
    create(inputData?: Partial<Prisma.PaymentEventCreateInput & TTransients>): PromiseLike<PaymentEvent>;
    createList(list: readonly Partial<Prisma.PaymentEventCreateInput & TTransients>[]): PromiseLike<PaymentEvent[]>;
    createList(count: number, item?: Partial<Prisma.PaymentEventCreateInput & TTransients>): PromiseLike<PaymentEvent[]>;
    createForConnect(inputData?: Partial<Prisma.PaymentEventCreateInput & TTransients>): PromiseLike<Pick<PaymentEvent, "id">>;
}

export interface PaymentEventFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends PaymentEventFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): PaymentEventFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGeneratePaymentEventScalarsOrEnums({ seq }: {
    readonly seq: number;
}): PaymentEventScalarOrEnumFields {
    return {
        eventId: getScalarFieldValueGenerator().String({ modelName: "PaymentEvent", fieldName: "eventId", isId: false, isUnique: true, seq }),
        eventType: getScalarFieldValueGenerator().String({ modelName: "PaymentEvent", fieldName: "eventType", isId: false, isUnique: false, seq })
    };
}

function definePaymentEventFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends PaymentEventFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): PaymentEventFactoryInterface<TTransients, PaymentEventTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly PaymentEventTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("PaymentEvent", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.PaymentEventCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGeneratePaymentEventScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<PaymentEventFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<PaymentEventFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {} as Prisma.PaymentEventCreateInput;
            const data: Prisma.PaymentEventCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PaymentEventCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: PaymentEvent) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.PaymentEventCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().paymentEvent.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PaymentEventCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.PaymentEventCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "PaymentEvent" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: PaymentEventTraitKeys<TOptions>, ...names: readonly PaymentEventTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface PaymentEventFactoryBuilder {
    <TOptions extends PaymentEventFactoryDefineOptions>(options?: TOptions): PaymentEventFactoryInterface<{}, PaymentEventTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends PaymentEventTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends PaymentEventFactoryDefineOptions<TTransients>>(options?: TOptions) => PaymentEventFactoryInterface<TTransients, PaymentEventTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link PaymentEvent} model.
 *
 * @param options
 * @returns factory {@link PaymentEventFactoryInterface}
 */
export const definePaymentEventFactory = (<TOptions extends PaymentEventFactoryDefineOptions>(options?: TOptions): PaymentEventFactoryInterface<TOptions> => {
    return definePaymentEventFactoryInternal(options ?? {}, {});
}) as PaymentEventFactoryBuilder;

definePaymentEventFactory.withTransientFields = defaultTransientFieldValues => options => definePaymentEventFactoryInternal(options ?? {}, defaultTransientFieldValues);

type ProductScalarOrEnumFields = {
    name: string;
    price: number;
};

type ProductnftProductFactory = {
    _factoryFor: "NftProduct";
    build: () => PromiseLike<Prisma.NftProductCreateNestedOneWithoutProductInput["create"]>;
};

type ProductFactoryDefineInput = {
    id?: string;
    type?: ProductType;
    name?: string;
    description?: string | null;
    imageUrl?: string | null;
    price?: number;
    maxSupply?: number | null;
    startsAt?: Date | null;
    endsAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
    orderItem?: Prisma.OrderItemCreateNestedManyWithoutProductInput;
    nftProduct?: ProductnftProductFactory | Prisma.NftProductCreateNestedOneWithoutProductInput;
    nftInstance?: Prisma.NftInstanceCreateNestedManyWithoutProductInput;
};

type ProductTransientFields = Record<string, unknown> & Partial<Record<keyof ProductFactoryDefineInput, never>>;

type ProductFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ProductFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Product, Prisma.ProductCreateInput, TTransients>;

type ProductFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<ProductFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: ProductFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Product, Prisma.ProductCreateInput, TTransients>;

function isProductnftProductFactory(x: ProductnftProductFactory | Prisma.NftProductCreateNestedOneWithoutProductInput | undefined): x is ProductnftProductFactory {
    return (x as any)?._factoryFor === "NftProduct";
}

type ProductTraitKeys<TOptions extends ProductFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface ProductFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Product";
    build(inputData?: Partial<Prisma.ProductCreateInput & TTransients>): PromiseLike<Prisma.ProductCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ProductCreateInput & TTransients>): PromiseLike<Prisma.ProductCreateInput>;
    buildList(list: readonly Partial<Prisma.ProductCreateInput & TTransients>[]): PromiseLike<Prisma.ProductCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ProductCreateInput & TTransients>): PromiseLike<Prisma.ProductCreateInput[]>;
    pickForConnect(inputData: Product): Pick<Product, "id">;
    create(inputData?: Partial<Prisma.ProductCreateInput & TTransients>): PromiseLike<Product>;
    createList(list: readonly Partial<Prisma.ProductCreateInput & TTransients>[]): PromiseLike<Product[]>;
    createList(count: number, item?: Partial<Prisma.ProductCreateInput & TTransients>): PromiseLike<Product[]>;
    createForConnect(inputData?: Partial<Prisma.ProductCreateInput & TTransients>): PromiseLike<Pick<Product, "id">>;
}

export interface ProductFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ProductFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ProductFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateProductScalarsOrEnums({ seq }: {
    readonly seq: number;
}): ProductScalarOrEnumFields {
    return {
        name: getScalarFieldValueGenerator().String({ modelName: "Product", fieldName: "name", isId: false, isUnique: false, seq }),
        price: getScalarFieldValueGenerator().Int({ modelName: "Product", fieldName: "price", isId: false, isUnique: false, seq })
    };
}

function defineProductFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends ProductFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): ProductFactoryInterface<TTransients, ProductTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly ProductTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("Product", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.ProductCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateProductScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<ProductFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<ProductFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                nftProduct: isProductnftProductFactory(defaultData.nftProduct) ? {
                    create: await defaultData.nftProduct.build()
                } : defaultData.nftProduct
            } as Prisma.ProductCreateInput;
            const data: Prisma.ProductCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ProductCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: Product) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.ProductCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().product.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.ProductCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.ProductCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Product" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: ProductTraitKeys<TOptions>, ...names: readonly ProductTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface ProductFactoryBuilder {
    <TOptions extends ProductFactoryDefineOptions>(options?: TOptions): ProductFactoryInterface<{}, ProductTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ProductTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ProductFactoryDefineOptions<TTransients>>(options?: TOptions) => ProductFactoryInterface<TTransients, ProductTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link Product} model.
 *
 * @param options
 * @returns factory {@link ProductFactoryInterface}
 */
export const defineProductFactory = (<TOptions extends ProductFactoryDefineOptions>(options?: TOptions): ProductFactoryInterface<TOptions> => {
    return defineProductFactoryInternal(options ?? {}, {});
}) as ProductFactoryBuilder;

defineProductFactory.withTransientFields = defaultTransientFieldValues => options => defineProductFactoryInternal(options ?? {}, defaultTransientFieldValues);

type NftProductScalarOrEnumFields = {
    stripeProductId: string;
    nmkrProjectId: string;
    policyId: string;
};

type NftProductproductFactory = {
    _factoryFor: "Product";
    build: () => PromiseLike<Prisma.ProductCreateNestedOneWithoutNftProductInput["create"]>;
};

type NftProductFactoryDefineInput = {
    id?: string;
    stripeProductId?: string;
    nmkrProjectId?: string;
    policyId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    product: NftProductproductFactory | Prisma.ProductCreateNestedOneWithoutNftProductInput;
};

type NftProductTransientFields = Record<string, unknown> & Partial<Record<keyof NftProductFactoryDefineInput, never>>;

type NftProductFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<NftProductFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<NftProduct, Prisma.NftProductCreateInput, TTransients>;

type NftProductFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<NftProductFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: NftProductFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<NftProduct, Prisma.NftProductCreateInput, TTransients>;

function isNftProductproductFactory(x: NftProductproductFactory | Prisma.ProductCreateNestedOneWithoutNftProductInput | undefined): x is NftProductproductFactory {
    return (x as any)?._factoryFor === "Product";
}

type NftProductTraitKeys<TOptions extends NftProductFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface NftProductFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "NftProduct";
    build(inputData?: Partial<Prisma.NftProductCreateInput & TTransients>): PromiseLike<Prisma.NftProductCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.NftProductCreateInput & TTransients>): PromiseLike<Prisma.NftProductCreateInput>;
    buildList(list: readonly Partial<Prisma.NftProductCreateInput & TTransients>[]): PromiseLike<Prisma.NftProductCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.NftProductCreateInput & TTransients>): PromiseLike<Prisma.NftProductCreateInput[]>;
    pickForConnect(inputData: NftProduct): Pick<NftProduct, "id">;
    create(inputData?: Partial<Prisma.NftProductCreateInput & TTransients>): PromiseLike<NftProduct>;
    createList(list: readonly Partial<Prisma.NftProductCreateInput & TTransients>[]): PromiseLike<NftProduct[]>;
    createList(count: number, item?: Partial<Prisma.NftProductCreateInput & TTransients>): PromiseLike<NftProduct[]>;
    createForConnect(inputData?: Partial<Prisma.NftProductCreateInput & TTransients>): PromiseLike<Pick<NftProduct, "id">>;
}

export interface NftProductFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends NftProductFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): NftProductFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateNftProductScalarsOrEnums({ seq }: {
    readonly seq: number;
}): NftProductScalarOrEnumFields {
    return {
        stripeProductId: getScalarFieldValueGenerator().String({ modelName: "NftProduct", fieldName: "stripeProductId", isId: false, isUnique: false, seq }),
        nmkrProjectId: getScalarFieldValueGenerator().String({ modelName: "NftProduct", fieldName: "nmkrProjectId", isId: false, isUnique: false, seq }),
        policyId: getScalarFieldValueGenerator().String({ modelName: "NftProduct", fieldName: "policyId", isId: false, isUnique: false, seq })
    };
}

function defineNftProductFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends NftProductFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): NftProductFactoryInterface<TTransients, NftProductTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly NftProductTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("NftProduct", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.NftProductCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateNftProductScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<NftProductFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<NftProductFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                product: isNftProductproductFactory(defaultData.product) ? {
                    create: await defaultData.product.build()
                } : defaultData.product
            } as Prisma.NftProductCreateInput;
            const data: Prisma.NftProductCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.NftProductCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: NftProduct) => ({
            id: inputData.id
        });
        const create = async (inputData: Partial<Prisma.NftProductCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().nftProduct.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.NftProductCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.NftProductCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "NftProduct" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: NftProductTraitKeys<TOptions>, ...names: readonly NftProductTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface NftProductFactoryBuilder {
    <TOptions extends NftProductFactoryDefineOptions>(options: TOptions): NftProductFactoryInterface<{}, NftProductTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends NftProductTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends NftProductFactoryDefineOptions<TTransients>>(options: TOptions) => NftProductFactoryInterface<TTransients, NftProductTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link NftProduct} model.
 *
 * @param options
 * @returns factory {@link NftProductFactoryInterface}
 */
export const defineNftProductFactory = (<TOptions extends NftProductFactoryDefineOptions>(options: TOptions): NftProductFactoryInterface<TOptions> => {
    return defineNftProductFactoryInternal(options, {});
}) as NftProductFactoryBuilder;

defineNftProductFactory.withTransientFields = defaultTransientFieldValues => options => defineNftProductFactoryInternal(options, defaultTransientFieldValues);

type PlacePublicOpportunityCountViewScalarOrEnumFields = {
    currentPublicCount: number;
};

type PlacePublicOpportunityCountViewplaceFactory = {
    _factoryFor: "Place";
    build: () => PromiseLike<Prisma.PlaceCreateNestedOneWithoutCurrentPublicOpportunityCountInput["create"]>;
};

type PlacePublicOpportunityCountViewFactoryDefineInput = {
    currentPublicCount?: number;
    place: PlacePublicOpportunityCountViewplaceFactory | Prisma.PlaceCreateNestedOneWithoutCurrentPublicOpportunityCountInput;
};

type PlacePublicOpportunityCountViewTransientFields = Record<string, unknown> & Partial<Record<keyof PlacePublicOpportunityCountViewFactoryDefineInput, never>>;

type PlacePublicOpportunityCountViewFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<PlacePublicOpportunityCountViewFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<PlacePublicOpportunityCountView, Prisma.PlacePublicOpportunityCountViewCreateInput, TTransients>;

type PlacePublicOpportunityCountViewFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<PlacePublicOpportunityCountViewFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: PlacePublicOpportunityCountViewFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<PlacePublicOpportunityCountView, Prisma.PlacePublicOpportunityCountViewCreateInput, TTransients>;

function isPlacePublicOpportunityCountViewplaceFactory(x: PlacePublicOpportunityCountViewplaceFactory | Prisma.PlaceCreateNestedOneWithoutCurrentPublicOpportunityCountInput | undefined): x is PlacePublicOpportunityCountViewplaceFactory {
    return (x as any)?._factoryFor === "Place";
}

type PlacePublicOpportunityCountViewTraitKeys<TOptions extends PlacePublicOpportunityCountViewFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface PlacePublicOpportunityCountViewFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "PlacePublicOpportunityCountView";
    build(inputData?: Partial<Prisma.PlacePublicOpportunityCountViewCreateInput & TTransients>): PromiseLike<Prisma.PlacePublicOpportunityCountViewCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.PlacePublicOpportunityCountViewCreateInput & TTransients>): PromiseLike<Prisma.PlacePublicOpportunityCountViewCreateInput>;
    buildList(list: readonly Partial<Prisma.PlacePublicOpportunityCountViewCreateInput & TTransients>[]): PromiseLike<Prisma.PlacePublicOpportunityCountViewCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.PlacePublicOpportunityCountViewCreateInput & TTransients>): PromiseLike<Prisma.PlacePublicOpportunityCountViewCreateInput[]>;
    pickForConnect(inputData: PlacePublicOpportunityCountView): Pick<PlacePublicOpportunityCountView, "placeId">;
    create(inputData?: Partial<Prisma.PlacePublicOpportunityCountViewCreateInput & TTransients>): PromiseLike<PlacePublicOpportunityCountView>;
    createList(list: readonly Partial<Prisma.PlacePublicOpportunityCountViewCreateInput & TTransients>[]): PromiseLike<PlacePublicOpportunityCountView[]>;
    createList(count: number, item?: Partial<Prisma.PlacePublicOpportunityCountViewCreateInput & TTransients>): PromiseLike<PlacePublicOpportunityCountView[]>;
    createForConnect(inputData?: Partial<Prisma.PlacePublicOpportunityCountViewCreateInput & TTransients>): PromiseLike<Pick<PlacePublicOpportunityCountView, "placeId">>;
}

export interface PlacePublicOpportunityCountViewFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends PlacePublicOpportunityCountViewFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): PlacePublicOpportunityCountViewFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGeneratePlacePublicOpportunityCountViewScalarsOrEnums({ seq }: {
    readonly seq: number;
}): PlacePublicOpportunityCountViewScalarOrEnumFields {
    return {
        currentPublicCount: getScalarFieldValueGenerator().Int({ modelName: "PlacePublicOpportunityCountView", fieldName: "currentPublicCount", isId: false, isUnique: false, seq })
    };
}

function definePlacePublicOpportunityCountViewFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends PlacePublicOpportunityCountViewFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): PlacePublicOpportunityCountViewFactoryInterface<TTransients, PlacePublicOpportunityCountViewTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly PlacePublicOpportunityCountViewTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("PlacePublicOpportunityCountView", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.PlacePublicOpportunityCountViewCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGeneratePlacePublicOpportunityCountViewScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<PlacePublicOpportunityCountViewFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<PlacePublicOpportunityCountViewFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                place: isPlacePublicOpportunityCountViewplaceFactory(defaultData.place) ? {
                    create: await defaultData.place.build()
                } : defaultData.place
            } as Prisma.PlacePublicOpportunityCountViewCreateInput;
            const data: Prisma.PlacePublicOpportunityCountViewCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PlacePublicOpportunityCountViewCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: PlacePublicOpportunityCountView) => ({
            placeId: inputData.placeId
        });
        const create = async (inputData: Partial<Prisma.PlacePublicOpportunityCountViewCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().placePublicOpportunityCountView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PlacePublicOpportunityCountViewCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.PlacePublicOpportunityCountViewCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "PlacePublicOpportunityCountView" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: PlacePublicOpportunityCountViewTraitKeys<TOptions>, ...names: readonly PlacePublicOpportunityCountViewTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface PlacePublicOpportunityCountViewFactoryBuilder {
    <TOptions extends PlacePublicOpportunityCountViewFactoryDefineOptions>(options: TOptions): PlacePublicOpportunityCountViewFactoryInterface<{}, PlacePublicOpportunityCountViewTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends PlacePublicOpportunityCountViewTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends PlacePublicOpportunityCountViewFactoryDefineOptions<TTransients>>(options: TOptions) => PlacePublicOpportunityCountViewFactoryInterface<TTransients, PlacePublicOpportunityCountViewTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link PlacePublicOpportunityCountView} model.
 *
 * @param options
 * @returns factory {@link PlacePublicOpportunityCountViewFactoryInterface}
 */
export const definePlacePublicOpportunityCountViewFactory = (<TOptions extends PlacePublicOpportunityCountViewFactoryDefineOptions>(options: TOptions): PlacePublicOpportunityCountViewFactoryInterface<TOptions> => {
    return definePlacePublicOpportunityCountViewFactoryInternal(options, {});
}) as PlacePublicOpportunityCountViewFactoryBuilder;

definePlacePublicOpportunityCountViewFactory.withTransientFields = defaultTransientFieldValues => options => definePlacePublicOpportunityCountViewFactoryInternal(options, defaultTransientFieldValues);

type PlaceAccumulatedParticipantsViewScalarOrEnumFields = {
    accumulatedParticipants: number;
};

type PlaceAccumulatedParticipantsViewplaceFactory = {
    _factoryFor: "Place";
    build: () => PromiseLike<Prisma.PlaceCreateNestedOneWithoutAccumulatedParticipantsInput["create"]>;
};

type PlaceAccumulatedParticipantsViewFactoryDefineInput = {
    accumulatedParticipants?: number;
    place: PlaceAccumulatedParticipantsViewplaceFactory | Prisma.PlaceCreateNestedOneWithoutAccumulatedParticipantsInput;
};

type PlaceAccumulatedParticipantsViewTransientFields = Record<string, unknown> & Partial<Record<keyof PlaceAccumulatedParticipantsViewFactoryDefineInput, never>>;

type PlaceAccumulatedParticipantsViewFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<PlaceAccumulatedParticipantsViewFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<PlaceAccumulatedParticipantsView, Prisma.PlaceAccumulatedParticipantsViewCreateInput, TTransients>;

type PlaceAccumulatedParticipantsViewFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<PlaceAccumulatedParticipantsViewFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: PlaceAccumulatedParticipantsViewFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<PlaceAccumulatedParticipantsView, Prisma.PlaceAccumulatedParticipantsViewCreateInput, TTransients>;

function isPlaceAccumulatedParticipantsViewplaceFactory(x: PlaceAccumulatedParticipantsViewplaceFactory | Prisma.PlaceCreateNestedOneWithoutAccumulatedParticipantsInput | undefined): x is PlaceAccumulatedParticipantsViewplaceFactory {
    return (x as any)?._factoryFor === "Place";
}

type PlaceAccumulatedParticipantsViewTraitKeys<TOptions extends PlaceAccumulatedParticipantsViewFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface PlaceAccumulatedParticipantsViewFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "PlaceAccumulatedParticipantsView";
    build(inputData?: Partial<Prisma.PlaceAccumulatedParticipantsViewCreateInput & TTransients>): PromiseLike<Prisma.PlaceAccumulatedParticipantsViewCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.PlaceAccumulatedParticipantsViewCreateInput & TTransients>): PromiseLike<Prisma.PlaceAccumulatedParticipantsViewCreateInput>;
    buildList(list: readonly Partial<Prisma.PlaceAccumulatedParticipantsViewCreateInput & TTransients>[]): PromiseLike<Prisma.PlaceAccumulatedParticipantsViewCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.PlaceAccumulatedParticipantsViewCreateInput & TTransients>): PromiseLike<Prisma.PlaceAccumulatedParticipantsViewCreateInput[]>;
    pickForConnect(inputData: PlaceAccumulatedParticipantsView): Pick<PlaceAccumulatedParticipantsView, "placeId">;
    create(inputData?: Partial<Prisma.PlaceAccumulatedParticipantsViewCreateInput & TTransients>): PromiseLike<PlaceAccumulatedParticipantsView>;
    createList(list: readonly Partial<Prisma.PlaceAccumulatedParticipantsViewCreateInput & TTransients>[]): PromiseLike<PlaceAccumulatedParticipantsView[]>;
    createList(count: number, item?: Partial<Prisma.PlaceAccumulatedParticipantsViewCreateInput & TTransients>): PromiseLike<PlaceAccumulatedParticipantsView[]>;
    createForConnect(inputData?: Partial<Prisma.PlaceAccumulatedParticipantsViewCreateInput & TTransients>): PromiseLike<Pick<PlaceAccumulatedParticipantsView, "placeId">>;
}

export interface PlaceAccumulatedParticipantsViewFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends PlaceAccumulatedParticipantsViewFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): PlaceAccumulatedParticipantsViewFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGeneratePlaceAccumulatedParticipantsViewScalarsOrEnums({ seq }: {
    readonly seq: number;
}): PlaceAccumulatedParticipantsViewScalarOrEnumFields {
    return {
        accumulatedParticipants: getScalarFieldValueGenerator().Int({ modelName: "PlaceAccumulatedParticipantsView", fieldName: "accumulatedParticipants", isId: false, isUnique: false, seq })
    };
}

function definePlaceAccumulatedParticipantsViewFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends PlaceAccumulatedParticipantsViewFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): PlaceAccumulatedParticipantsViewFactoryInterface<TTransients, PlaceAccumulatedParticipantsViewTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly PlaceAccumulatedParticipantsViewTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("PlaceAccumulatedParticipantsView", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.PlaceAccumulatedParticipantsViewCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGeneratePlaceAccumulatedParticipantsViewScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<PlaceAccumulatedParticipantsViewFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<PlaceAccumulatedParticipantsViewFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                place: isPlaceAccumulatedParticipantsViewplaceFactory(defaultData.place) ? {
                    create: await defaultData.place.build()
                } : defaultData.place
            } as Prisma.PlaceAccumulatedParticipantsViewCreateInput;
            const data: Prisma.PlaceAccumulatedParticipantsViewCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PlaceAccumulatedParticipantsViewCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: PlaceAccumulatedParticipantsView) => ({
            placeId: inputData.placeId
        });
        const create = async (inputData: Partial<Prisma.PlaceAccumulatedParticipantsViewCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().placeAccumulatedParticipantsView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.PlaceAccumulatedParticipantsViewCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.PlaceAccumulatedParticipantsViewCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "PlaceAccumulatedParticipantsView" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: PlaceAccumulatedParticipantsViewTraitKeys<TOptions>, ...names: readonly PlaceAccumulatedParticipantsViewTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface PlaceAccumulatedParticipantsViewFactoryBuilder {
    <TOptions extends PlaceAccumulatedParticipantsViewFactoryDefineOptions>(options: TOptions): PlaceAccumulatedParticipantsViewFactoryInterface<{}, PlaceAccumulatedParticipantsViewTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends PlaceAccumulatedParticipantsViewTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends PlaceAccumulatedParticipantsViewFactoryDefineOptions<TTransients>>(options: TOptions) => PlaceAccumulatedParticipantsViewFactoryInterface<TTransients, PlaceAccumulatedParticipantsViewTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link PlaceAccumulatedParticipantsView} model.
 *
 * @param options
 * @returns factory {@link PlaceAccumulatedParticipantsViewFactoryInterface}
 */
export const definePlaceAccumulatedParticipantsViewFactory = (<TOptions extends PlaceAccumulatedParticipantsViewFactoryDefineOptions>(options: TOptions): PlaceAccumulatedParticipantsViewFactoryInterface<TOptions> => {
    return definePlaceAccumulatedParticipantsViewFactoryInternal(options, {});
}) as PlaceAccumulatedParticipantsViewFactoryBuilder;

definePlaceAccumulatedParticipantsViewFactory.withTransientFields = defaultTransientFieldValues => options => definePlaceAccumulatedParticipantsViewFactoryInternal(options, defaultTransientFieldValues);

type MembershipParticipationGeoViewScalarOrEnumFields = {
    type: ParticipationType;
    placeId: string;
    address: string;
    latitude: (Prisma.Decimal | Prisma.DecimalJsLike | string);
    longitude: (Prisma.Decimal | Prisma.DecimalJsLike | string);
};

type MembershipParticipationGeoViewmembershipFactory = {
    _factoryFor: "Membership";
    build: () => PromiseLike<Prisma.MembershipCreateNestedOneWithoutParticipationGeoViewsInput["create"]>;
};

type MembershipParticipationGeoViewFactoryDefineInput = {
    type?: ParticipationType;
    placeId?: string;
    placeName?: string | null;
    placeImage?: string | null;
    address?: string;
    latitude?: (Prisma.Decimal | Prisma.DecimalJsLike | string);
    longitude?: (Prisma.Decimal | Prisma.DecimalJsLike | string);
    membership: MembershipParticipationGeoViewmembershipFactory | Prisma.MembershipCreateNestedOneWithoutParticipationGeoViewsInput;
};

type MembershipParticipationGeoViewTransientFields = Record<string, unknown> & Partial<Record<keyof MembershipParticipationGeoViewFactoryDefineInput, never>>;

type MembershipParticipationGeoViewFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<MembershipParticipationGeoViewFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<MembershipParticipationGeoView, Prisma.MembershipParticipationGeoViewCreateInput, TTransients>;

type MembershipParticipationGeoViewFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<MembershipParticipationGeoViewFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: MembershipParticipationGeoViewFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<MembershipParticipationGeoView, Prisma.MembershipParticipationGeoViewCreateInput, TTransients>;

function isMembershipParticipationGeoViewmembershipFactory(x: MembershipParticipationGeoViewmembershipFactory | Prisma.MembershipCreateNestedOneWithoutParticipationGeoViewsInput | undefined): x is MembershipParticipationGeoViewmembershipFactory {
    return (x as any)?._factoryFor === "Membership";
}

type MembershipParticipationGeoViewTraitKeys<TOptions extends MembershipParticipationGeoViewFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface MembershipParticipationGeoViewFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "MembershipParticipationGeoView";
    build(inputData?: Partial<Prisma.MembershipParticipationGeoViewCreateInput & TTransients>): PromiseLike<Prisma.MembershipParticipationGeoViewCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.MembershipParticipationGeoViewCreateInput & TTransients>): PromiseLike<Prisma.MembershipParticipationGeoViewCreateInput>;
    buildList(list: readonly Partial<Prisma.MembershipParticipationGeoViewCreateInput & TTransients>[]): PromiseLike<Prisma.MembershipParticipationGeoViewCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.MembershipParticipationGeoViewCreateInput & TTransients>): PromiseLike<Prisma.MembershipParticipationGeoViewCreateInput[]>;
    pickForConnect(inputData: MembershipParticipationGeoView): Pick<MembershipParticipationGeoView, "userId" | "communityId" | "placeId">;
    create(inputData?: Partial<Prisma.MembershipParticipationGeoViewCreateInput & TTransients>): PromiseLike<MembershipParticipationGeoView>;
    createList(list: readonly Partial<Prisma.MembershipParticipationGeoViewCreateInput & TTransients>[]): PromiseLike<MembershipParticipationGeoView[]>;
    createList(count: number, item?: Partial<Prisma.MembershipParticipationGeoViewCreateInput & TTransients>): PromiseLike<MembershipParticipationGeoView[]>;
    createForConnect(inputData?: Partial<Prisma.MembershipParticipationGeoViewCreateInput & TTransients>): PromiseLike<Pick<MembershipParticipationGeoView, "userId" | "communityId" | "placeId">>;
}

export interface MembershipParticipationGeoViewFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends MembershipParticipationGeoViewFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): MembershipParticipationGeoViewFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateMembershipParticipationGeoViewScalarsOrEnums({ seq }: {
    readonly seq: number;
}): MembershipParticipationGeoViewScalarOrEnumFields {
    return {
        type: "HOSTED",
        placeId: getScalarFieldValueGenerator().String({ modelName: "MembershipParticipationGeoView", fieldName: "placeId", isId: true, isUnique: false, seq }),
        address: getScalarFieldValueGenerator().String({ modelName: "MembershipParticipationGeoView", fieldName: "address", isId: false, isUnique: false, seq }),
        latitude: getScalarFieldValueGenerator().Decimal({ modelName: "MembershipParticipationGeoView", fieldName: "latitude", isId: false, isUnique: false, seq }),
        longitude: getScalarFieldValueGenerator().Decimal({ modelName: "MembershipParticipationGeoView", fieldName: "longitude", isId: false, isUnique: false, seq })
    };
}

function defineMembershipParticipationGeoViewFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends MembershipParticipationGeoViewFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): MembershipParticipationGeoViewFactoryInterface<TTransients, MembershipParticipationGeoViewTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly MembershipParticipationGeoViewTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("MembershipParticipationGeoView", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.MembershipParticipationGeoViewCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateMembershipParticipationGeoViewScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<MembershipParticipationGeoViewFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<MembershipParticipationGeoViewFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                membership: isMembershipParticipationGeoViewmembershipFactory(defaultData.membership) ? {
                    create: await defaultData.membership.build()
                } : defaultData.membership
            } as Prisma.MembershipParticipationGeoViewCreateInput;
            const data: Prisma.MembershipParticipationGeoViewCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.MembershipParticipationGeoViewCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: MembershipParticipationGeoView) => ({
            userId: inputData.userId,
            communityId: inputData.communityId,
            placeId: inputData.placeId
        });
        const create = async (inputData: Partial<Prisma.MembershipParticipationGeoViewCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().membershipParticipationGeoView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.MembershipParticipationGeoViewCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.MembershipParticipationGeoViewCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "MembershipParticipationGeoView" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: MembershipParticipationGeoViewTraitKeys<TOptions>, ...names: readonly MembershipParticipationGeoViewTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface MembershipParticipationGeoViewFactoryBuilder {
    <TOptions extends MembershipParticipationGeoViewFactoryDefineOptions>(options: TOptions): MembershipParticipationGeoViewFactoryInterface<{}, MembershipParticipationGeoViewTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends MembershipParticipationGeoViewTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends MembershipParticipationGeoViewFactoryDefineOptions<TTransients>>(options: TOptions) => MembershipParticipationGeoViewFactoryInterface<TTransients, MembershipParticipationGeoViewTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link MembershipParticipationGeoView} model.
 *
 * @param options
 * @returns factory {@link MembershipParticipationGeoViewFactoryInterface}
 */
export const defineMembershipParticipationGeoViewFactory = (<TOptions extends MembershipParticipationGeoViewFactoryDefineOptions>(options: TOptions): MembershipParticipationGeoViewFactoryInterface<TOptions> => {
    return defineMembershipParticipationGeoViewFactoryInternal(options, {});
}) as MembershipParticipationGeoViewFactoryBuilder;

defineMembershipParticipationGeoViewFactory.withTransientFields = defaultTransientFieldValues => options => defineMembershipParticipationGeoViewFactoryInternal(options, defaultTransientFieldValues);

type MembershipParticipationCountViewScalarOrEnumFields = {
    type: ParticipationType;
    totalCount: number;
};

type MembershipParticipationCountViewmembershipFactory = {
    _factoryFor: "Membership";
    build: () => PromiseLike<Prisma.MembershipCreateNestedOneWithoutParticipationCountViewsInput["create"]>;
};

type MembershipParticipationCountViewFactoryDefineInput = {
    type?: ParticipationType;
    totalCount?: number;
    membership: MembershipParticipationCountViewmembershipFactory | Prisma.MembershipCreateNestedOneWithoutParticipationCountViewsInput;
};

type MembershipParticipationCountViewTransientFields = Record<string, unknown> & Partial<Record<keyof MembershipParticipationCountViewFactoryDefineInput, never>>;

type MembershipParticipationCountViewFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<MembershipParticipationCountViewFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<MembershipParticipationCountView, Prisma.MembershipParticipationCountViewCreateInput, TTransients>;

type MembershipParticipationCountViewFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<MembershipParticipationCountViewFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: MembershipParticipationCountViewFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<MembershipParticipationCountView, Prisma.MembershipParticipationCountViewCreateInput, TTransients>;

function isMembershipParticipationCountViewmembershipFactory(x: MembershipParticipationCountViewmembershipFactory | Prisma.MembershipCreateNestedOneWithoutParticipationCountViewsInput | undefined): x is MembershipParticipationCountViewmembershipFactory {
    return (x as any)?._factoryFor === "Membership";
}

type MembershipParticipationCountViewTraitKeys<TOptions extends MembershipParticipationCountViewFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface MembershipParticipationCountViewFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "MembershipParticipationCountView";
    build(inputData?: Partial<Prisma.MembershipParticipationCountViewCreateInput & TTransients>): PromiseLike<Prisma.MembershipParticipationCountViewCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.MembershipParticipationCountViewCreateInput & TTransients>): PromiseLike<Prisma.MembershipParticipationCountViewCreateInput>;
    buildList(list: readonly Partial<Prisma.MembershipParticipationCountViewCreateInput & TTransients>[]): PromiseLike<Prisma.MembershipParticipationCountViewCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.MembershipParticipationCountViewCreateInput & TTransients>): PromiseLike<Prisma.MembershipParticipationCountViewCreateInput[]>;
    pickForConnect(inputData: MembershipParticipationCountView): Pick<MembershipParticipationCountView, "userId" | "communityId" | "type">;
    create(inputData?: Partial<Prisma.MembershipParticipationCountViewCreateInput & TTransients>): PromiseLike<MembershipParticipationCountView>;
    createList(list: readonly Partial<Prisma.MembershipParticipationCountViewCreateInput & TTransients>[]): PromiseLike<MembershipParticipationCountView[]>;
    createList(count: number, item?: Partial<Prisma.MembershipParticipationCountViewCreateInput & TTransients>): PromiseLike<MembershipParticipationCountView[]>;
    createForConnect(inputData?: Partial<Prisma.MembershipParticipationCountViewCreateInput & TTransients>): PromiseLike<Pick<MembershipParticipationCountView, "userId" | "communityId" | "type">>;
}

export interface MembershipParticipationCountViewFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends MembershipParticipationCountViewFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): MembershipParticipationCountViewFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateMembershipParticipationCountViewScalarsOrEnums({ seq }: {
    readonly seq: number;
}): MembershipParticipationCountViewScalarOrEnumFields {
    return {
        type: "HOSTED",
        totalCount: getScalarFieldValueGenerator().Int({ modelName: "MembershipParticipationCountView", fieldName: "totalCount", isId: false, isUnique: false, seq })
    };
}

function defineMembershipParticipationCountViewFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends MembershipParticipationCountViewFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): MembershipParticipationCountViewFactoryInterface<TTransients, MembershipParticipationCountViewTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly MembershipParticipationCountViewTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("MembershipParticipationCountView", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.MembershipParticipationCountViewCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateMembershipParticipationCountViewScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<MembershipParticipationCountViewFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<MembershipParticipationCountViewFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                membership: isMembershipParticipationCountViewmembershipFactory(defaultData.membership) ? {
                    create: await defaultData.membership.build()
                } : defaultData.membership
            } as Prisma.MembershipParticipationCountViewCreateInput;
            const data: Prisma.MembershipParticipationCountViewCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.MembershipParticipationCountViewCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: MembershipParticipationCountView) => ({
            userId: inputData.userId,
            communityId: inputData.communityId,
            type: inputData.type
        });
        const create = async (inputData: Partial<Prisma.MembershipParticipationCountViewCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().membershipParticipationCountView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.MembershipParticipationCountViewCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.MembershipParticipationCountViewCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "MembershipParticipationCountView" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: MembershipParticipationCountViewTraitKeys<TOptions>, ...names: readonly MembershipParticipationCountViewTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface MembershipParticipationCountViewFactoryBuilder {
    <TOptions extends MembershipParticipationCountViewFactoryDefineOptions>(options: TOptions): MembershipParticipationCountViewFactoryInterface<{}, MembershipParticipationCountViewTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends MembershipParticipationCountViewTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends MembershipParticipationCountViewFactoryDefineOptions<TTransients>>(options: TOptions) => MembershipParticipationCountViewFactoryInterface<TTransients, MembershipParticipationCountViewTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link MembershipParticipationCountView} model.
 *
 * @param options
 * @returns factory {@link MembershipParticipationCountViewFactoryInterface}
 */
export const defineMembershipParticipationCountViewFactory = (<TOptions extends MembershipParticipationCountViewFactoryDefineOptions>(options: TOptions): MembershipParticipationCountViewFactoryInterface<TOptions> => {
    return defineMembershipParticipationCountViewFactoryInternal(options, {});
}) as MembershipParticipationCountViewFactoryBuilder;

defineMembershipParticipationCountViewFactory.withTransientFields = defaultTransientFieldValues => options => defineMembershipParticipationCountViewFactoryInternal(options, defaultTransientFieldValues);

type MembershipHostedOpportunityCountViewScalarOrEnumFields = {
    totalCount: number;
};

type MembershipHostedOpportunityCountViewmembershipFactory = {
    _factoryFor: "Membership";
    build: () => PromiseLike<Prisma.MembershipCreateNestedOneWithoutOpportunityHostedCountViewInput["create"]>;
};

type MembershipHostedOpportunityCountViewFactoryDefineInput = {
    totalCount?: number;
    membership: MembershipHostedOpportunityCountViewmembershipFactory | Prisma.MembershipCreateNestedOneWithoutOpportunityHostedCountViewInput;
};

type MembershipHostedOpportunityCountViewTransientFields = Record<string, unknown> & Partial<Record<keyof MembershipHostedOpportunityCountViewFactoryDefineInput, never>>;

type MembershipHostedOpportunityCountViewFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<MembershipHostedOpportunityCountViewFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<MembershipHostedOpportunityCountView, Prisma.MembershipHostedOpportunityCountViewCreateInput, TTransients>;

type MembershipHostedOpportunityCountViewFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<MembershipHostedOpportunityCountViewFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: MembershipHostedOpportunityCountViewFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<MembershipHostedOpportunityCountView, Prisma.MembershipHostedOpportunityCountViewCreateInput, TTransients>;

function isMembershipHostedOpportunityCountViewmembershipFactory(x: MembershipHostedOpportunityCountViewmembershipFactory | Prisma.MembershipCreateNestedOneWithoutOpportunityHostedCountViewInput | undefined): x is MembershipHostedOpportunityCountViewmembershipFactory {
    return (x as any)?._factoryFor === "Membership";
}

type MembershipHostedOpportunityCountViewTraitKeys<TOptions extends MembershipHostedOpportunityCountViewFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface MembershipHostedOpportunityCountViewFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "MembershipHostedOpportunityCountView";
    build(inputData?: Partial<Prisma.MembershipHostedOpportunityCountViewCreateInput & TTransients>): PromiseLike<Prisma.MembershipHostedOpportunityCountViewCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.MembershipHostedOpportunityCountViewCreateInput & TTransients>): PromiseLike<Prisma.MembershipHostedOpportunityCountViewCreateInput>;
    buildList(list: readonly Partial<Prisma.MembershipHostedOpportunityCountViewCreateInput & TTransients>[]): PromiseLike<Prisma.MembershipHostedOpportunityCountViewCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.MembershipHostedOpportunityCountViewCreateInput & TTransients>): PromiseLike<Prisma.MembershipHostedOpportunityCountViewCreateInput[]>;
    pickForConnect(inputData: MembershipHostedOpportunityCountView): Pick<MembershipHostedOpportunityCountView, "userId" | "communityId">;
    create(inputData?: Partial<Prisma.MembershipHostedOpportunityCountViewCreateInput & TTransients>): PromiseLike<MembershipHostedOpportunityCountView>;
    createList(list: readonly Partial<Prisma.MembershipHostedOpportunityCountViewCreateInput & TTransients>[]): PromiseLike<MembershipHostedOpportunityCountView[]>;
    createList(count: number, item?: Partial<Prisma.MembershipHostedOpportunityCountViewCreateInput & TTransients>): PromiseLike<MembershipHostedOpportunityCountView[]>;
    createForConnect(inputData?: Partial<Prisma.MembershipHostedOpportunityCountViewCreateInput & TTransients>): PromiseLike<Pick<MembershipHostedOpportunityCountView, "userId" | "communityId">>;
}

export interface MembershipHostedOpportunityCountViewFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends MembershipHostedOpportunityCountViewFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): MembershipHostedOpportunityCountViewFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateMembershipHostedOpportunityCountViewScalarsOrEnums({ seq }: {
    readonly seq: number;
}): MembershipHostedOpportunityCountViewScalarOrEnumFields {
    return {
        totalCount: getScalarFieldValueGenerator().Int({ modelName: "MembershipHostedOpportunityCountView", fieldName: "totalCount", isId: false, isUnique: false, seq })
    };
}

function defineMembershipHostedOpportunityCountViewFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends MembershipHostedOpportunityCountViewFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): MembershipHostedOpportunityCountViewFactoryInterface<TTransients, MembershipHostedOpportunityCountViewTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly MembershipHostedOpportunityCountViewTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("MembershipHostedOpportunityCountView", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.MembershipHostedOpportunityCountViewCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateMembershipHostedOpportunityCountViewScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<MembershipHostedOpportunityCountViewFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<MembershipHostedOpportunityCountViewFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                membership: isMembershipHostedOpportunityCountViewmembershipFactory(defaultData.membership) ? {
                    create: await defaultData.membership.build()
                } : defaultData.membership
            } as Prisma.MembershipHostedOpportunityCountViewCreateInput;
            const data: Prisma.MembershipHostedOpportunityCountViewCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.MembershipHostedOpportunityCountViewCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: MembershipHostedOpportunityCountView) => ({
            userId: inputData.userId,
            communityId: inputData.communityId
        });
        const create = async (inputData: Partial<Prisma.MembershipHostedOpportunityCountViewCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().membershipHostedOpportunityCountView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.MembershipHostedOpportunityCountViewCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.MembershipHostedOpportunityCountViewCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "MembershipHostedOpportunityCountView" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: MembershipHostedOpportunityCountViewTraitKeys<TOptions>, ...names: readonly MembershipHostedOpportunityCountViewTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface MembershipHostedOpportunityCountViewFactoryBuilder {
    <TOptions extends MembershipHostedOpportunityCountViewFactoryDefineOptions>(options: TOptions): MembershipHostedOpportunityCountViewFactoryInterface<{}, MembershipHostedOpportunityCountViewTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends MembershipHostedOpportunityCountViewTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends MembershipHostedOpportunityCountViewFactoryDefineOptions<TTransients>>(options: TOptions) => MembershipHostedOpportunityCountViewFactoryInterface<TTransients, MembershipHostedOpportunityCountViewTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link MembershipHostedOpportunityCountView} model.
 *
 * @param options
 * @returns factory {@link MembershipHostedOpportunityCountViewFactoryInterface}
 */
export const defineMembershipHostedOpportunityCountViewFactory = (<TOptions extends MembershipHostedOpportunityCountViewFactoryDefineOptions>(options: TOptions): MembershipHostedOpportunityCountViewFactoryInterface<TOptions> => {
    return defineMembershipHostedOpportunityCountViewFactoryInternal(options, {});
}) as MembershipHostedOpportunityCountViewFactoryBuilder;

defineMembershipHostedOpportunityCountViewFactory.withTransientFields = defaultTransientFieldValues => options => defineMembershipHostedOpportunityCountViewFactoryInternal(options, defaultTransientFieldValues);

type CurrentPointViewScalarOrEnumFields = {
    currentPoint: (bigint | number);
};

type CurrentPointViewwalletFactory = {
    _factoryFor: "Wallet";
    build: () => PromiseLike<Prisma.WalletCreateNestedOneWithoutCurrentPointViewInput["create"]>;
};

type CurrentPointViewFactoryDefineInput = {
    currentPoint?: (bigint | number);
    wallet: CurrentPointViewwalletFactory | Prisma.WalletCreateNestedOneWithoutCurrentPointViewInput;
};

type CurrentPointViewTransientFields = Record<string, unknown> & Partial<Record<keyof CurrentPointViewFactoryDefineInput, never>>;

type CurrentPointViewFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CurrentPointViewFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<CurrentPointView, Prisma.CurrentPointViewCreateInput, TTransients>;

type CurrentPointViewFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<CurrentPointViewFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: CurrentPointViewFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<CurrentPointView, Prisma.CurrentPointViewCreateInput, TTransients>;

function isCurrentPointViewwalletFactory(x: CurrentPointViewwalletFactory | Prisma.WalletCreateNestedOneWithoutCurrentPointViewInput | undefined): x is CurrentPointViewwalletFactory {
    return (x as any)?._factoryFor === "Wallet";
}

type CurrentPointViewTraitKeys<TOptions extends CurrentPointViewFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface CurrentPointViewFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "CurrentPointView";
    build(inputData?: Partial<Prisma.CurrentPointViewCreateInput & TTransients>): PromiseLike<Prisma.CurrentPointViewCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.CurrentPointViewCreateInput & TTransients>): PromiseLike<Prisma.CurrentPointViewCreateInput>;
    buildList(list: readonly Partial<Prisma.CurrentPointViewCreateInput & TTransients>[]): PromiseLike<Prisma.CurrentPointViewCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.CurrentPointViewCreateInput & TTransients>): PromiseLike<Prisma.CurrentPointViewCreateInput[]>;
    pickForConnect(inputData: CurrentPointView): Pick<CurrentPointView, "walletId">;
    create(inputData?: Partial<Prisma.CurrentPointViewCreateInput & TTransients>): PromiseLike<CurrentPointView>;
    createList(list: readonly Partial<Prisma.CurrentPointViewCreateInput & TTransients>[]): PromiseLike<CurrentPointView[]>;
    createList(count: number, item?: Partial<Prisma.CurrentPointViewCreateInput & TTransients>): PromiseLike<CurrentPointView[]>;
    createForConnect(inputData?: Partial<Prisma.CurrentPointViewCreateInput & TTransients>): PromiseLike<Pick<CurrentPointView, "walletId">>;
}

export interface CurrentPointViewFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends CurrentPointViewFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): CurrentPointViewFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateCurrentPointViewScalarsOrEnums({ seq }: {
    readonly seq: number;
}): CurrentPointViewScalarOrEnumFields {
    return {
        currentPoint: getScalarFieldValueGenerator().BigInt({ modelName: "CurrentPointView", fieldName: "currentPoint", isId: false, isUnique: false, seq })
    };
}

function defineCurrentPointViewFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends CurrentPointViewFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): CurrentPointViewFactoryInterface<TTransients, CurrentPointViewTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly CurrentPointViewTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("CurrentPointView", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.CurrentPointViewCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCurrentPointViewScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<CurrentPointViewFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<CurrentPointViewFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                wallet: isCurrentPointViewwalletFactory(defaultData.wallet) ? {
                    create: await defaultData.wallet.build()
                } : defaultData.wallet
            } as Prisma.CurrentPointViewCreateInput;
            const data: Prisma.CurrentPointViewCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CurrentPointViewCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: CurrentPointView) => ({
            walletId: inputData.walletId
        });
        const create = async (inputData: Partial<Prisma.CurrentPointViewCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().currentPointView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.CurrentPointViewCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.CurrentPointViewCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "CurrentPointView" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: CurrentPointViewTraitKeys<TOptions>, ...names: readonly CurrentPointViewTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface CurrentPointViewFactoryBuilder {
    <TOptions extends CurrentPointViewFactoryDefineOptions>(options: TOptions): CurrentPointViewFactoryInterface<{}, CurrentPointViewTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CurrentPointViewTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CurrentPointViewFactoryDefineOptions<TTransients>>(options: TOptions) => CurrentPointViewFactoryInterface<TTransients, CurrentPointViewTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link CurrentPointView} model.
 *
 * @param options
 * @returns factory {@link CurrentPointViewFactoryInterface}
 */
export const defineCurrentPointViewFactory = (<TOptions extends CurrentPointViewFactoryDefineOptions>(options: TOptions): CurrentPointViewFactoryInterface<TOptions> => {
    return defineCurrentPointViewFactoryInternal(options, {});
}) as CurrentPointViewFactoryBuilder;

defineCurrentPointViewFactory.withTransientFields = defaultTransientFieldValues => options => defineCurrentPointViewFactoryInternal(options, defaultTransientFieldValues);

type AccumulatedPointViewScalarOrEnumFields = {
    accumulatedPoint: (bigint | number);
};

type AccumulatedPointViewwalletFactory = {
    _factoryFor: "Wallet";
    build: () => PromiseLike<Prisma.WalletCreateNestedOneWithoutAccumulatedPointViewInput["create"]>;
};

type AccumulatedPointViewFactoryDefineInput = {
    accumulatedPoint?: (bigint | number);
    wallet: AccumulatedPointViewwalletFactory | Prisma.WalletCreateNestedOneWithoutAccumulatedPointViewInput;
};

type AccumulatedPointViewTransientFields = Record<string, unknown> & Partial<Record<keyof AccumulatedPointViewFactoryDefineInput, never>>;

type AccumulatedPointViewFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<AccumulatedPointViewFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<AccumulatedPointView, Prisma.AccumulatedPointViewCreateInput, TTransients>;

type AccumulatedPointViewFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<AccumulatedPointViewFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: AccumulatedPointViewFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<AccumulatedPointView, Prisma.AccumulatedPointViewCreateInput, TTransients>;

function isAccumulatedPointViewwalletFactory(x: AccumulatedPointViewwalletFactory | Prisma.WalletCreateNestedOneWithoutAccumulatedPointViewInput | undefined): x is AccumulatedPointViewwalletFactory {
    return (x as any)?._factoryFor === "Wallet";
}

type AccumulatedPointViewTraitKeys<TOptions extends AccumulatedPointViewFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface AccumulatedPointViewFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "AccumulatedPointView";
    build(inputData?: Partial<Prisma.AccumulatedPointViewCreateInput & TTransients>): PromiseLike<Prisma.AccumulatedPointViewCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.AccumulatedPointViewCreateInput & TTransients>): PromiseLike<Prisma.AccumulatedPointViewCreateInput>;
    buildList(list: readonly Partial<Prisma.AccumulatedPointViewCreateInput & TTransients>[]): PromiseLike<Prisma.AccumulatedPointViewCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.AccumulatedPointViewCreateInput & TTransients>): PromiseLike<Prisma.AccumulatedPointViewCreateInput[]>;
    pickForConnect(inputData: AccumulatedPointView): Pick<AccumulatedPointView, "walletId">;
    create(inputData?: Partial<Prisma.AccumulatedPointViewCreateInput & TTransients>): PromiseLike<AccumulatedPointView>;
    createList(list: readonly Partial<Prisma.AccumulatedPointViewCreateInput & TTransients>[]): PromiseLike<AccumulatedPointView[]>;
    createList(count: number, item?: Partial<Prisma.AccumulatedPointViewCreateInput & TTransients>): PromiseLike<AccumulatedPointView[]>;
    createForConnect(inputData?: Partial<Prisma.AccumulatedPointViewCreateInput & TTransients>): PromiseLike<Pick<AccumulatedPointView, "walletId">>;
}

export interface AccumulatedPointViewFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends AccumulatedPointViewFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): AccumulatedPointViewFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateAccumulatedPointViewScalarsOrEnums({ seq }: {
    readonly seq: number;
}): AccumulatedPointViewScalarOrEnumFields {
    return {
        accumulatedPoint: getScalarFieldValueGenerator().BigInt({ modelName: "AccumulatedPointView", fieldName: "accumulatedPoint", isId: false, isUnique: false, seq })
    };
}

function defineAccumulatedPointViewFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends AccumulatedPointViewFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): AccumulatedPointViewFactoryInterface<TTransients, AccumulatedPointViewTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly AccumulatedPointViewTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("AccumulatedPointView", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.AccumulatedPointViewCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateAccumulatedPointViewScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<AccumulatedPointViewFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<AccumulatedPointViewFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                wallet: isAccumulatedPointViewwalletFactory(defaultData.wallet) ? {
                    create: await defaultData.wallet.build()
                } : defaultData.wallet
            } as Prisma.AccumulatedPointViewCreateInput;
            const data: Prisma.AccumulatedPointViewCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.AccumulatedPointViewCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: AccumulatedPointView) => ({
            walletId: inputData.walletId
        });
        const create = async (inputData: Partial<Prisma.AccumulatedPointViewCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().accumulatedPointView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.AccumulatedPointViewCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.AccumulatedPointViewCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "AccumulatedPointView" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: AccumulatedPointViewTraitKeys<TOptions>, ...names: readonly AccumulatedPointViewTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface AccumulatedPointViewFactoryBuilder {
    <TOptions extends AccumulatedPointViewFactoryDefineOptions>(options: TOptions): AccumulatedPointViewFactoryInterface<{}, AccumulatedPointViewTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends AccumulatedPointViewTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends AccumulatedPointViewFactoryDefineOptions<TTransients>>(options: TOptions) => AccumulatedPointViewFactoryInterface<TTransients, AccumulatedPointViewTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link AccumulatedPointView} model.
 *
 * @param options
 * @returns factory {@link AccumulatedPointViewFactoryInterface}
 */
export const defineAccumulatedPointViewFactory = (<TOptions extends AccumulatedPointViewFactoryDefineOptions>(options: TOptions): AccumulatedPointViewFactoryInterface<TOptions> => {
    return defineAccumulatedPointViewFactoryInternal(options, {});
}) as AccumulatedPointViewFactoryBuilder;

defineAccumulatedPointViewFactory.withTransientFields = defaultTransientFieldValues => options => defineAccumulatedPointViewFactoryInternal(options, defaultTransientFieldValues);

type EarliestReservableSlotViewScalarOrEnumFields = {};

type EarliestReservableSlotViewopportunityFactory = {
    _factoryFor: "Opportunity";
    build: () => PromiseLike<Prisma.OpportunityCreateNestedOneWithoutEarliestReservableSlotViewInput["create"]>;
};

type EarliestReservableSlotViewFactoryDefineInput = {
    earliestReservableAt?: Date | null;
    opportunity: EarliestReservableSlotViewopportunityFactory | Prisma.OpportunityCreateNestedOneWithoutEarliestReservableSlotViewInput;
};

type EarliestReservableSlotViewTransientFields = Record<string, unknown> & Partial<Record<keyof EarliestReservableSlotViewFactoryDefineInput, never>>;

type EarliestReservableSlotViewFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<EarliestReservableSlotViewFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<EarliestReservableSlotView, Prisma.EarliestReservableSlotViewCreateInput, TTransients>;

type EarliestReservableSlotViewFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<EarliestReservableSlotViewFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: EarliestReservableSlotViewFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<EarliestReservableSlotView, Prisma.EarliestReservableSlotViewCreateInput, TTransients>;

function isEarliestReservableSlotViewopportunityFactory(x: EarliestReservableSlotViewopportunityFactory | Prisma.OpportunityCreateNestedOneWithoutEarliestReservableSlotViewInput | undefined): x is EarliestReservableSlotViewopportunityFactory {
    return (x as any)?._factoryFor === "Opportunity";
}

type EarliestReservableSlotViewTraitKeys<TOptions extends EarliestReservableSlotViewFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface EarliestReservableSlotViewFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "EarliestReservableSlotView";
    build(inputData?: Partial<Prisma.EarliestReservableSlotViewCreateInput & TTransients>): PromiseLike<Prisma.EarliestReservableSlotViewCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.EarliestReservableSlotViewCreateInput & TTransients>): PromiseLike<Prisma.EarliestReservableSlotViewCreateInput>;
    buildList(list: readonly Partial<Prisma.EarliestReservableSlotViewCreateInput & TTransients>[]): PromiseLike<Prisma.EarliestReservableSlotViewCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.EarliestReservableSlotViewCreateInput & TTransients>): PromiseLike<Prisma.EarliestReservableSlotViewCreateInput[]>;
    pickForConnect(inputData: EarliestReservableSlotView): Pick<EarliestReservableSlotView, "opportunityId">;
    create(inputData?: Partial<Prisma.EarliestReservableSlotViewCreateInput & TTransients>): PromiseLike<EarliestReservableSlotView>;
    createList(list: readonly Partial<Prisma.EarliestReservableSlotViewCreateInput & TTransients>[]): PromiseLike<EarliestReservableSlotView[]>;
    createList(count: number, item?: Partial<Prisma.EarliestReservableSlotViewCreateInput & TTransients>): PromiseLike<EarliestReservableSlotView[]>;
    createForConnect(inputData?: Partial<Prisma.EarliestReservableSlotViewCreateInput & TTransients>): PromiseLike<Pick<EarliestReservableSlotView, "opportunityId">>;
}

export interface EarliestReservableSlotViewFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends EarliestReservableSlotViewFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): EarliestReservableSlotViewFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateEarliestReservableSlotViewScalarsOrEnums({ seq }: {
    readonly seq: number;
}): EarliestReservableSlotViewScalarOrEnumFields {
    return {};
}

function defineEarliestReservableSlotViewFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends EarliestReservableSlotViewFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): EarliestReservableSlotViewFactoryInterface<TTransients, EarliestReservableSlotViewTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly EarliestReservableSlotViewTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("EarliestReservableSlotView", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.EarliestReservableSlotViewCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateEarliestReservableSlotViewScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<EarliestReservableSlotViewFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<EarliestReservableSlotViewFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                opportunity: isEarliestReservableSlotViewopportunityFactory(defaultData.opportunity) ? {
                    create: await defaultData.opportunity.build()
                } : defaultData.opportunity
            } as Prisma.EarliestReservableSlotViewCreateInput;
            const data: Prisma.EarliestReservableSlotViewCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.EarliestReservableSlotViewCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: EarliestReservableSlotView) => ({
            opportunityId: inputData.opportunityId
        });
        const create = async (inputData: Partial<Prisma.EarliestReservableSlotViewCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().earliestReservableSlotView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.EarliestReservableSlotViewCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.EarliestReservableSlotViewCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "EarliestReservableSlotView" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: EarliestReservableSlotViewTraitKeys<TOptions>, ...names: readonly EarliestReservableSlotViewTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface EarliestReservableSlotViewFactoryBuilder {
    <TOptions extends EarliestReservableSlotViewFactoryDefineOptions>(options: TOptions): EarliestReservableSlotViewFactoryInterface<{}, EarliestReservableSlotViewTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends EarliestReservableSlotViewTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends EarliestReservableSlotViewFactoryDefineOptions<TTransients>>(options: TOptions) => EarliestReservableSlotViewFactoryInterface<TTransients, EarliestReservableSlotViewTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link EarliestReservableSlotView} model.
 *
 * @param options
 * @returns factory {@link EarliestReservableSlotViewFactoryInterface}
 */
export const defineEarliestReservableSlotViewFactory = (<TOptions extends EarliestReservableSlotViewFactoryDefineOptions>(options: TOptions): EarliestReservableSlotViewFactoryInterface<TOptions> => {
    return defineEarliestReservableSlotViewFactoryInternal(options, {});
}) as EarliestReservableSlotViewFactoryBuilder;

defineEarliestReservableSlotViewFactory.withTransientFields = defaultTransientFieldValues => options => defineEarliestReservableSlotViewFactoryInternal(options, defaultTransientFieldValues);

type OpportunityAccumulatedParticipantsViewScalarOrEnumFields = {
    accumulatedParticipants: number;
};

type OpportunityAccumulatedParticipantsViewopportunityFactory = {
    _factoryFor: "Opportunity";
    build: () => PromiseLike<Prisma.OpportunityCreateNestedOneWithoutAccumulatedParticipantsInput["create"]>;
};

type OpportunityAccumulatedParticipantsViewFactoryDefineInput = {
    accumulatedParticipants?: number;
    opportunity: OpportunityAccumulatedParticipantsViewopportunityFactory | Prisma.OpportunityCreateNestedOneWithoutAccumulatedParticipantsInput;
};

type OpportunityAccumulatedParticipantsViewTransientFields = Record<string, unknown> & Partial<Record<keyof OpportunityAccumulatedParticipantsViewFactoryDefineInput, never>>;

type OpportunityAccumulatedParticipantsViewFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<OpportunityAccumulatedParticipantsViewFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<OpportunityAccumulatedParticipantsView, Prisma.OpportunityAccumulatedParticipantsViewCreateInput, TTransients>;

type OpportunityAccumulatedParticipantsViewFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<OpportunityAccumulatedParticipantsViewFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: OpportunityAccumulatedParticipantsViewFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<OpportunityAccumulatedParticipantsView, Prisma.OpportunityAccumulatedParticipantsViewCreateInput, TTransients>;

function isOpportunityAccumulatedParticipantsViewopportunityFactory(x: OpportunityAccumulatedParticipantsViewopportunityFactory | Prisma.OpportunityCreateNestedOneWithoutAccumulatedParticipantsInput | undefined): x is OpportunityAccumulatedParticipantsViewopportunityFactory {
    return (x as any)?._factoryFor === "Opportunity";
}

type OpportunityAccumulatedParticipantsViewTraitKeys<TOptions extends OpportunityAccumulatedParticipantsViewFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface OpportunityAccumulatedParticipantsViewFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "OpportunityAccumulatedParticipantsView";
    build(inputData?: Partial<Prisma.OpportunityAccumulatedParticipantsViewCreateInput & TTransients>): PromiseLike<Prisma.OpportunityAccumulatedParticipantsViewCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.OpportunityAccumulatedParticipantsViewCreateInput & TTransients>): PromiseLike<Prisma.OpportunityAccumulatedParticipantsViewCreateInput>;
    buildList(list: readonly Partial<Prisma.OpportunityAccumulatedParticipantsViewCreateInput & TTransients>[]): PromiseLike<Prisma.OpportunityAccumulatedParticipantsViewCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.OpportunityAccumulatedParticipantsViewCreateInput & TTransients>): PromiseLike<Prisma.OpportunityAccumulatedParticipantsViewCreateInput[]>;
    pickForConnect(inputData: OpportunityAccumulatedParticipantsView): Pick<OpportunityAccumulatedParticipantsView, "opportunityId">;
    create(inputData?: Partial<Prisma.OpportunityAccumulatedParticipantsViewCreateInput & TTransients>): PromiseLike<OpportunityAccumulatedParticipantsView>;
    createList(list: readonly Partial<Prisma.OpportunityAccumulatedParticipantsViewCreateInput & TTransients>[]): PromiseLike<OpportunityAccumulatedParticipantsView[]>;
    createList(count: number, item?: Partial<Prisma.OpportunityAccumulatedParticipantsViewCreateInput & TTransients>): PromiseLike<OpportunityAccumulatedParticipantsView[]>;
    createForConnect(inputData?: Partial<Prisma.OpportunityAccumulatedParticipantsViewCreateInput & TTransients>): PromiseLike<Pick<OpportunityAccumulatedParticipantsView, "opportunityId">>;
}

export interface OpportunityAccumulatedParticipantsViewFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends OpportunityAccumulatedParticipantsViewFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): OpportunityAccumulatedParticipantsViewFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateOpportunityAccumulatedParticipantsViewScalarsOrEnums({ seq }: {
    readonly seq: number;
}): OpportunityAccumulatedParticipantsViewScalarOrEnumFields {
    return {
        accumulatedParticipants: getScalarFieldValueGenerator().Int({ modelName: "OpportunityAccumulatedParticipantsView", fieldName: "accumulatedParticipants", isId: false, isUnique: false, seq })
    };
}

function defineOpportunityAccumulatedParticipantsViewFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends OpportunityAccumulatedParticipantsViewFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): OpportunityAccumulatedParticipantsViewFactoryInterface<TTransients, OpportunityAccumulatedParticipantsViewTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly OpportunityAccumulatedParticipantsViewTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("OpportunityAccumulatedParticipantsView", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.OpportunityAccumulatedParticipantsViewCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateOpportunityAccumulatedParticipantsViewScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<OpportunityAccumulatedParticipantsViewFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<OpportunityAccumulatedParticipantsViewFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                opportunity: isOpportunityAccumulatedParticipantsViewopportunityFactory(defaultData.opportunity) ? {
                    create: await defaultData.opportunity.build()
                } : defaultData.opportunity
            } as Prisma.OpportunityAccumulatedParticipantsViewCreateInput;
            const data: Prisma.OpportunityAccumulatedParticipantsViewCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.OpportunityAccumulatedParticipantsViewCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: OpportunityAccumulatedParticipantsView) => ({
            opportunityId: inputData.opportunityId
        });
        const create = async (inputData: Partial<Prisma.OpportunityAccumulatedParticipantsViewCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().opportunityAccumulatedParticipantsView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.OpportunityAccumulatedParticipantsViewCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.OpportunityAccumulatedParticipantsViewCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "OpportunityAccumulatedParticipantsView" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: OpportunityAccumulatedParticipantsViewTraitKeys<TOptions>, ...names: readonly OpportunityAccumulatedParticipantsViewTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface OpportunityAccumulatedParticipantsViewFactoryBuilder {
    <TOptions extends OpportunityAccumulatedParticipantsViewFactoryDefineOptions>(options: TOptions): OpportunityAccumulatedParticipantsViewFactoryInterface<{}, OpportunityAccumulatedParticipantsViewTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends OpportunityAccumulatedParticipantsViewTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends OpportunityAccumulatedParticipantsViewFactoryDefineOptions<TTransients>>(options: TOptions) => OpportunityAccumulatedParticipantsViewFactoryInterface<TTransients, OpportunityAccumulatedParticipantsViewTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link OpportunityAccumulatedParticipantsView} model.
 *
 * @param options
 * @returns factory {@link OpportunityAccumulatedParticipantsViewFactoryInterface}
 */
export const defineOpportunityAccumulatedParticipantsViewFactory = (<TOptions extends OpportunityAccumulatedParticipantsViewFactoryDefineOptions>(options: TOptions): OpportunityAccumulatedParticipantsViewFactoryInterface<TOptions> => {
    return defineOpportunityAccumulatedParticipantsViewFactoryInternal(options, {});
}) as OpportunityAccumulatedParticipantsViewFactoryBuilder;

defineOpportunityAccumulatedParticipantsViewFactory.withTransientFields = defaultTransientFieldValues => options => defineOpportunityAccumulatedParticipantsViewFactoryInternal(options, defaultTransientFieldValues);

type RemainingCapacityViewScalarOrEnumFields = {};

type RemainingCapacityViewslotFactory = {
    _factoryFor: "OpportunitySlot";
    build: () => PromiseLike<Prisma.OpportunitySlotCreateNestedOneWithoutRemainingCapacityViewInput["create"]>;
};

type RemainingCapacityViewFactoryDefineInput = {
    remainingCapacity?: number | null;
    slot: RemainingCapacityViewslotFactory | Prisma.OpportunitySlotCreateNestedOneWithoutRemainingCapacityViewInput;
};

type RemainingCapacityViewTransientFields = Record<string, unknown> & Partial<Record<keyof RemainingCapacityViewFactoryDefineInput, never>>;

type RemainingCapacityViewFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<RemainingCapacityViewFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<RemainingCapacityView, Prisma.RemainingCapacityViewCreateInput, TTransients>;

type RemainingCapacityViewFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<RemainingCapacityViewFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: RemainingCapacityViewFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<RemainingCapacityView, Prisma.RemainingCapacityViewCreateInput, TTransients>;

function isRemainingCapacityViewslotFactory(x: RemainingCapacityViewslotFactory | Prisma.OpportunitySlotCreateNestedOneWithoutRemainingCapacityViewInput | undefined): x is RemainingCapacityViewslotFactory {
    return (x as any)?._factoryFor === "OpportunitySlot";
}

type RemainingCapacityViewTraitKeys<TOptions extends RemainingCapacityViewFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;

export interface RemainingCapacityViewFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "RemainingCapacityView";
    build(inputData?: Partial<Prisma.RemainingCapacityViewCreateInput & TTransients>): PromiseLike<Prisma.RemainingCapacityViewCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.RemainingCapacityViewCreateInput & TTransients>): PromiseLike<Prisma.RemainingCapacityViewCreateInput>;
    buildList(list: readonly Partial<Prisma.RemainingCapacityViewCreateInput & TTransients>[]): PromiseLike<Prisma.RemainingCapacityViewCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.RemainingCapacityViewCreateInput & TTransients>): PromiseLike<Prisma.RemainingCapacityViewCreateInput[]>;
    pickForConnect(inputData: RemainingCapacityView): Pick<RemainingCapacityView, "slotId">;
    create(inputData?: Partial<Prisma.RemainingCapacityViewCreateInput & TTransients>): PromiseLike<RemainingCapacityView>;
    createList(list: readonly Partial<Prisma.RemainingCapacityViewCreateInput & TTransients>[]): PromiseLike<RemainingCapacityView[]>;
    createList(count: number, item?: Partial<Prisma.RemainingCapacityViewCreateInput & TTransients>): PromiseLike<RemainingCapacityView[]>;
    createForConnect(inputData?: Partial<Prisma.RemainingCapacityViewCreateInput & TTransients>): PromiseLike<Pick<RemainingCapacityView, "slotId">>;
}

export interface RemainingCapacityViewFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends RemainingCapacityViewFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): RemainingCapacityViewFactoryInterfaceWithoutTraits<TTransients>;
}

function autoGenerateRemainingCapacityViewScalarsOrEnums({ seq }: {
    readonly seq: number;
}): RemainingCapacityViewScalarOrEnumFields {
    return {};
}

function defineRemainingCapacityViewFactoryInternal<TTransients extends Record<string, unknown>, TOptions extends RemainingCapacityViewFactoryDefineOptions<TTransients>>({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }: TOptions, defaultTransientFieldValues: TTransients): RemainingCapacityViewFactoryInterface<TTransients, RemainingCapacityViewTraitKeys<TOptions>> {
    const getFactoryWithTraits = (traitKeys: readonly RemainingCapacityViewTraitKeys<TOptions>[] = []) => {
        const seqKey = {};
        const getSeq = () => getSequenceCounter(seqKey);
        const screen = createScreener("RemainingCapacityView", modelFieldDefinitions);
        const handleAfterBuild = createCallbackChain([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = createCallbackChain([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = createCallbackChain([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData: Partial<Prisma.RemainingCapacityViewCreateInput & TTransients> = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateRemainingCapacityViewScalarsOrEnums({ seq });
            const resolveValue = normalizeResolver<RemainingCapacityViewFactoryDefineInput, BuildDataOptions<any>>(defaultDataResolver);
            const [transientFields, filteredInputData] = destructure(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = normalizeResolver<Partial<RemainingCapacityViewFactoryDefineInput>, BuildDataOptions<TTransients>>(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                slot: isRemainingCapacityViewslotFactory(defaultData.slot) ? {
                    create: await defaultData.slot.build()
                } : defaultData.slot
            } as Prisma.RemainingCapacityViewCreateInput;
            const data: Prisma.RemainingCapacityViewCreateInput = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.RemainingCapacityViewCreateInput & TTransients>>(...args).map(data => build(data)));
        const pickForConnect = (inputData: RemainingCapacityView) => ({
            slotId: inputData.slotId
        });
        const create = async (inputData: Partial<Prisma.RemainingCapacityViewCreateInput & TTransients> = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = destructure(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient<PrismaClient>().remainingCapacityView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args: unknown[]) => Promise.all(normalizeList<Partial<Prisma.RemainingCapacityViewCreateInput & TTransients>>(...args).map(data => create(data)));
        const createForConnect = (inputData: Partial<Prisma.RemainingCapacityViewCreateInput & TTransients> = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "RemainingCapacityView" as const,
            build,
            buildList,
            buildCreateInput: build,
            pickForConnect,
            create,
            createList,
            createForConnect,
        };
    };
    const factory = getFactoryWithTraits();
    const useTraits = (name: RemainingCapacityViewTraitKeys<TOptions>, ...names: readonly RemainingCapacityViewTraitKeys<TOptions>[]) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}

interface RemainingCapacityViewFactoryBuilder {
    <TOptions extends RemainingCapacityViewFactoryDefineOptions>(options: TOptions): RemainingCapacityViewFactoryInterface<{}, RemainingCapacityViewTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends RemainingCapacityViewTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends RemainingCapacityViewFactoryDefineOptions<TTransients>>(options: TOptions) => RemainingCapacityViewFactoryInterface<TTransients, RemainingCapacityViewTraitKeys<TOptions>>;
}

/**
 * Define factory for {@link RemainingCapacityView} model.
 *
 * @param options
 * @returns factory {@link RemainingCapacityViewFactoryInterface}
 */
export const defineRemainingCapacityViewFactory = (<TOptions extends RemainingCapacityViewFactoryDefineOptions>(options: TOptions): RemainingCapacityViewFactoryInterface<TOptions> => {
    return defineRemainingCapacityViewFactoryInternal(options, {});
}) as RemainingCapacityViewFactoryBuilder;

defineRemainingCapacityViewFactory.withTransientFields = defaultTransientFieldValues => options => defineRemainingCapacityViewFactoryInternal(options, defaultTransientFieldValues);
