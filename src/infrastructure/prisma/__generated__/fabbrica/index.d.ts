import type { User } from "@prisma/client";
import type { Identity } from "@prisma/client";
import type { Community } from "@prisma/client";
import type { Membership } from "@prisma/client";
import type { Wallet } from "@prisma/client";
import type { Opportunity } from "@prisma/client";
import type { OpportunitySlot } from "@prisma/client";
import type { OpportunityInvitation } from "@prisma/client";
import type { OpportunityInvitationHistory } from "@prisma/client";
import type { OpportunityRequiredUtility } from "@prisma/client";
import type { Place } from "@prisma/client";
import type { Participation } from "@prisma/client";
import type { ParticipationStatusHistory } from "@prisma/client";
import type { Article } from "@prisma/client";
import type { Utility } from "@prisma/client";
import type { UtilityHistory } from "@prisma/client";
import type { Transaction } from "@prisma/client";
import type { City } from "@prisma/client";
import type { State } from "@prisma/client";
import type { CurrentPointView } from "@prisma/client";
import type { AccumulatedPointView } from "@prisma/client";
import type { SysRole } from "@prisma/client";
import type { IdentityPlatform } from "@prisma/client";
import type { MembershipStatus } from "@prisma/client";
import type { Role } from "@prisma/client";
import type { WalletType } from "@prisma/client";
import type { OpportunityCategory } from "@prisma/client";
import type { PublishStatus } from "@prisma/client";
import type { UtilityStatus } from "@prisma/client";
import type { ParticipationStatus } from "@prisma/client";
import type { ArticleCategory } from "@prisma/client";
import type { UtilityType } from "@prisma/client";
import type { TransactionReason } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type { Resolver } from "@quramy/prisma-fabbrica/lib/internal";
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
export declare const initialize: (options: import("@quramy/prisma-fabbrica/lib/initialize").InitializeOptions) => void;
type UserFactoryDefineInput = {
    id?: string;
    name?: string;
    slug?: string;
    image?: string | null;
    bio?: string | null;
    sysRole?: SysRole;
    urlWebsite?: string | null;
    urlX?: string | null;
    urlFacebook?: string | null;
    urlInstagram?: string | null;
    urlYoutube?: string | null;
    urlTiktok?: string | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    identities?: Prisma.IdentityCreateNestedManyWithoutUserInput;
    memberships?: Prisma.MembershipCreateNestedManyWithoutUserInput;
    participations?: Prisma.ParticipationCreateNestedManyWithoutUserInput;
    opportunitiesCreatedByMe?: Prisma.OpportunityCreateNestedManyWithoutCreatedByUserInput;
    opportunityInvitations?: Prisma.OpportunityInvitationCreateNestedManyWithoutCreatedByUserInput;
    opportunityInvitationHistories?: Prisma.OpportunityInvitationHistoryCreateNestedManyWithoutInivitedUserInput;
    participationStatusChangedByMe?: Prisma.ParticipationStatusHistoryCreateNestedManyWithoutCreatedByUserInput;
    articlesWrittenByMe?: Prisma.ArticleCreateNestedManyWithoutAuthorsInput;
    articlesAboutMe?: Prisma.ArticleCreateNestedManyWithoutRelatedUsersInput;
    wallets?: Prisma.WalletCreateNestedManyWithoutUserInput;
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
export declare const defineUserFactory: UserFactoryBuilder;
type IdentityuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutIdentitiesInput["create"]>;
};
type IdentityFactoryDefineInput = {
    uid?: string;
    platform?: IdentityPlatform;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: IdentityuserFactory | Prisma.UserCreateNestedOneWithoutIdentitiesInput;
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
export declare const defineIdentityFactory: IdentityFactoryBuilder;
type CommunityFactoryDefineInput = {
    id?: string;
    name?: string;
    pointName?: string;
    image?: string | null;
    bio?: string | null;
    establishedAt?: Date | null;
    website?: string | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    memberships?: Prisma.MembershipCreateNestedManyWithoutCommunityInput;
    opportunities?: Prisma.OpportunityCreateNestedManyWithoutCommunityInput;
    participations?: Prisma.ParticipationCreateNestedManyWithoutCommunityInput;
    wallets?: Prisma.WalletCreateNestedManyWithoutCommunityInput;
    utilities?: Prisma.UtilityCreateNestedManyWithoutCommunityInput;
    articles?: Prisma.ArticleCreateNestedManyWithoutCommunityInput;
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
export declare const defineCommunityFactory: CommunityFactoryBuilder;
type MembershipuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutMembershipsInput["create"]>;
};
type MembershipcommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutMembershipsInput["create"]>;
};
type MembershipFactoryDefineInput = {
    status?: MembershipStatus;
    role?: Role;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: MembershipuserFactory | Prisma.UserCreateNestedOneWithoutMembershipsInput;
    community: MembershipcommunityFactory | Prisma.CommunityCreateNestedOneWithoutMembershipsInput;
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
export declare const defineMembershipFactory: MembershipFactoryBuilder;
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
    utilityHistories?: Prisma.UtilityHistoryCreateNestedManyWithoutWalletInput;
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
export declare const defineWalletFactory: WalletFactoryBuilder;
type OpportunityplaceFactory = {
    _factoryFor: "Place";
    build: () => PromiseLike<Prisma.PlaceCreateNestedOneWithoutOpportunitiesInput["create"]>;
};
type OpportunitycommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutOpportunitiesInput["create"]>;
};
type OpportunitycreatedByUserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutOpportunitiesCreatedByMeInput["create"]>;
};
type OpportunityFactoryDefineInput = {
    id?: string;
    title?: string;
    description?: string;
    body?: string | null;
    category?: OpportunityCategory;
    publishStatus?: PublishStatus;
    requireApproval?: boolean;
    capacity?: number | null;
    pointsToEarn?: number | null;
    feeRequired?: number | null;
    image?: string | null;
    files?: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
    startsAt?: Date | null;
    endsAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    place?: OpportunityplaceFactory | Prisma.PlaceCreateNestedOneWithoutOpportunitiesInput;
    community: OpportunitycommunityFactory | Prisma.CommunityCreateNestedOneWithoutOpportunitiesInput;
    createdByUser: OpportunitycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutOpportunitiesCreatedByMeInput;
    articles?: Prisma.ArticleCreateNestedManyWithoutOpportunitiesInput;
    participations?: Prisma.ParticipationCreateNestedManyWithoutOpportunityInput;
    slots?: Prisma.OpportunitySlotCreateNestedManyWithoutOpportunityInput;
    invitations?: Prisma.OpportunityInvitationCreateNestedManyWithoutOpportunityInput;
    requiredUtilities?: Prisma.OpportunityRequiredUtilityCreateNestedManyWithoutOpportunityInput;
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
export declare const defineOpportunityFactory: OpportunityFactoryBuilder;
type OpportunitySlotopportunityFactory = {
    _factoryFor: "Opportunity";
    build: () => PromiseLike<Prisma.OpportunityCreateNestedOneWithoutSlotsInput["create"]>;
};
type OpportunitySlotFactoryDefineInput = {
    id?: string;
    startsAt?: Date;
    endsAt?: Date;
    createdAt?: Date;
    updatedAt?: Date | null;
    opportunity?: OpportunitySlotopportunityFactory | Prisma.OpportunityCreateNestedOneWithoutSlotsInput;
    participations?: Prisma.ParticipationCreateNestedManyWithoutOpportunitySlotInput;
};
type OpportunitySlotTransientFields = Record<string, unknown> & Partial<Record<keyof OpportunitySlotFactoryDefineInput, never>>;
type OpportunitySlotFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<OpportunitySlotFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<OpportunitySlot, Prisma.OpportunitySlotCreateInput, TTransients>;
type OpportunitySlotFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<OpportunitySlotFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: OpportunitySlotFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<OpportunitySlot, Prisma.OpportunitySlotCreateInput, TTransients>;
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
interface OpportunitySlotFactoryBuilder {
    <TOptions extends OpportunitySlotFactoryDefineOptions>(options?: TOptions): OpportunitySlotFactoryInterface<{}, OpportunitySlotTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends OpportunitySlotTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends OpportunitySlotFactoryDefineOptions<TTransients>>(options?: TOptions) => OpportunitySlotFactoryInterface<TTransients, OpportunitySlotTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link OpportunitySlot} model.
 *
 * @param options
 * @returns factory {@link OpportunitySlotFactoryInterface}
 */
export declare const defineOpportunitySlotFactory: OpportunitySlotFactoryBuilder;
type OpportunityInvitationopportunityFactory = {
    _factoryFor: "Opportunity";
    build: () => PromiseLike<Prisma.OpportunityCreateNestedOneWithoutInvitationsInput["create"]>;
};
type OpportunityInvitationcreatedByUserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutOpportunityInvitationsInput["create"]>;
};
type OpportunityInvitationFactoryDefineInput = {
    id?: string;
    code?: string;
    isValid?: boolean;
    createdAt?: Date;
    updatedAt?: Date | null;
    opportunity: OpportunityInvitationopportunityFactory | Prisma.OpportunityCreateNestedOneWithoutInvitationsInput;
    createdByUser: OpportunityInvitationcreatedByUserFactory | Prisma.UserCreateNestedOneWithoutOpportunityInvitationsInput;
    histories?: Prisma.OpportunityInvitationHistoryCreateNestedManyWithoutInvitationInput;
};
type OpportunityInvitationTransientFields = Record<string, unknown> & Partial<Record<keyof OpportunityInvitationFactoryDefineInput, never>>;
type OpportunityInvitationFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<OpportunityInvitationFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<OpportunityInvitation, Prisma.OpportunityInvitationCreateInput, TTransients>;
type OpportunityInvitationFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<OpportunityInvitationFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: OpportunityInvitationFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<OpportunityInvitation, Prisma.OpportunityInvitationCreateInput, TTransients>;
type OpportunityInvitationTraitKeys<TOptions extends OpportunityInvitationFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface OpportunityInvitationFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "OpportunityInvitation";
    build(inputData?: Partial<Prisma.OpportunityInvitationCreateInput & TTransients>): PromiseLike<Prisma.OpportunityInvitationCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.OpportunityInvitationCreateInput & TTransients>): PromiseLike<Prisma.OpportunityInvitationCreateInput>;
    buildList(list: readonly Partial<Prisma.OpportunityInvitationCreateInput & TTransients>[]): PromiseLike<Prisma.OpportunityInvitationCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.OpportunityInvitationCreateInput & TTransients>): PromiseLike<Prisma.OpportunityInvitationCreateInput[]>;
    pickForConnect(inputData: OpportunityInvitation): Pick<OpportunityInvitation, "id">;
    create(inputData?: Partial<Prisma.OpportunityInvitationCreateInput & TTransients>): PromiseLike<OpportunityInvitation>;
    createList(list: readonly Partial<Prisma.OpportunityInvitationCreateInput & TTransients>[]): PromiseLike<OpportunityInvitation[]>;
    createList(count: number, item?: Partial<Prisma.OpportunityInvitationCreateInput & TTransients>): PromiseLike<OpportunityInvitation[]>;
    createForConnect(inputData?: Partial<Prisma.OpportunityInvitationCreateInput & TTransients>): PromiseLike<Pick<OpportunityInvitation, "id">>;
}
export interface OpportunityInvitationFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends OpportunityInvitationFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): OpportunityInvitationFactoryInterfaceWithoutTraits<TTransients>;
}
interface OpportunityInvitationFactoryBuilder {
    <TOptions extends OpportunityInvitationFactoryDefineOptions>(options: TOptions): OpportunityInvitationFactoryInterface<{}, OpportunityInvitationTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends OpportunityInvitationTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends OpportunityInvitationFactoryDefineOptions<TTransients>>(options: TOptions) => OpportunityInvitationFactoryInterface<TTransients, OpportunityInvitationTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link OpportunityInvitation} model.
 *
 * @param options
 * @returns factory {@link OpportunityInvitationFactoryInterface}
 */
export declare const defineOpportunityInvitationFactory: OpportunityInvitationFactoryBuilder;
type OpportunityInvitationHistoryinvitationFactory = {
    _factoryFor: "OpportunityInvitation";
    build: () => PromiseLike<Prisma.OpportunityInvitationCreateNestedOneWithoutHistoriesInput["create"]>;
};
type OpportunityInvitationHistoryinivitedUserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutOpportunityInvitationHistoriesInput["create"]>;
};
type OpportunityInvitationHistoryFactoryDefineInput = {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date | null;
    invitation: OpportunityInvitationHistoryinvitationFactory | Prisma.OpportunityInvitationCreateNestedOneWithoutHistoriesInput;
    inivitedUser: OpportunityInvitationHistoryinivitedUserFactory | Prisma.UserCreateNestedOneWithoutOpportunityInvitationHistoriesInput;
};
type OpportunityInvitationHistoryTransientFields = Record<string, unknown> & Partial<Record<keyof OpportunityInvitationHistoryFactoryDefineInput, never>>;
type OpportunityInvitationHistoryFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<OpportunityInvitationHistoryFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<OpportunityInvitationHistory, Prisma.OpportunityInvitationHistoryCreateInput, TTransients>;
type OpportunityInvitationHistoryFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<OpportunityInvitationHistoryFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: OpportunityInvitationHistoryFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<OpportunityInvitationHistory, Prisma.OpportunityInvitationHistoryCreateInput, TTransients>;
type OpportunityInvitationHistoryTraitKeys<TOptions extends OpportunityInvitationHistoryFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface OpportunityInvitationHistoryFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "OpportunityInvitationHistory";
    build(inputData?: Partial<Prisma.OpportunityInvitationHistoryCreateInput & TTransients>): PromiseLike<Prisma.OpportunityInvitationHistoryCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.OpportunityInvitationHistoryCreateInput & TTransients>): PromiseLike<Prisma.OpportunityInvitationHistoryCreateInput>;
    buildList(list: readonly Partial<Prisma.OpportunityInvitationHistoryCreateInput & TTransients>[]): PromiseLike<Prisma.OpportunityInvitationHistoryCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.OpportunityInvitationHistoryCreateInput & TTransients>): PromiseLike<Prisma.OpportunityInvitationHistoryCreateInput[]>;
    pickForConnect(inputData: OpportunityInvitationHistory): Pick<OpportunityInvitationHistory, "id">;
    create(inputData?: Partial<Prisma.OpportunityInvitationHistoryCreateInput & TTransients>): PromiseLike<OpportunityInvitationHistory>;
    createList(list: readonly Partial<Prisma.OpportunityInvitationHistoryCreateInput & TTransients>[]): PromiseLike<OpportunityInvitationHistory[]>;
    createList(count: number, item?: Partial<Prisma.OpportunityInvitationHistoryCreateInput & TTransients>): PromiseLike<OpportunityInvitationHistory[]>;
    createForConnect(inputData?: Partial<Prisma.OpportunityInvitationHistoryCreateInput & TTransients>): PromiseLike<Pick<OpportunityInvitationHistory, "id">>;
}
export interface OpportunityInvitationHistoryFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends OpportunityInvitationHistoryFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): OpportunityInvitationHistoryFactoryInterfaceWithoutTraits<TTransients>;
}
interface OpportunityInvitationHistoryFactoryBuilder {
    <TOptions extends OpportunityInvitationHistoryFactoryDefineOptions>(options: TOptions): OpportunityInvitationHistoryFactoryInterface<{}, OpportunityInvitationHistoryTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends OpportunityInvitationHistoryTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends OpportunityInvitationHistoryFactoryDefineOptions<TTransients>>(options: TOptions) => OpportunityInvitationHistoryFactoryInterface<TTransients, OpportunityInvitationHistoryTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link OpportunityInvitationHistory} model.
 *
 * @param options
 * @returns factory {@link OpportunityInvitationHistoryFactoryInterface}
 */
export declare const defineOpportunityInvitationHistoryFactory: OpportunityInvitationHistoryFactoryBuilder;
type OpportunityRequiredUtilityopportunityFactory = {
    _factoryFor: "Opportunity";
    build: () => PromiseLike<Prisma.OpportunityCreateNestedOneWithoutRequiredUtilitiesInput["create"]>;
};
type OpportunityRequiredUtilityutilityFactory = {
    _factoryFor: "Utility";
    build: () => PromiseLike<Prisma.UtilityCreateNestedOneWithoutRequiredForOpportunitiesInput["create"]>;
};
type OpportunityRequiredUtilityFactoryDefineInput = {
    status?: UtilityStatus;
    opportunity: OpportunityRequiredUtilityopportunityFactory | Prisma.OpportunityCreateNestedOneWithoutRequiredUtilitiesInput;
    utility: OpportunityRequiredUtilityutilityFactory | Prisma.UtilityCreateNestedOneWithoutRequiredForOpportunitiesInput;
};
type OpportunityRequiredUtilityTransientFields = Record<string, unknown> & Partial<Record<keyof OpportunityRequiredUtilityFactoryDefineInput, never>>;
type OpportunityRequiredUtilityFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<OpportunityRequiredUtilityFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<OpportunityRequiredUtility, Prisma.OpportunityRequiredUtilityCreateInput, TTransients>;
type OpportunityRequiredUtilityFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<OpportunityRequiredUtilityFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: OpportunityRequiredUtilityFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<OpportunityRequiredUtility, Prisma.OpportunityRequiredUtilityCreateInput, TTransients>;
type OpportunityRequiredUtilityTraitKeys<TOptions extends OpportunityRequiredUtilityFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface OpportunityRequiredUtilityFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "OpportunityRequiredUtility";
    build(inputData?: Partial<Prisma.OpportunityRequiredUtilityCreateInput & TTransients>): PromiseLike<Prisma.OpportunityRequiredUtilityCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.OpportunityRequiredUtilityCreateInput & TTransients>): PromiseLike<Prisma.OpportunityRequiredUtilityCreateInput>;
    buildList(list: readonly Partial<Prisma.OpportunityRequiredUtilityCreateInput & TTransients>[]): PromiseLike<Prisma.OpportunityRequiredUtilityCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.OpportunityRequiredUtilityCreateInput & TTransients>): PromiseLike<Prisma.OpportunityRequiredUtilityCreateInput[]>;
    pickForConnect(inputData: OpportunityRequiredUtility): Pick<OpportunityRequiredUtility, "opportunityId" | "utilityId">;
    create(inputData?: Partial<Prisma.OpportunityRequiredUtilityCreateInput & TTransients>): PromiseLike<OpportunityRequiredUtility>;
    createList(list: readonly Partial<Prisma.OpportunityRequiredUtilityCreateInput & TTransients>[]): PromiseLike<OpportunityRequiredUtility[]>;
    createList(count: number, item?: Partial<Prisma.OpportunityRequiredUtilityCreateInput & TTransients>): PromiseLike<OpportunityRequiredUtility[]>;
    createForConnect(inputData?: Partial<Prisma.OpportunityRequiredUtilityCreateInput & TTransients>): PromiseLike<Pick<OpportunityRequiredUtility, "opportunityId" | "utilityId">>;
}
export interface OpportunityRequiredUtilityFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends OpportunityRequiredUtilityFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): OpportunityRequiredUtilityFactoryInterfaceWithoutTraits<TTransients>;
}
interface OpportunityRequiredUtilityFactoryBuilder {
    <TOptions extends OpportunityRequiredUtilityFactoryDefineOptions>(options: TOptions): OpportunityRequiredUtilityFactoryInterface<{}, OpportunityRequiredUtilityTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends OpportunityRequiredUtilityTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends OpportunityRequiredUtilityFactoryDefineOptions<TTransients>>(options: TOptions) => OpportunityRequiredUtilityFactoryInterface<TTransients, OpportunityRequiredUtilityTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link OpportunityRequiredUtility} model.
 *
 * @param options
 * @returns factory {@link OpportunityRequiredUtilityFactoryInterface}
 */
export declare const defineOpportunityRequiredUtilityFactory: OpportunityRequiredUtilityFactoryBuilder;
type PlacecityFactory = {
    _factoryFor: "City";
    build: () => PromiseLike<Prisma.CityCreateNestedOneWithoutPlacesInput["create"]>;
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
    city: PlacecityFactory | Prisma.CityCreateNestedOneWithoutPlacesInput;
    opportunities?: Prisma.OpportunityCreateNestedManyWithoutPlaceInput;
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
export declare const definePlaceFactory: PlaceFactoryBuilder;
type ParticipationuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutParticipationsInput["create"]>;
};
type ParticipationcommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutParticipationsInput["create"]>;
};
type ParticipationopportunityFactory = {
    _factoryFor: "Opportunity";
    build: () => PromiseLike<Prisma.OpportunityCreateNestedOneWithoutParticipationsInput["create"]>;
};
type ParticipationopportunitySlotFactory = {
    _factoryFor: "OpportunitySlot";
    build: () => PromiseLike<Prisma.OpportunitySlotCreateNestedOneWithoutParticipationsInput["create"]>;
};
type ParticipationFactoryDefineInput = {
    id?: string;
    status?: ParticipationStatus;
    images?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
    createdAt?: Date;
    updatedAt?: Date | null;
    user?: ParticipationuserFactory | Prisma.UserCreateNestedOneWithoutParticipationsInput;
    community?: ParticipationcommunityFactory | Prisma.CommunityCreateNestedOneWithoutParticipationsInput;
    opportunity?: ParticipationopportunityFactory | Prisma.OpportunityCreateNestedOneWithoutParticipationsInput;
    opportunitySlot?: ParticipationopportunitySlotFactory | Prisma.OpportunitySlotCreateNestedOneWithoutParticipationsInput;
    statusHistories?: Prisma.ParticipationStatusHistoryCreateNestedManyWithoutParticipationInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutParticipationInput;
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
export declare const defineParticipationFactory: ParticipationFactoryBuilder;
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
    createdAt?: Date;
    updatedAt?: Date | null;
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
export declare const defineParticipationStatusHistoryFactory: ParticipationStatusHistoryFactoryBuilder;
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
    thumbnail?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
    publishedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date | null;
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
export declare const defineArticleFactory: ArticleFactoryBuilder;
type UtilitycommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutUtilitiesInput["create"]>;
};
type UtilityFactoryDefineInput = {
    id?: string;
    name?: string;
    description?: string | null;
    type?: UtilityType;
    image?: string | null;
    pointsRequired?: number;
    createdAt?: Date;
    updatedAt?: Date | null;
    community: UtilitycommunityFactory | Prisma.CommunityCreateNestedOneWithoutUtilitiesInput;
    utilityHistories?: Prisma.UtilityHistoryCreateNestedManyWithoutUtilityInput;
    requiredForOpportunities?: Prisma.OpportunityRequiredUtilityCreateNestedManyWithoutUtilityInput;
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
export declare const defineUtilityFactory: UtilityFactoryBuilder;
type UtilityHistorywalletFactory = {
    _factoryFor: "Wallet";
    build: () => PromiseLike<Prisma.WalletCreateNestedOneWithoutUtilityHistoriesInput["create"]>;
};
type UtilityHistoryutilityFactory = {
    _factoryFor: "Utility";
    build: () => PromiseLike<Prisma.UtilityCreateNestedOneWithoutUtilityHistoriesInput["create"]>;
};
type UtilityHistorytransactionFactory = {
    _factoryFor: "Transaction";
    build: () => PromiseLike<Prisma.TransactionCreateNestedOneWithoutUtilityHistoriesInput["create"]>;
};
type UtilityHistoryFactoryDefineInput = {
    id?: string;
    status?: UtilityStatus;
    createdAt?: Date;
    updatedAt?: Date | null;
    wallet: UtilityHistorywalletFactory | Prisma.WalletCreateNestedOneWithoutUtilityHistoriesInput;
    utility: UtilityHistoryutilityFactory | Prisma.UtilityCreateNestedOneWithoutUtilityHistoriesInput;
    transaction?: UtilityHistorytransactionFactory | Prisma.TransactionCreateNestedOneWithoutUtilityHistoriesInput;
};
type UtilityHistoryTransientFields = Record<string, unknown> & Partial<Record<keyof UtilityHistoryFactoryDefineInput, never>>;
type UtilityHistoryFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<UtilityHistoryFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<UtilityHistory, Prisma.UtilityHistoryCreateInput, TTransients>;
type UtilityHistoryFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<UtilityHistoryFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: UtilityHistoryFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<UtilityHistory, Prisma.UtilityHistoryCreateInput, TTransients>;
type UtilityHistoryTraitKeys<TOptions extends UtilityHistoryFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface UtilityHistoryFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "UtilityHistory";
    build(inputData?: Partial<Prisma.UtilityHistoryCreateInput & TTransients>): PromiseLike<Prisma.UtilityHistoryCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.UtilityHistoryCreateInput & TTransients>): PromiseLike<Prisma.UtilityHistoryCreateInput>;
    buildList(list: readonly Partial<Prisma.UtilityHistoryCreateInput & TTransients>[]): PromiseLike<Prisma.UtilityHistoryCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.UtilityHistoryCreateInput & TTransients>): PromiseLike<Prisma.UtilityHistoryCreateInput[]>;
    pickForConnect(inputData: UtilityHistory): Pick<UtilityHistory, "id">;
    create(inputData?: Partial<Prisma.UtilityHistoryCreateInput & TTransients>): PromiseLike<UtilityHistory>;
    createList(list: readonly Partial<Prisma.UtilityHistoryCreateInput & TTransients>[]): PromiseLike<UtilityHistory[]>;
    createList(count: number, item?: Partial<Prisma.UtilityHistoryCreateInput & TTransients>): PromiseLike<UtilityHistory[]>;
    createForConnect(inputData?: Partial<Prisma.UtilityHistoryCreateInput & TTransients>): PromiseLike<Pick<UtilityHistory, "id">>;
}
export interface UtilityHistoryFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends UtilityHistoryFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): UtilityHistoryFactoryInterfaceWithoutTraits<TTransients>;
}
interface UtilityHistoryFactoryBuilder {
    <TOptions extends UtilityHistoryFactoryDefineOptions>(options: TOptions): UtilityHistoryFactoryInterface<{}, UtilityHistoryTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends UtilityHistoryTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends UtilityHistoryFactoryDefineOptions<TTransients>>(options: TOptions) => UtilityHistoryFactoryInterface<TTransients, UtilityHistoryTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link UtilityHistory} model.
 *
 * @param options
 * @returns factory {@link UtilityHistoryFactoryInterface}
 */
export declare const defineUtilityHistoryFactory: UtilityHistoryFactoryBuilder;
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
    utilityHistories?: Prisma.UtilityHistoryCreateNestedManyWithoutTransactionInput;
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
export declare const defineTransactionFactory: TransactionFactoryBuilder;
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
export declare const defineCityFactory: CityFactoryBuilder;
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
export declare const defineStateFactory: StateFactoryBuilder;
type CurrentPointViewwalletFactory = {
    _factoryFor: "Wallet";
    build: () => PromiseLike<Prisma.WalletCreateNestedOneWithoutCurrentPointViewInput["create"]>;
};
type CurrentPointViewFactoryDefineInput = {
    currentPoint?: number;
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
export declare const defineCurrentPointViewFactory: CurrentPointViewFactoryBuilder;
type AccumulatedPointViewwalletFactory = {
    _factoryFor: "Wallet";
    build: () => PromiseLike<Prisma.WalletCreateNestedOneWithoutAccumulatedPointViewInput["create"]>;
};
type AccumulatedPointViewFactoryDefineInput = {
    accumulatedPoint?: number;
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
export declare const defineAccumulatedPointViewFactory: AccumulatedPointViewFactoryBuilder;
