import type { User } from "@prisma/client";
import type { Identity } from "@prisma/client";
import type { Community } from "@prisma/client";
import type { Membership } from "@prisma/client";
import type { Wallet } from "@prisma/client";
import type { Opportunity } from "@prisma/client";
import type { Participation } from "@prisma/client";
import type { ParticipationStatusHistory } from "@prisma/client";
import type { Utility } from "@prisma/client";
import type { Transaction } from "@prisma/client";
import type { City } from "@prisma/client";
import type { State } from "@prisma/client";
import type { CurrentPointView } from "@prisma/client";
import type { SysRole } from "@prisma/client";
import type { IdentityPlatform } from "@prisma/client";
import type { Role } from "@prisma/client";
import type { OpportunityCategory } from "@prisma/client";
import type { PublishStatus } from "@prisma/client";
import type { ParticipationStatus } from "@prisma/client";
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
    urlYouTube?: string | null;
    urlTikTok?: string | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    identities?: Prisma.IdentityCreateNestedManyWithoutUserInput;
    memberships?: Prisma.MembershipCreateNestedManyWithoutUserInput;
    participations?: Prisma.ParticipationCreateNestedManyWithoutUserInput;
    opportunitiesCreatedByMe?: Prisma.OpportunityCreateNestedManyWithoutCreatedByUserInput;
    wallets?: Prisma.WalletCreateNestedManyWithoutUserInput;
    participationStatusChangeddByMe?: Prisma.ParticipationStatusHistoryCreateNestedManyWithoutCreatedByUserInput;
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
type CommunitystateFactory = {
    _factoryFor: "State";
    build: () => PromiseLike<Prisma.StateCreateNestedOneWithoutCommunitiesInput["create"]>;
};
type CommunitycityFactory = {
    _factoryFor: "City";
    build: () => PromiseLike<Prisma.CityCreateNestedOneWithoutCommunitiesInput["create"]>;
};
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
    state: CommunitystateFactory | Prisma.StateCreateNestedOneWithoutCommunitiesInput;
    city: CommunitycityFactory | Prisma.CityCreateNestedOneWithoutCommunitiesInput;
    memberships?: Prisma.MembershipCreateNestedManyWithoutCommunityInput;
    ooportunities?: Prisma.OpportunityCreateNestedManyWithoutCommunityInput;
    participations?: Prisma.ParticipationCreateNestedManyWithoutCommunityInput;
    wallets?: Prisma.WalletCreateNestedManyWithoutCommunityInput;
    utility?: Prisma.UtilityCreateNestedManyWithoutCommunityInput;
};
type CommunityTransientFields = Record<string, unknown> & Partial<Record<keyof CommunityFactoryDefineInput, never>>;
type CommunityFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CommunityFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Community, Prisma.CommunityCreateInput, TTransients>;
type CommunityFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<CommunityFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: CommunityFactoryTrait<TTransients>;
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
    <TOptions extends CommunityFactoryDefineOptions>(options: TOptions): CommunityFactoryInterface<{}, CommunityTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CommunityTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CommunityFactoryDefineOptions<TTransients>>(options: TOptions) => CommunityFactoryInterface<TTransients, CommunityTraitKeys<TOptions>>;
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
type WalletFactoryDefineInput = {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date | null;
    community: WalletcommunityFactory | Prisma.CommunityCreateNestedOneWithoutWalletsInput;
    user?: WalletuserFactory | Prisma.UserCreateNestedOneWithoutWalletsInput;
    currentPointView?: WalletcurrentPointViewFactory | Prisma.CurrentPointViewCreateNestedOneWithoutWalletInput;
    fromTransactions?: Prisma.TransactionCreateNestedManyWithoutFromWalletInput;
    toTransactions?: Prisma.TransactionCreateNestedManyWithoutToWalletInput;
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
type OpportunitycommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutOoportunitiesInput["create"]>;
};
type OpportunitycreatedByUserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutOpportunitiesCreatedByMeInput["create"]>;
};
type OpportunitystateFactory = {
    _factoryFor: "State";
    build: () => PromiseLike<Prisma.StateCreateNestedOneWithoutOpportunitiesInput["create"]>;
};
type OpportunitycityFactory = {
    _factoryFor: "City";
    build: () => PromiseLike<Prisma.CityCreateNestedOneWithoutOpportunitiesInput["create"]>;
};
type OpportunityFactoryDefineInput = {
    id?: string;
    title?: string;
    description?: string | null;
    category?: OpportunityCategory;
    publishStatus?: PublishStatus;
    requireApproval?: boolean;
    capacity?: number | null;
    pointsPerParticipation?: number;
    image?: string | null;
    files?: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
    startsAt?: Date | null;
    endsAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    community: OpportunitycommunityFactory | Prisma.CommunityCreateNestedOneWithoutOoportunitiesInput;
    createdByUser: OpportunitycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutOpportunitiesCreatedByMeInput;
    state: OpportunitystateFactory | Prisma.StateCreateNestedOneWithoutOpportunitiesInput;
    city: OpportunitycityFactory | Prisma.CityCreateNestedOneWithoutOpportunitiesInput;
    participations?: Prisma.ParticipationCreateNestedManyWithoutOpportunityInput;
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
type ParticipationFactoryDefineInput = {
    id?: string;
    status?: ParticipationStatus;
    createdAt?: Date;
    updatedAt?: Date | null;
    user?: ParticipationuserFactory | Prisma.UserCreateNestedOneWithoutParticipationsInput;
    community?: ParticipationcommunityFactory | Prisma.CommunityCreateNestedOneWithoutParticipationsInput;
    opportunity?: ParticipationopportunityFactory | Prisma.OpportunityCreateNestedOneWithoutParticipationsInput;
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
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutParticipationStatusChangeddByMeInput["create"]>;
};
type ParticipationStatusHistoryFactoryDefineInput = {
    id?: string;
    status?: ParticipationStatus;
    createdAt?: Date;
    updatedAt?: Date | null;
    participation: ParticipationStatusHistoryparticipationFactory | Prisma.ParticipationCreateNestedOneWithoutStatusHistoriesInput;
    createdByUser?: ParticipationStatusHistorycreatedByUserFactory | Prisma.UserCreateNestedOneWithoutParticipationStatusChangeddByMeInput;
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
type UtilitycommunityFactory = {
    _factoryFor: "Community";
    build: () => PromiseLike<Prisma.CommunityCreateNestedOneWithoutUtilityInput["create"]>;
};
type UtilityFactoryDefineInput = {
    id?: string;
    name?: string;
    description?: string | null;
    image?: string | null;
    pointsRequired?: number;
    createdAt?: Date;
    updatedAt?: Date | null;
    community: UtilitycommunityFactory | Prisma.CommunityCreateNestedOneWithoutUtilityInput;
    transactions?: Prisma.TransactionCreateNestedManyWithoutUtilityInput;
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
type TransactionutilityFactory = {
    _factoryFor: "Utility";
    build: () => PromiseLike<Prisma.UtilityCreateNestedOneWithoutTransactionsInput["create"]>;
};
type TransactionFactoryDefineInput = {
    id?: string;
    fromPointChange?: number;
    toPointChange?: number;
    createdAt?: Date;
    updatedAt?: Date | null;
    fromWallet?: TransactionfromWalletFactory | Prisma.WalletCreateNestedOneWithoutFromTransactionsInput;
    toWallet?: TransactiontoWalletFactory | Prisma.WalletCreateNestedOneWithoutToTransactionsInput;
    participation?: TransactionparticipationFactory | Prisma.ParticipationCreateNestedOneWithoutTransactionsInput;
    utility?: TransactionutilityFactory | Prisma.UtilityCreateNestedOneWithoutTransactionsInput;
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
    communities?: Prisma.CommunityCreateNestedManyWithoutCityInput;
    opportunities?: Prisma.OpportunityCreateNestedManyWithoutCityInput;
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
    countryCode?: string;
    name?: string;
    cities?: Prisma.CityCreateNestedManyWithoutStateInput;
    communities?: Prisma.CommunityCreateNestedManyWithoutStateInput;
    opportunities?: Prisma.OpportunityCreateNestedManyWithoutStateInput;
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
