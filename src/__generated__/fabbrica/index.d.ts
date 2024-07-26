import type { User } from "@prisma/client";
import type { Group } from "@prisma/client";
import type { UsersOnGroups } from "@prisma/client";
import type { Organization } from "@prisma/client";
import type { UsersOnOrganizations } from "@prisma/client";
import type { Activity } from "@prisma/client";
import type { Event } from "@prisma/client";
import type { EventsOnGroups } from "@prisma/client";
import type { EventsOnOrganizations } from "@prisma/client";
import type { Like } from "@prisma/client";
import type { Comment } from "@prisma/client";
import type { Target } from "@prisma/client";
import type { Agenda } from "@prisma/client";
import type { AgendasOnUsers } from "@prisma/client";
import type { AgendasOnGroups } from "@prisma/client";
import type { AgendasOnOrganizations } from "@prisma/client";
import type { AgendasOnEvents } from "@prisma/client";
import type { City } from "@prisma/client";
import type { State } from "@prisma/client";
import type { CitiesOnUsers } from "@prisma/client";
import type { CitiesOnGroups } from "@prisma/client";
import type { CitiesOnOrganizations } from "@prisma/client";
import type { CitiesOnEvents } from "@prisma/client";
import type { Index } from "@prisma/client";
import type { ActivityStatView } from "@prisma/client";
import type { EventStatView } from "@prisma/client";
import type { EntityPosition } from "@prisma/client";
import type { ValueType } from "@prisma/client";
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
    lastName?: string;
    middleName?: string | null;
    firstName?: string;
    email?: string | null;
    image?: string | null;
    bio?: string | null;
    isPublic?: boolean;
    createdAt?: Date;
    updatedAt?: Date | null;
    agendas?: Prisma.AgendasOnUsersCreateNestedManyWithoutUserInput;
    cities?: Prisma.CitiesOnUsersCreateNestedManyWithoutUserInput;
    groups?: Prisma.UsersOnGroupsCreateNestedManyWithoutUserInput;
    organizations?: Prisma.UsersOnOrganizationsCreateNestedManyWithoutUserInput;
    activities?: Prisma.ActivityCreateNestedManyWithoutUserInput;
    likes?: Prisma.LikeCreateNestedManyWithoutUserInput;
    comments?: Prisma.CommentCreateNestedManyWithoutUserInput;
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
type GroupparentFactory = {
    _factoryFor: "Group";
    build: () => PromiseLike<Prisma.GroupCreateNestedOneWithoutChildrenInput["create"]>;
};
type GrouporganizationFactory = {
    _factoryFor: "Organization";
    build: () => PromiseLike<Prisma.OrganizationCreateNestedOneWithoutGroupsInput["create"]>;
};
type GroupFactoryDefineInput = {
    id?: string;
    name?: string;
    image?: string | null;
    bio?: string | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    users?: Prisma.UsersOnGroupsCreateNestedManyWithoutGroupInput;
    events?: Prisma.EventsOnGroupsCreateNestedManyWithoutGroupInput;
    agendas?: Prisma.AgendasOnGroupsCreateNestedManyWithoutGroupInput;
    cities?: Prisma.CitiesOnGroupsCreateNestedManyWithoutGroupInput;
    targets?: Prisma.TargetCreateNestedManyWithoutGroupInput;
    parent?: GroupparentFactory | Prisma.GroupCreateNestedOneWithoutChildrenInput;
    children?: Prisma.GroupCreateNestedManyWithoutParentInput;
    organization: GrouporganizationFactory | Prisma.OrganizationCreateNestedOneWithoutGroupsInput;
};
type GroupTransientFields = Record<string, unknown> & Partial<Record<keyof GroupFactoryDefineInput, never>>;
type GroupFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<GroupFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Group, Prisma.GroupCreateInput, TTransients>;
type GroupFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<GroupFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: GroupFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Group, Prisma.GroupCreateInput, TTransients>;
type GroupTraitKeys<TOptions extends GroupFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface GroupFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Group";
    build(inputData?: Partial<Prisma.GroupCreateInput & TTransients>): PromiseLike<Prisma.GroupCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.GroupCreateInput & TTransients>): PromiseLike<Prisma.GroupCreateInput>;
    buildList(list: readonly Partial<Prisma.GroupCreateInput & TTransients>[]): PromiseLike<Prisma.GroupCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.GroupCreateInput & TTransients>): PromiseLike<Prisma.GroupCreateInput[]>;
    pickForConnect(inputData: Group): Pick<Group, "id">;
    create(inputData?: Partial<Prisma.GroupCreateInput & TTransients>): PromiseLike<Group>;
    createList(list: readonly Partial<Prisma.GroupCreateInput & TTransients>[]): PromiseLike<Group[]>;
    createList(count: number, item?: Partial<Prisma.GroupCreateInput & TTransients>): PromiseLike<Group[]>;
    createForConnect(inputData?: Partial<Prisma.GroupCreateInput & TTransients>): PromiseLike<Pick<Group, "id">>;
}
export interface GroupFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends GroupFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): GroupFactoryInterfaceWithoutTraits<TTransients>;
}
interface GroupFactoryBuilder {
    <TOptions extends GroupFactoryDefineOptions>(options: TOptions): GroupFactoryInterface<{}, GroupTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends GroupTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends GroupFactoryDefineOptions<TTransients>>(options: TOptions) => GroupFactoryInterface<TTransients, GroupTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Group} model.
 *
 * @param options
 * @returns factory {@link GroupFactoryInterface}
 */
export declare const defineGroupFactory: GroupFactoryBuilder;
type UsersOnGroupsuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutGroupsInput["create"]>;
};
type UsersOnGroupsgroupFactory = {
    _factoryFor: "Group";
    build: () => PromiseLike<Prisma.GroupCreateNestedOneWithoutUsersInput["create"]>;
};
type UsersOnGroupsFactoryDefineInput = {
    addedAt?: Date | null;
    removedAt?: Date | null;
    isPublic?: boolean;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: UsersOnGroupsuserFactory | Prisma.UserCreateNestedOneWithoutGroupsInput;
    group: UsersOnGroupsgroupFactory | Prisma.GroupCreateNestedOneWithoutUsersInput;
};
type UsersOnGroupsTransientFields = Record<string, unknown> & Partial<Record<keyof UsersOnGroupsFactoryDefineInput, never>>;
type UsersOnGroupsFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<UsersOnGroupsFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<UsersOnGroups, Prisma.UsersOnGroupsCreateInput, TTransients>;
type UsersOnGroupsFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<UsersOnGroupsFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: UsersOnGroupsFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<UsersOnGroups, Prisma.UsersOnGroupsCreateInput, TTransients>;
type UsersOnGroupsTraitKeys<TOptions extends UsersOnGroupsFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface UsersOnGroupsFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "UsersOnGroups";
    build(inputData?: Partial<Prisma.UsersOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.UsersOnGroupsCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.UsersOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.UsersOnGroupsCreateInput>;
    buildList(list: readonly Partial<Prisma.UsersOnGroupsCreateInput & TTransients>[]): PromiseLike<Prisma.UsersOnGroupsCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.UsersOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.UsersOnGroupsCreateInput[]>;
    pickForConnect(inputData: UsersOnGroups): Pick<UsersOnGroups, "userId" | "groupId">;
    create(inputData?: Partial<Prisma.UsersOnGroupsCreateInput & TTransients>): PromiseLike<UsersOnGroups>;
    createList(list: readonly Partial<Prisma.UsersOnGroupsCreateInput & TTransients>[]): PromiseLike<UsersOnGroups[]>;
    createList(count: number, item?: Partial<Prisma.UsersOnGroupsCreateInput & TTransients>): PromiseLike<UsersOnGroups[]>;
    createForConnect(inputData?: Partial<Prisma.UsersOnGroupsCreateInput & TTransients>): PromiseLike<Pick<UsersOnGroups, "userId" | "groupId">>;
}
export interface UsersOnGroupsFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends UsersOnGroupsFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): UsersOnGroupsFactoryInterfaceWithoutTraits<TTransients>;
}
interface UsersOnGroupsFactoryBuilder {
    <TOptions extends UsersOnGroupsFactoryDefineOptions>(options: TOptions): UsersOnGroupsFactoryInterface<{}, UsersOnGroupsTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends UsersOnGroupsTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends UsersOnGroupsFactoryDefineOptions<TTransients>>(options: TOptions) => UsersOnGroupsFactoryInterface<TTransients, UsersOnGroupsTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link UsersOnGroups} model.
 *
 * @param options
 * @returns factory {@link UsersOnGroupsFactoryInterface}
 */
export declare const defineUsersOnGroupsFactory: UsersOnGroupsFactoryBuilder;
type OrganizationstateFactory = {
    _factoryFor: "State";
    build: () => PromiseLike<Prisma.StateCreateNestedOneWithoutOrganizationInput["create"]>;
};
type OrganizationcityFactory = {
    _factoryFor: "City";
    build: () => PromiseLike<Prisma.CityCreateNestedOneWithoutAddressedOrganizationsInput["create"]>;
};
type OrganizationFactoryDefineInput = {
    id?: string;
    name?: string;
    entity?: string | null;
    entityPosition?: EntityPosition | null;
    image?: string | null;
    bio?: string | null;
    establishedAt?: Date | null;
    website?: string | null;
    zipcode?: string;
    address1?: string;
    address2?: string | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    state: OrganizationstateFactory | Prisma.StateCreateNestedOneWithoutOrganizationInput;
    city: OrganizationcityFactory | Prisma.CityCreateNestedOneWithoutAddressedOrganizationsInput;
    groups?: Prisma.GroupCreateNestedManyWithoutOrganizationInput;
    users?: Prisma.UsersOnOrganizationsCreateNestedManyWithoutOrganizationInput;
    events?: Prisma.EventsOnOrganizationsCreateNestedManyWithoutOrganizationInput;
    agendas?: Prisma.AgendasOnOrganizationsCreateNestedManyWithoutOrganizationInput;
    cities?: Prisma.CitiesOnOrganizationsCreateNestedManyWithoutOrganizationInput;
    targets?: Prisma.TargetCreateNestedManyWithoutOrganizationInput;
};
type OrganizationTransientFields = Record<string, unknown> & Partial<Record<keyof OrganizationFactoryDefineInput, never>>;
type OrganizationFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<OrganizationFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Organization, Prisma.OrganizationCreateInput, TTransients>;
type OrganizationFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<OrganizationFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: OrganizationFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Organization, Prisma.OrganizationCreateInput, TTransients>;
type OrganizationTraitKeys<TOptions extends OrganizationFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface OrganizationFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Organization";
    build(inputData?: Partial<Prisma.OrganizationCreateInput & TTransients>): PromiseLike<Prisma.OrganizationCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.OrganizationCreateInput & TTransients>): PromiseLike<Prisma.OrganizationCreateInput>;
    buildList(list: readonly Partial<Prisma.OrganizationCreateInput & TTransients>[]): PromiseLike<Prisma.OrganizationCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.OrganizationCreateInput & TTransients>): PromiseLike<Prisma.OrganizationCreateInput[]>;
    pickForConnect(inputData: Organization): Pick<Organization, "id">;
    create(inputData?: Partial<Prisma.OrganizationCreateInput & TTransients>): PromiseLike<Organization>;
    createList(list: readonly Partial<Prisma.OrganizationCreateInput & TTransients>[]): PromiseLike<Organization[]>;
    createList(count: number, item?: Partial<Prisma.OrganizationCreateInput & TTransients>): PromiseLike<Organization[]>;
    createForConnect(inputData?: Partial<Prisma.OrganizationCreateInput & TTransients>): PromiseLike<Pick<Organization, "id">>;
}
export interface OrganizationFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends OrganizationFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): OrganizationFactoryInterfaceWithoutTraits<TTransients>;
}
interface OrganizationFactoryBuilder {
    <TOptions extends OrganizationFactoryDefineOptions>(options: TOptions): OrganizationFactoryInterface<{}, OrganizationTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends OrganizationTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends OrganizationFactoryDefineOptions<TTransients>>(options: TOptions) => OrganizationFactoryInterface<TTransients, OrganizationTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Organization} model.
 *
 * @param options
 * @returns factory {@link OrganizationFactoryInterface}
 */
export declare const defineOrganizationFactory: OrganizationFactoryBuilder;
type UsersOnOrganizationsuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutOrganizationsInput["create"]>;
};
type UsersOnOrganizationsorganizationFactory = {
    _factoryFor: "Organization";
    build: () => PromiseLike<Prisma.OrganizationCreateNestedOneWithoutUsersInput["create"]>;
};
type UsersOnOrganizationsFactoryDefineInput = {
    displayName?: string | null;
    displayImage?: string | null;
    addedAt?: Date | null;
    removedAt?: Date | null;
    isPublic?: boolean;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: UsersOnOrganizationsuserFactory | Prisma.UserCreateNestedOneWithoutOrganizationsInput;
    organization: UsersOnOrganizationsorganizationFactory | Prisma.OrganizationCreateNestedOneWithoutUsersInput;
};
type UsersOnOrganizationsTransientFields = Record<string, unknown> & Partial<Record<keyof UsersOnOrganizationsFactoryDefineInput, never>>;
type UsersOnOrganizationsFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<UsersOnOrganizationsFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<UsersOnOrganizations, Prisma.UsersOnOrganizationsCreateInput, TTransients>;
type UsersOnOrganizationsFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<UsersOnOrganizationsFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: UsersOnOrganizationsFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<UsersOnOrganizations, Prisma.UsersOnOrganizationsCreateInput, TTransients>;
type UsersOnOrganizationsTraitKeys<TOptions extends UsersOnOrganizationsFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface UsersOnOrganizationsFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "UsersOnOrganizations";
    build(inputData?: Partial<Prisma.UsersOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.UsersOnOrganizationsCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.UsersOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.UsersOnOrganizationsCreateInput>;
    buildList(list: readonly Partial<Prisma.UsersOnOrganizationsCreateInput & TTransients>[]): PromiseLike<Prisma.UsersOnOrganizationsCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.UsersOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.UsersOnOrganizationsCreateInput[]>;
    pickForConnect(inputData: UsersOnOrganizations): Pick<UsersOnOrganizations, "userId" | "organizationId">;
    create(inputData?: Partial<Prisma.UsersOnOrganizationsCreateInput & TTransients>): PromiseLike<UsersOnOrganizations>;
    createList(list: readonly Partial<Prisma.UsersOnOrganizationsCreateInput & TTransients>[]): PromiseLike<UsersOnOrganizations[]>;
    createList(count: number, item?: Partial<Prisma.UsersOnOrganizationsCreateInput & TTransients>): PromiseLike<UsersOnOrganizations[]>;
    createForConnect(inputData?: Partial<Prisma.UsersOnOrganizationsCreateInput & TTransients>): PromiseLike<Pick<UsersOnOrganizations, "userId" | "organizationId">>;
}
export interface UsersOnOrganizationsFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends UsersOnOrganizationsFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): UsersOnOrganizationsFactoryInterfaceWithoutTraits<TTransients>;
}
interface UsersOnOrganizationsFactoryBuilder {
    <TOptions extends UsersOnOrganizationsFactoryDefineOptions>(options: TOptions): UsersOnOrganizationsFactoryInterface<{}, UsersOnOrganizationsTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends UsersOnOrganizationsTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends UsersOnOrganizationsFactoryDefineOptions<TTransients>>(options: TOptions) => UsersOnOrganizationsFactoryInterface<TTransients, UsersOnOrganizationsTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link UsersOnOrganizations} model.
 *
 * @param options
 * @returns factory {@link UsersOnOrganizationsFactoryInterface}
 */
export declare const defineUsersOnOrganizationsFactory: UsersOnOrganizationsFactoryBuilder;
type ActivityuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutActivitiesInput["create"]>;
};
type ActivityeventFactory = {
    _factoryFor: "Event";
    build: () => PromiseLike<Prisma.EventCreateNestedOneWithoutActivitiesInput["create"]>;
};
type ActivitystatFactory = {
    _factoryFor: "ActivityStatView";
    build: () => PromiseLike<Prisma.ActivityStatViewCreateNestedOneWithoutActivityInput["create"]>;
};
type ActivityFactoryDefineInput = {
    id?: string;
    description?: string | null;
    remark?: string | null;
    isPublic?: boolean;
    images?: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
    startsAt?: Date;
    endsAt?: Date;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: ActivityuserFactory | Prisma.UserCreateNestedOneWithoutActivitiesInput;
    event: ActivityeventFactory | Prisma.EventCreateNestedOneWithoutActivitiesInput;
    stat?: ActivitystatFactory | Prisma.ActivityStatViewCreateNestedOneWithoutActivityInput;
};
type ActivityTransientFields = Record<string, unknown> & Partial<Record<keyof ActivityFactoryDefineInput, never>>;
type ActivityFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ActivityFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Activity, Prisma.ActivityCreateInput, TTransients>;
type ActivityFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<ActivityFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: ActivityFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Activity, Prisma.ActivityCreateInput, TTransients>;
type ActivityTraitKeys<TOptions extends ActivityFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface ActivityFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Activity";
    build(inputData?: Partial<Prisma.ActivityCreateInput & TTransients>): PromiseLike<Prisma.ActivityCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ActivityCreateInput & TTransients>): PromiseLike<Prisma.ActivityCreateInput>;
    buildList(list: readonly Partial<Prisma.ActivityCreateInput & TTransients>[]): PromiseLike<Prisma.ActivityCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ActivityCreateInput & TTransients>): PromiseLike<Prisma.ActivityCreateInput[]>;
    pickForConnect(inputData: Activity): Pick<Activity, "id">;
    create(inputData?: Partial<Prisma.ActivityCreateInput & TTransients>): PromiseLike<Activity>;
    createList(list: readonly Partial<Prisma.ActivityCreateInput & TTransients>[]): PromiseLike<Activity[]>;
    createList(count: number, item?: Partial<Prisma.ActivityCreateInput & TTransients>): PromiseLike<Activity[]>;
    createForConnect(inputData?: Partial<Prisma.ActivityCreateInput & TTransients>): PromiseLike<Pick<Activity, "id">>;
}
export interface ActivityFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ActivityFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ActivityFactoryInterfaceWithoutTraits<TTransients>;
}
interface ActivityFactoryBuilder {
    <TOptions extends ActivityFactoryDefineOptions>(options: TOptions): ActivityFactoryInterface<{}, ActivityTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ActivityTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ActivityFactoryDefineOptions<TTransients>>(options: TOptions) => ActivityFactoryInterface<TTransients, ActivityTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Activity} model.
 *
 * @param options
 * @returns factory {@link ActivityFactoryInterface}
 */
export declare const defineActivityFactory: ActivityFactoryBuilder;
type EventstatFactory = {
    _factoryFor: "EventStatView";
    build: () => PromiseLike<Prisma.EventStatViewCreateNestedOneWithoutEventInput["create"]>;
};
type EventFactoryDefineInput = {
    id?: string;
    description?: string | null;
    isPublic?: boolean;
    images?: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
    startsAt?: Date;
    endsAt?: Date;
    plannedStartsAt?: Date | null;
    plannedEndsAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    agendas?: Prisma.AgendasOnEventsCreateNestedManyWithoutEventInput;
    groups?: Prisma.EventsOnGroupsCreateNestedManyWithoutEventInput;
    organizations?: Prisma.EventsOnOrganizationsCreateNestedManyWithoutEventInput;
    likes?: Prisma.LikeCreateNestedManyWithoutEventInput;
    comments?: Prisma.CommentCreateNestedManyWithoutEventInput;
    activities?: Prisma.ActivityCreateNestedManyWithoutEventInput;
    cities?: Prisma.CitiesOnEventsCreateNestedManyWithoutEventInput;
    stat?: EventstatFactory | Prisma.EventStatViewCreateNestedOneWithoutEventInput;
};
type EventTransientFields = Record<string, unknown> & Partial<Record<keyof EventFactoryDefineInput, never>>;
type EventFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<EventFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Event, Prisma.EventCreateInput, TTransients>;
type EventFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<EventFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: EventFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Event, Prisma.EventCreateInput, TTransients>;
type EventTraitKeys<TOptions extends EventFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface EventFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Event";
    build(inputData?: Partial<Prisma.EventCreateInput & TTransients>): PromiseLike<Prisma.EventCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.EventCreateInput & TTransients>): PromiseLike<Prisma.EventCreateInput>;
    buildList(list: readonly Partial<Prisma.EventCreateInput & TTransients>[]): PromiseLike<Prisma.EventCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.EventCreateInput & TTransients>): PromiseLike<Prisma.EventCreateInput[]>;
    pickForConnect(inputData: Event): Pick<Event, "id">;
    create(inputData?: Partial<Prisma.EventCreateInput & TTransients>): PromiseLike<Event>;
    createList(list: readonly Partial<Prisma.EventCreateInput & TTransients>[]): PromiseLike<Event[]>;
    createList(count: number, item?: Partial<Prisma.EventCreateInput & TTransients>): PromiseLike<Event[]>;
    createForConnect(inputData?: Partial<Prisma.EventCreateInput & TTransients>): PromiseLike<Pick<Event, "id">>;
}
export interface EventFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends EventFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): EventFactoryInterfaceWithoutTraits<TTransients>;
}
interface EventFactoryBuilder {
    <TOptions extends EventFactoryDefineOptions>(options?: TOptions): EventFactoryInterface<{}, EventTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends EventTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends EventFactoryDefineOptions<TTransients>>(options?: TOptions) => EventFactoryInterface<TTransients, EventTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Event} model.
 *
 * @param options
 * @returns factory {@link EventFactoryInterface}
 */
export declare const defineEventFactory: EventFactoryBuilder;
type EventsOnGroupsgroupFactory = {
    _factoryFor: "Group";
    build: () => PromiseLike<Prisma.GroupCreateNestedOneWithoutEventsInput["create"]>;
};
type EventsOnGroupseventFactory = {
    _factoryFor: "Event";
    build: () => PromiseLike<Prisma.EventCreateNestedOneWithoutGroupsInput["create"]>;
};
type EventsOnGroupsFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    group: EventsOnGroupsgroupFactory | Prisma.GroupCreateNestedOneWithoutEventsInput;
    event: EventsOnGroupseventFactory | Prisma.EventCreateNestedOneWithoutGroupsInput;
};
type EventsOnGroupsTransientFields = Record<string, unknown> & Partial<Record<keyof EventsOnGroupsFactoryDefineInput, never>>;
type EventsOnGroupsFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<EventsOnGroupsFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<EventsOnGroups, Prisma.EventsOnGroupsCreateInput, TTransients>;
type EventsOnGroupsFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<EventsOnGroupsFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: EventsOnGroupsFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<EventsOnGroups, Prisma.EventsOnGroupsCreateInput, TTransients>;
type EventsOnGroupsTraitKeys<TOptions extends EventsOnGroupsFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface EventsOnGroupsFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "EventsOnGroups";
    build(inputData?: Partial<Prisma.EventsOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.EventsOnGroupsCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.EventsOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.EventsOnGroupsCreateInput>;
    buildList(list: readonly Partial<Prisma.EventsOnGroupsCreateInput & TTransients>[]): PromiseLike<Prisma.EventsOnGroupsCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.EventsOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.EventsOnGroupsCreateInput[]>;
    pickForConnect(inputData: EventsOnGroups): Pick<EventsOnGroups, "groupId" | "eventId">;
    create(inputData?: Partial<Prisma.EventsOnGroupsCreateInput & TTransients>): PromiseLike<EventsOnGroups>;
    createList(list: readonly Partial<Prisma.EventsOnGroupsCreateInput & TTransients>[]): PromiseLike<EventsOnGroups[]>;
    createList(count: number, item?: Partial<Prisma.EventsOnGroupsCreateInput & TTransients>): PromiseLike<EventsOnGroups[]>;
    createForConnect(inputData?: Partial<Prisma.EventsOnGroupsCreateInput & TTransients>): PromiseLike<Pick<EventsOnGroups, "groupId" | "eventId">>;
}
export interface EventsOnGroupsFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends EventsOnGroupsFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): EventsOnGroupsFactoryInterfaceWithoutTraits<TTransients>;
}
interface EventsOnGroupsFactoryBuilder {
    <TOptions extends EventsOnGroupsFactoryDefineOptions>(options: TOptions): EventsOnGroupsFactoryInterface<{}, EventsOnGroupsTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends EventsOnGroupsTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends EventsOnGroupsFactoryDefineOptions<TTransients>>(options: TOptions) => EventsOnGroupsFactoryInterface<TTransients, EventsOnGroupsTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link EventsOnGroups} model.
 *
 * @param options
 * @returns factory {@link EventsOnGroupsFactoryInterface}
 */
export declare const defineEventsOnGroupsFactory: EventsOnGroupsFactoryBuilder;
type EventsOnOrganizationsorganizationFactory = {
    _factoryFor: "Organization";
    build: () => PromiseLike<Prisma.OrganizationCreateNestedOneWithoutEventsInput["create"]>;
};
type EventsOnOrganizationseventFactory = {
    _factoryFor: "Event";
    build: () => PromiseLike<Prisma.EventCreateNestedOneWithoutOrganizationsInput["create"]>;
};
type EventsOnOrganizationsFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    organization: EventsOnOrganizationsorganizationFactory | Prisma.OrganizationCreateNestedOneWithoutEventsInput;
    event: EventsOnOrganizationseventFactory | Prisma.EventCreateNestedOneWithoutOrganizationsInput;
};
type EventsOnOrganizationsTransientFields = Record<string, unknown> & Partial<Record<keyof EventsOnOrganizationsFactoryDefineInput, never>>;
type EventsOnOrganizationsFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<EventsOnOrganizationsFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<EventsOnOrganizations, Prisma.EventsOnOrganizationsCreateInput, TTransients>;
type EventsOnOrganizationsFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<EventsOnOrganizationsFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: EventsOnOrganizationsFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<EventsOnOrganizations, Prisma.EventsOnOrganizationsCreateInput, TTransients>;
type EventsOnOrganizationsTraitKeys<TOptions extends EventsOnOrganizationsFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface EventsOnOrganizationsFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "EventsOnOrganizations";
    build(inputData?: Partial<Prisma.EventsOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.EventsOnOrganizationsCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.EventsOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.EventsOnOrganizationsCreateInput>;
    buildList(list: readonly Partial<Prisma.EventsOnOrganizationsCreateInput & TTransients>[]): PromiseLike<Prisma.EventsOnOrganizationsCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.EventsOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.EventsOnOrganizationsCreateInput[]>;
    pickForConnect(inputData: EventsOnOrganizations): Pick<EventsOnOrganizations, "organizationId" | "eventId">;
    create(inputData?: Partial<Prisma.EventsOnOrganizationsCreateInput & TTransients>): PromiseLike<EventsOnOrganizations>;
    createList(list: readonly Partial<Prisma.EventsOnOrganizationsCreateInput & TTransients>[]): PromiseLike<EventsOnOrganizations[]>;
    createList(count: number, item?: Partial<Prisma.EventsOnOrganizationsCreateInput & TTransients>): PromiseLike<EventsOnOrganizations[]>;
    createForConnect(inputData?: Partial<Prisma.EventsOnOrganizationsCreateInput & TTransients>): PromiseLike<Pick<EventsOnOrganizations, "organizationId" | "eventId">>;
}
export interface EventsOnOrganizationsFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends EventsOnOrganizationsFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): EventsOnOrganizationsFactoryInterfaceWithoutTraits<TTransients>;
}
interface EventsOnOrganizationsFactoryBuilder {
    <TOptions extends EventsOnOrganizationsFactoryDefineOptions>(options: TOptions): EventsOnOrganizationsFactoryInterface<{}, EventsOnOrganizationsTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends EventsOnOrganizationsTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends EventsOnOrganizationsFactoryDefineOptions<TTransients>>(options: TOptions) => EventsOnOrganizationsFactoryInterface<TTransients, EventsOnOrganizationsTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link EventsOnOrganizations} model.
 *
 * @param options
 * @returns factory {@link EventsOnOrganizationsFactoryInterface}
 */
export declare const defineEventsOnOrganizationsFactory: EventsOnOrganizationsFactoryBuilder;
type LikeuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutLikesInput["create"]>;
};
type LikeeventFactory = {
    _factoryFor: "Event";
    build: () => PromiseLike<Prisma.EventCreateNestedOneWithoutLikesInput["create"]>;
};
type LikeFactoryDefineInput = {
    postedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: LikeuserFactory | Prisma.UserCreateNestedOneWithoutLikesInput;
    event: LikeeventFactory | Prisma.EventCreateNestedOneWithoutLikesInput;
};
type LikeTransientFields = Record<string, unknown> & Partial<Record<keyof LikeFactoryDefineInput, never>>;
type LikeFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<LikeFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Like, Prisma.LikeCreateInput, TTransients>;
type LikeFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<LikeFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: LikeFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Like, Prisma.LikeCreateInput, TTransients>;
type LikeTraitKeys<TOptions extends LikeFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface LikeFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Like";
    build(inputData?: Partial<Prisma.LikeCreateInput & TTransients>): PromiseLike<Prisma.LikeCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.LikeCreateInput & TTransients>): PromiseLike<Prisma.LikeCreateInput>;
    buildList(list: readonly Partial<Prisma.LikeCreateInput & TTransients>[]): PromiseLike<Prisma.LikeCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.LikeCreateInput & TTransients>): PromiseLike<Prisma.LikeCreateInput[]>;
    pickForConnect(inputData: Like): Pick<Like, "userId" | "eventId">;
    create(inputData?: Partial<Prisma.LikeCreateInput & TTransients>): PromiseLike<Like>;
    createList(list: readonly Partial<Prisma.LikeCreateInput & TTransients>[]): PromiseLike<Like[]>;
    createList(count: number, item?: Partial<Prisma.LikeCreateInput & TTransients>): PromiseLike<Like[]>;
    createForConnect(inputData?: Partial<Prisma.LikeCreateInput & TTransients>): PromiseLike<Pick<Like, "userId" | "eventId">>;
}
export interface LikeFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends LikeFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): LikeFactoryInterfaceWithoutTraits<TTransients>;
}
interface LikeFactoryBuilder {
    <TOptions extends LikeFactoryDefineOptions>(options: TOptions): LikeFactoryInterface<{}, LikeTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends LikeTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends LikeFactoryDefineOptions<TTransients>>(options: TOptions) => LikeFactoryInterface<TTransients, LikeTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Like} model.
 *
 * @param options
 * @returns factory {@link LikeFactoryInterface}
 */
export declare const defineLikeFactory: LikeFactoryBuilder;
type CommentuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutCommentsInput["create"]>;
};
type CommenteventFactory = {
    _factoryFor: "Event";
    build: () => PromiseLike<Prisma.EventCreateNestedOneWithoutCommentsInput["create"]>;
};
type CommentFactoryDefineInput = {
    id?: string;
    content?: string;
    postedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: CommentuserFactory | Prisma.UserCreateNestedOneWithoutCommentsInput;
    event: CommenteventFactory | Prisma.EventCreateNestedOneWithoutCommentsInput;
};
type CommentTransientFields = Record<string, unknown> & Partial<Record<keyof CommentFactoryDefineInput, never>>;
type CommentFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CommentFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Comment, Prisma.CommentCreateInput, TTransients>;
type CommentFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<CommentFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: CommentFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Comment, Prisma.CommentCreateInput, TTransients>;
type CommentTraitKeys<TOptions extends CommentFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface CommentFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Comment";
    build(inputData?: Partial<Prisma.CommentCreateInput & TTransients>): PromiseLike<Prisma.CommentCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.CommentCreateInput & TTransients>): PromiseLike<Prisma.CommentCreateInput>;
    buildList(list: readonly Partial<Prisma.CommentCreateInput & TTransients>[]): PromiseLike<Prisma.CommentCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.CommentCreateInput & TTransients>): PromiseLike<Prisma.CommentCreateInput[]>;
    pickForConnect(inputData: Comment): Pick<Comment, "id">;
    create(inputData?: Partial<Prisma.CommentCreateInput & TTransients>): PromiseLike<Comment>;
    createList(list: readonly Partial<Prisma.CommentCreateInput & TTransients>[]): PromiseLike<Comment[]>;
    createList(count: number, item?: Partial<Prisma.CommentCreateInput & TTransients>): PromiseLike<Comment[]>;
    createForConnect(inputData?: Partial<Prisma.CommentCreateInput & TTransients>): PromiseLike<Pick<Comment, "id">>;
}
export interface CommentFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends CommentFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): CommentFactoryInterfaceWithoutTraits<TTransients>;
}
interface CommentFactoryBuilder {
    <TOptions extends CommentFactoryDefineOptions>(options: TOptions): CommentFactoryInterface<{}, CommentTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CommentTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CommentFactoryDefineOptions<TTransients>>(options: TOptions) => CommentFactoryInterface<TTransients, CommentTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Comment} model.
 *
 * @param options
 * @returns factory {@link CommentFactoryInterface}
 */
export declare const defineCommentFactory: CommentFactoryBuilder;
type TargetorganizationFactory = {
    _factoryFor: "Organization";
    build: () => PromiseLike<Prisma.OrganizationCreateNestedOneWithoutTargetsInput["create"]>;
};
type TargetgroupFactory = {
    _factoryFor: "Group";
    build: () => PromiseLike<Prisma.GroupCreateNestedOneWithoutTargetsInput["create"]>;
};
type TargetindexFactory = {
    _factoryFor: "Index";
    build: () => PromiseLike<Prisma.IndexCreateNestedOneWithoutTargetsInput["create"]>;
};
type TargetFactoryDefineInput = {
    id?: string;
    name?: string;
    value?: number;
    validFrom?: Date;
    validTo?: Date;
    createdAt?: Date;
    updatedAt?: Date | null;
    organization?: TargetorganizationFactory | Prisma.OrganizationCreateNestedOneWithoutTargetsInput;
    group?: TargetgroupFactory | Prisma.GroupCreateNestedOneWithoutTargetsInput;
    index: TargetindexFactory | Prisma.IndexCreateNestedOneWithoutTargetsInput;
};
type TargetTransientFields = Record<string, unknown> & Partial<Record<keyof TargetFactoryDefineInput, never>>;
type TargetFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<TargetFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Target, Prisma.TargetCreateInput, TTransients>;
type TargetFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<TargetFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: TargetFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Target, Prisma.TargetCreateInput, TTransients>;
type TargetTraitKeys<TOptions extends TargetFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface TargetFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Target";
    build(inputData?: Partial<Prisma.TargetCreateInput & TTransients>): PromiseLike<Prisma.TargetCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.TargetCreateInput & TTransients>): PromiseLike<Prisma.TargetCreateInput>;
    buildList(list: readonly Partial<Prisma.TargetCreateInput & TTransients>[]): PromiseLike<Prisma.TargetCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.TargetCreateInput & TTransients>): PromiseLike<Prisma.TargetCreateInput[]>;
    pickForConnect(inputData: Target): Pick<Target, "id">;
    create(inputData?: Partial<Prisma.TargetCreateInput & TTransients>): PromiseLike<Target>;
    createList(list: readonly Partial<Prisma.TargetCreateInput & TTransients>[]): PromiseLike<Target[]>;
    createList(count: number, item?: Partial<Prisma.TargetCreateInput & TTransients>): PromiseLike<Target[]>;
    createForConnect(inputData?: Partial<Prisma.TargetCreateInput & TTransients>): PromiseLike<Pick<Target, "id">>;
}
export interface TargetFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends TargetFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): TargetFactoryInterfaceWithoutTraits<TTransients>;
}
interface TargetFactoryBuilder {
    <TOptions extends TargetFactoryDefineOptions>(options: TOptions): TargetFactoryInterface<{}, TargetTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends TargetTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends TargetFactoryDefineOptions<TTransients>>(options: TOptions) => TargetFactoryInterface<TTransients, TargetTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Target} model.
 *
 * @param options
 * @returns factory {@link TargetFactoryInterface}
 */
export declare const defineTargetFactory: TargetFactoryBuilder;
type AgendaFactoryDefineInput = {
    id?: number;
    code?: string;
    name?: string;
    description?: string | null;
    users?: Prisma.AgendasOnUsersCreateNestedManyWithoutAgendaInput;
    groups?: Prisma.AgendasOnGroupsCreateNestedManyWithoutAgendaInput;
    organizations?: Prisma.AgendasOnOrganizationsCreateNestedManyWithoutAgendaInput;
    events?: Prisma.AgendasOnEventsCreateNestedManyWithoutAgendaInput;
};
type AgendaTransientFields = Record<string, unknown> & Partial<Record<keyof AgendaFactoryDefineInput, never>>;
type AgendaFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<AgendaFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Agenda, Prisma.AgendaCreateInput, TTransients>;
type AgendaFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<AgendaFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: AgendaFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Agenda, Prisma.AgendaCreateInput, TTransients>;
type AgendaTraitKeys<TOptions extends AgendaFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface AgendaFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Agenda";
    build(inputData?: Partial<Prisma.AgendaCreateInput & TTransients>): PromiseLike<Prisma.AgendaCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.AgendaCreateInput & TTransients>): PromiseLike<Prisma.AgendaCreateInput>;
    buildList(list: readonly Partial<Prisma.AgendaCreateInput & TTransients>[]): PromiseLike<Prisma.AgendaCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.AgendaCreateInput & TTransients>): PromiseLike<Prisma.AgendaCreateInput[]>;
    pickForConnect(inputData: Agenda): Pick<Agenda, "id">;
    create(inputData?: Partial<Prisma.AgendaCreateInput & TTransients>): PromiseLike<Agenda>;
    createList(list: readonly Partial<Prisma.AgendaCreateInput & TTransients>[]): PromiseLike<Agenda[]>;
    createList(count: number, item?: Partial<Prisma.AgendaCreateInput & TTransients>): PromiseLike<Agenda[]>;
    createForConnect(inputData?: Partial<Prisma.AgendaCreateInput & TTransients>): PromiseLike<Pick<Agenda, "id">>;
}
export interface AgendaFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends AgendaFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): AgendaFactoryInterfaceWithoutTraits<TTransients>;
}
interface AgendaFactoryBuilder {
    <TOptions extends AgendaFactoryDefineOptions>(options?: TOptions): AgendaFactoryInterface<{}, AgendaTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends AgendaTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends AgendaFactoryDefineOptions<TTransients>>(options?: TOptions) => AgendaFactoryInterface<TTransients, AgendaTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Agenda} model.
 *
 * @param options
 * @returns factory {@link AgendaFactoryInterface}
 */
export declare const defineAgendaFactory: AgendaFactoryBuilder;
type AgendasOnUsersuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutAgendasInput["create"]>;
};
type AgendasOnUsersagendaFactory = {
    _factoryFor: "Agenda";
    build: () => PromiseLike<Prisma.AgendaCreateNestedOneWithoutUsersInput["create"]>;
};
type AgendasOnUsersFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    user: AgendasOnUsersuserFactory | Prisma.UserCreateNestedOneWithoutAgendasInput;
    agenda: AgendasOnUsersagendaFactory | Prisma.AgendaCreateNestedOneWithoutUsersInput;
};
type AgendasOnUsersTransientFields = Record<string, unknown> & Partial<Record<keyof AgendasOnUsersFactoryDefineInput, never>>;
type AgendasOnUsersFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<AgendasOnUsersFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<AgendasOnUsers, Prisma.AgendasOnUsersCreateInput, TTransients>;
type AgendasOnUsersFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<AgendasOnUsersFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: AgendasOnUsersFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<AgendasOnUsers, Prisma.AgendasOnUsersCreateInput, TTransients>;
type AgendasOnUsersTraitKeys<TOptions extends AgendasOnUsersFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface AgendasOnUsersFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "AgendasOnUsers";
    build(inputData?: Partial<Prisma.AgendasOnUsersCreateInput & TTransients>): PromiseLike<Prisma.AgendasOnUsersCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.AgendasOnUsersCreateInput & TTransients>): PromiseLike<Prisma.AgendasOnUsersCreateInput>;
    buildList(list: readonly Partial<Prisma.AgendasOnUsersCreateInput & TTransients>[]): PromiseLike<Prisma.AgendasOnUsersCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.AgendasOnUsersCreateInput & TTransients>): PromiseLike<Prisma.AgendasOnUsersCreateInput[]>;
    pickForConnect(inputData: AgendasOnUsers): Pick<AgendasOnUsers, "userId" | "agendaId">;
    create(inputData?: Partial<Prisma.AgendasOnUsersCreateInput & TTransients>): PromiseLike<AgendasOnUsers>;
    createList(list: readonly Partial<Prisma.AgendasOnUsersCreateInput & TTransients>[]): PromiseLike<AgendasOnUsers[]>;
    createList(count: number, item?: Partial<Prisma.AgendasOnUsersCreateInput & TTransients>): PromiseLike<AgendasOnUsers[]>;
    createForConnect(inputData?: Partial<Prisma.AgendasOnUsersCreateInput & TTransients>): PromiseLike<Pick<AgendasOnUsers, "userId" | "agendaId">>;
}
export interface AgendasOnUsersFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends AgendasOnUsersFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): AgendasOnUsersFactoryInterfaceWithoutTraits<TTransients>;
}
interface AgendasOnUsersFactoryBuilder {
    <TOptions extends AgendasOnUsersFactoryDefineOptions>(options: TOptions): AgendasOnUsersFactoryInterface<{}, AgendasOnUsersTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends AgendasOnUsersTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends AgendasOnUsersFactoryDefineOptions<TTransients>>(options: TOptions) => AgendasOnUsersFactoryInterface<TTransients, AgendasOnUsersTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link AgendasOnUsers} model.
 *
 * @param options
 * @returns factory {@link AgendasOnUsersFactoryInterface}
 */
export declare const defineAgendasOnUsersFactory: AgendasOnUsersFactoryBuilder;
type AgendasOnGroupsgroupFactory = {
    _factoryFor: "Group";
    build: () => PromiseLike<Prisma.GroupCreateNestedOneWithoutAgendasInput["create"]>;
};
type AgendasOnGroupsagendaFactory = {
    _factoryFor: "Agenda";
    build: () => PromiseLike<Prisma.AgendaCreateNestedOneWithoutGroupsInput["create"]>;
};
type AgendasOnGroupsFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    group: AgendasOnGroupsgroupFactory | Prisma.GroupCreateNestedOneWithoutAgendasInput;
    agenda: AgendasOnGroupsagendaFactory | Prisma.AgendaCreateNestedOneWithoutGroupsInput;
};
type AgendasOnGroupsTransientFields = Record<string, unknown> & Partial<Record<keyof AgendasOnGroupsFactoryDefineInput, never>>;
type AgendasOnGroupsFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<AgendasOnGroupsFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<AgendasOnGroups, Prisma.AgendasOnGroupsCreateInput, TTransients>;
type AgendasOnGroupsFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<AgendasOnGroupsFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: AgendasOnGroupsFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<AgendasOnGroups, Prisma.AgendasOnGroupsCreateInput, TTransients>;
type AgendasOnGroupsTraitKeys<TOptions extends AgendasOnGroupsFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface AgendasOnGroupsFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "AgendasOnGroups";
    build(inputData?: Partial<Prisma.AgendasOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.AgendasOnGroupsCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.AgendasOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.AgendasOnGroupsCreateInput>;
    buildList(list: readonly Partial<Prisma.AgendasOnGroupsCreateInput & TTransients>[]): PromiseLike<Prisma.AgendasOnGroupsCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.AgendasOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.AgendasOnGroupsCreateInput[]>;
    pickForConnect(inputData: AgendasOnGroups): Pick<AgendasOnGroups, "groupId" | "agendaId">;
    create(inputData?: Partial<Prisma.AgendasOnGroupsCreateInput & TTransients>): PromiseLike<AgendasOnGroups>;
    createList(list: readonly Partial<Prisma.AgendasOnGroupsCreateInput & TTransients>[]): PromiseLike<AgendasOnGroups[]>;
    createList(count: number, item?: Partial<Prisma.AgendasOnGroupsCreateInput & TTransients>): PromiseLike<AgendasOnGroups[]>;
    createForConnect(inputData?: Partial<Prisma.AgendasOnGroupsCreateInput & TTransients>): PromiseLike<Pick<AgendasOnGroups, "groupId" | "agendaId">>;
}
export interface AgendasOnGroupsFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends AgendasOnGroupsFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): AgendasOnGroupsFactoryInterfaceWithoutTraits<TTransients>;
}
interface AgendasOnGroupsFactoryBuilder {
    <TOptions extends AgendasOnGroupsFactoryDefineOptions>(options: TOptions): AgendasOnGroupsFactoryInterface<{}, AgendasOnGroupsTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends AgendasOnGroupsTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends AgendasOnGroupsFactoryDefineOptions<TTransients>>(options: TOptions) => AgendasOnGroupsFactoryInterface<TTransients, AgendasOnGroupsTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link AgendasOnGroups} model.
 *
 * @param options
 * @returns factory {@link AgendasOnGroupsFactoryInterface}
 */
export declare const defineAgendasOnGroupsFactory: AgendasOnGroupsFactoryBuilder;
type AgendasOnOrganizationsorganizationFactory = {
    _factoryFor: "Organization";
    build: () => PromiseLike<Prisma.OrganizationCreateNestedOneWithoutAgendasInput["create"]>;
};
type AgendasOnOrganizationsagendaFactory = {
    _factoryFor: "Agenda";
    build: () => PromiseLike<Prisma.AgendaCreateNestedOneWithoutOrganizationsInput["create"]>;
};
type AgendasOnOrganizationsFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    organization: AgendasOnOrganizationsorganizationFactory | Prisma.OrganizationCreateNestedOneWithoutAgendasInput;
    agenda: AgendasOnOrganizationsagendaFactory | Prisma.AgendaCreateNestedOneWithoutOrganizationsInput;
};
type AgendasOnOrganizationsTransientFields = Record<string, unknown> & Partial<Record<keyof AgendasOnOrganizationsFactoryDefineInput, never>>;
type AgendasOnOrganizationsFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<AgendasOnOrganizationsFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<AgendasOnOrganizations, Prisma.AgendasOnOrganizationsCreateInput, TTransients>;
type AgendasOnOrganizationsFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<AgendasOnOrganizationsFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: AgendasOnOrganizationsFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<AgendasOnOrganizations, Prisma.AgendasOnOrganizationsCreateInput, TTransients>;
type AgendasOnOrganizationsTraitKeys<TOptions extends AgendasOnOrganizationsFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface AgendasOnOrganizationsFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "AgendasOnOrganizations";
    build(inputData?: Partial<Prisma.AgendasOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.AgendasOnOrganizationsCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.AgendasOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.AgendasOnOrganizationsCreateInput>;
    buildList(list: readonly Partial<Prisma.AgendasOnOrganizationsCreateInput & TTransients>[]): PromiseLike<Prisma.AgendasOnOrganizationsCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.AgendasOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.AgendasOnOrganizationsCreateInput[]>;
    pickForConnect(inputData: AgendasOnOrganizations): Pick<AgendasOnOrganizations, "organizationId" | "agendaId">;
    create(inputData?: Partial<Prisma.AgendasOnOrganizationsCreateInput & TTransients>): PromiseLike<AgendasOnOrganizations>;
    createList(list: readonly Partial<Prisma.AgendasOnOrganizationsCreateInput & TTransients>[]): PromiseLike<AgendasOnOrganizations[]>;
    createList(count: number, item?: Partial<Prisma.AgendasOnOrganizationsCreateInput & TTransients>): PromiseLike<AgendasOnOrganizations[]>;
    createForConnect(inputData?: Partial<Prisma.AgendasOnOrganizationsCreateInput & TTransients>): PromiseLike<Pick<AgendasOnOrganizations, "organizationId" | "agendaId">>;
}
export interface AgendasOnOrganizationsFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends AgendasOnOrganizationsFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): AgendasOnOrganizationsFactoryInterfaceWithoutTraits<TTransients>;
}
interface AgendasOnOrganizationsFactoryBuilder {
    <TOptions extends AgendasOnOrganizationsFactoryDefineOptions>(options: TOptions): AgendasOnOrganizationsFactoryInterface<{}, AgendasOnOrganizationsTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends AgendasOnOrganizationsTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends AgendasOnOrganizationsFactoryDefineOptions<TTransients>>(options: TOptions) => AgendasOnOrganizationsFactoryInterface<TTransients, AgendasOnOrganizationsTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link AgendasOnOrganizations} model.
 *
 * @param options
 * @returns factory {@link AgendasOnOrganizationsFactoryInterface}
 */
export declare const defineAgendasOnOrganizationsFactory: AgendasOnOrganizationsFactoryBuilder;
type AgendasOnEventseventFactory = {
    _factoryFor: "Event";
    build: () => PromiseLike<Prisma.EventCreateNestedOneWithoutAgendasInput["create"]>;
};
type AgendasOnEventsagendaFactory = {
    _factoryFor: "Agenda";
    build: () => PromiseLike<Prisma.AgendaCreateNestedOneWithoutEventsInput["create"]>;
};
type AgendasOnEventsFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    event: AgendasOnEventseventFactory | Prisma.EventCreateNestedOneWithoutAgendasInput;
    agenda: AgendasOnEventsagendaFactory | Prisma.AgendaCreateNestedOneWithoutEventsInput;
};
type AgendasOnEventsTransientFields = Record<string, unknown> & Partial<Record<keyof AgendasOnEventsFactoryDefineInput, never>>;
type AgendasOnEventsFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<AgendasOnEventsFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<AgendasOnEvents, Prisma.AgendasOnEventsCreateInput, TTransients>;
type AgendasOnEventsFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<AgendasOnEventsFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: AgendasOnEventsFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<AgendasOnEvents, Prisma.AgendasOnEventsCreateInput, TTransients>;
type AgendasOnEventsTraitKeys<TOptions extends AgendasOnEventsFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface AgendasOnEventsFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "AgendasOnEvents";
    build(inputData?: Partial<Prisma.AgendasOnEventsCreateInput & TTransients>): PromiseLike<Prisma.AgendasOnEventsCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.AgendasOnEventsCreateInput & TTransients>): PromiseLike<Prisma.AgendasOnEventsCreateInput>;
    buildList(list: readonly Partial<Prisma.AgendasOnEventsCreateInput & TTransients>[]): PromiseLike<Prisma.AgendasOnEventsCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.AgendasOnEventsCreateInput & TTransients>): PromiseLike<Prisma.AgendasOnEventsCreateInput[]>;
    pickForConnect(inputData: AgendasOnEvents): Pick<AgendasOnEvents, "eventId" | "agendaId">;
    create(inputData?: Partial<Prisma.AgendasOnEventsCreateInput & TTransients>): PromiseLike<AgendasOnEvents>;
    createList(list: readonly Partial<Prisma.AgendasOnEventsCreateInput & TTransients>[]): PromiseLike<AgendasOnEvents[]>;
    createList(count: number, item?: Partial<Prisma.AgendasOnEventsCreateInput & TTransients>): PromiseLike<AgendasOnEvents[]>;
    createForConnect(inputData?: Partial<Prisma.AgendasOnEventsCreateInput & TTransients>): PromiseLike<Pick<AgendasOnEvents, "eventId" | "agendaId">>;
}
export interface AgendasOnEventsFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends AgendasOnEventsFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): AgendasOnEventsFactoryInterfaceWithoutTraits<TTransients>;
}
interface AgendasOnEventsFactoryBuilder {
    <TOptions extends AgendasOnEventsFactoryDefineOptions>(options: TOptions): AgendasOnEventsFactoryInterface<{}, AgendasOnEventsTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends AgendasOnEventsTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends AgendasOnEventsFactoryDefineOptions<TTransients>>(options: TOptions) => AgendasOnEventsFactoryInterface<TTransients, AgendasOnEventsTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link AgendasOnEvents} model.
 *
 * @param options
 * @returns factory {@link AgendasOnEventsFactoryInterface}
 */
export declare const defineAgendasOnEventsFactory: AgendasOnEventsFactoryBuilder;
type CitystateFactory = {
    _factoryFor: "State";
    build: () => PromiseLike<Prisma.StateCreateNestedOneWithoutCitiesInput["create"]>;
};
type CityFactoryDefineInput = {
    code?: string;
    name?: string;
    state: CitystateFactory | Prisma.StateCreateNestedOneWithoutCitiesInput;
    cities?: Prisma.CitiesOnUsersCreateNestedManyWithoutCityInput;
    groups?: Prisma.CitiesOnGroupsCreateNestedManyWithoutCityInput;
    organizations?: Prisma.CitiesOnOrganizationsCreateNestedManyWithoutCityInput;
    addressedOrganizations?: Prisma.OrganizationCreateNestedManyWithoutCityInput;
    citiesOnEvents?: Prisma.CitiesOnEventsCreateNestedManyWithoutCityInput;
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
    organization?: Prisma.OrganizationCreateNestedManyWithoutStateInput;
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
type CitiesOnUsersuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutCitiesInput["create"]>;
};
type CitiesOnUserscityFactory = {
    _factoryFor: "City";
    build: () => PromiseLike<Prisma.CityCreateNestedOneWithoutCitiesInput["create"]>;
};
type CitiesOnUsersFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    user: CitiesOnUsersuserFactory | Prisma.UserCreateNestedOneWithoutCitiesInput;
    city: CitiesOnUserscityFactory | Prisma.CityCreateNestedOneWithoutCitiesInput;
};
type CitiesOnUsersTransientFields = Record<string, unknown> & Partial<Record<keyof CitiesOnUsersFactoryDefineInput, never>>;
type CitiesOnUsersFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CitiesOnUsersFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<CitiesOnUsers, Prisma.CitiesOnUsersCreateInput, TTransients>;
type CitiesOnUsersFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<CitiesOnUsersFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: CitiesOnUsersFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<CitiesOnUsers, Prisma.CitiesOnUsersCreateInput, TTransients>;
type CitiesOnUsersTraitKeys<TOptions extends CitiesOnUsersFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface CitiesOnUsersFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "CitiesOnUsers";
    build(inputData?: Partial<Prisma.CitiesOnUsersCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnUsersCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.CitiesOnUsersCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnUsersCreateInput>;
    buildList(list: readonly Partial<Prisma.CitiesOnUsersCreateInput & TTransients>[]): PromiseLike<Prisma.CitiesOnUsersCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.CitiesOnUsersCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnUsersCreateInput[]>;
    pickForConnect(inputData: CitiesOnUsers): Pick<CitiesOnUsers, "userId" | "cityCode">;
    create(inputData?: Partial<Prisma.CitiesOnUsersCreateInput & TTransients>): PromiseLike<CitiesOnUsers>;
    createList(list: readonly Partial<Prisma.CitiesOnUsersCreateInput & TTransients>[]): PromiseLike<CitiesOnUsers[]>;
    createList(count: number, item?: Partial<Prisma.CitiesOnUsersCreateInput & TTransients>): PromiseLike<CitiesOnUsers[]>;
    createForConnect(inputData?: Partial<Prisma.CitiesOnUsersCreateInput & TTransients>): PromiseLike<Pick<CitiesOnUsers, "userId" | "cityCode">>;
}
export interface CitiesOnUsersFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends CitiesOnUsersFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): CitiesOnUsersFactoryInterfaceWithoutTraits<TTransients>;
}
interface CitiesOnUsersFactoryBuilder {
    <TOptions extends CitiesOnUsersFactoryDefineOptions>(options: TOptions): CitiesOnUsersFactoryInterface<{}, CitiesOnUsersTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CitiesOnUsersTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CitiesOnUsersFactoryDefineOptions<TTransients>>(options: TOptions) => CitiesOnUsersFactoryInterface<TTransients, CitiesOnUsersTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link CitiesOnUsers} model.
 *
 * @param options
 * @returns factory {@link CitiesOnUsersFactoryInterface}
 */
export declare const defineCitiesOnUsersFactory: CitiesOnUsersFactoryBuilder;
type CitiesOnGroupsgroupFactory = {
    _factoryFor: "Group";
    build: () => PromiseLike<Prisma.GroupCreateNestedOneWithoutCitiesInput["create"]>;
};
type CitiesOnGroupscityFactory = {
    _factoryFor: "City";
    build: () => PromiseLike<Prisma.CityCreateNestedOneWithoutGroupsInput["create"]>;
};
type CitiesOnGroupsFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    group: CitiesOnGroupsgroupFactory | Prisma.GroupCreateNestedOneWithoutCitiesInput;
    city: CitiesOnGroupscityFactory | Prisma.CityCreateNestedOneWithoutGroupsInput;
};
type CitiesOnGroupsTransientFields = Record<string, unknown> & Partial<Record<keyof CitiesOnGroupsFactoryDefineInput, never>>;
type CitiesOnGroupsFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CitiesOnGroupsFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<CitiesOnGroups, Prisma.CitiesOnGroupsCreateInput, TTransients>;
type CitiesOnGroupsFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<CitiesOnGroupsFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: CitiesOnGroupsFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<CitiesOnGroups, Prisma.CitiesOnGroupsCreateInput, TTransients>;
type CitiesOnGroupsTraitKeys<TOptions extends CitiesOnGroupsFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface CitiesOnGroupsFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "CitiesOnGroups";
    build(inputData?: Partial<Prisma.CitiesOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnGroupsCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.CitiesOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnGroupsCreateInput>;
    buildList(list: readonly Partial<Prisma.CitiesOnGroupsCreateInput & TTransients>[]): PromiseLike<Prisma.CitiesOnGroupsCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.CitiesOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnGroupsCreateInput[]>;
    pickForConnect(inputData: CitiesOnGroups): Pick<CitiesOnGroups, "groupId" | "cityCode">;
    create(inputData?: Partial<Prisma.CitiesOnGroupsCreateInput & TTransients>): PromiseLike<CitiesOnGroups>;
    createList(list: readonly Partial<Prisma.CitiesOnGroupsCreateInput & TTransients>[]): PromiseLike<CitiesOnGroups[]>;
    createList(count: number, item?: Partial<Prisma.CitiesOnGroupsCreateInput & TTransients>): PromiseLike<CitiesOnGroups[]>;
    createForConnect(inputData?: Partial<Prisma.CitiesOnGroupsCreateInput & TTransients>): PromiseLike<Pick<CitiesOnGroups, "groupId" | "cityCode">>;
}
export interface CitiesOnGroupsFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends CitiesOnGroupsFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): CitiesOnGroupsFactoryInterfaceWithoutTraits<TTransients>;
}
interface CitiesOnGroupsFactoryBuilder {
    <TOptions extends CitiesOnGroupsFactoryDefineOptions>(options: TOptions): CitiesOnGroupsFactoryInterface<{}, CitiesOnGroupsTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CitiesOnGroupsTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CitiesOnGroupsFactoryDefineOptions<TTransients>>(options: TOptions) => CitiesOnGroupsFactoryInterface<TTransients, CitiesOnGroupsTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link CitiesOnGroups} model.
 *
 * @param options
 * @returns factory {@link CitiesOnGroupsFactoryInterface}
 */
export declare const defineCitiesOnGroupsFactory: CitiesOnGroupsFactoryBuilder;
type CitiesOnOrganizationsorganizationFactory = {
    _factoryFor: "Organization";
    build: () => PromiseLike<Prisma.OrganizationCreateNestedOneWithoutCitiesInput["create"]>;
};
type CitiesOnOrganizationscityFactory = {
    _factoryFor: "City";
    build: () => PromiseLike<Prisma.CityCreateNestedOneWithoutOrganizationsInput["create"]>;
};
type CitiesOnOrganizationsFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    organization: CitiesOnOrganizationsorganizationFactory | Prisma.OrganizationCreateNestedOneWithoutCitiesInput;
    city: CitiesOnOrganizationscityFactory | Prisma.CityCreateNestedOneWithoutOrganizationsInput;
};
type CitiesOnOrganizationsTransientFields = Record<string, unknown> & Partial<Record<keyof CitiesOnOrganizationsFactoryDefineInput, never>>;
type CitiesOnOrganizationsFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CitiesOnOrganizationsFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<CitiesOnOrganizations, Prisma.CitiesOnOrganizationsCreateInput, TTransients>;
type CitiesOnOrganizationsFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<CitiesOnOrganizationsFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: CitiesOnOrganizationsFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<CitiesOnOrganizations, Prisma.CitiesOnOrganizationsCreateInput, TTransients>;
type CitiesOnOrganizationsTraitKeys<TOptions extends CitiesOnOrganizationsFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface CitiesOnOrganizationsFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "CitiesOnOrganizations";
    build(inputData?: Partial<Prisma.CitiesOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnOrganizationsCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.CitiesOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnOrganizationsCreateInput>;
    buildList(list: readonly Partial<Prisma.CitiesOnOrganizationsCreateInput & TTransients>[]): PromiseLike<Prisma.CitiesOnOrganizationsCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.CitiesOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnOrganizationsCreateInput[]>;
    pickForConnect(inputData: CitiesOnOrganizations): Pick<CitiesOnOrganizations, "organizationId" | "cityCode">;
    create(inputData?: Partial<Prisma.CitiesOnOrganizationsCreateInput & TTransients>): PromiseLike<CitiesOnOrganizations>;
    createList(list: readonly Partial<Prisma.CitiesOnOrganizationsCreateInput & TTransients>[]): PromiseLike<CitiesOnOrganizations[]>;
    createList(count: number, item?: Partial<Prisma.CitiesOnOrganizationsCreateInput & TTransients>): PromiseLike<CitiesOnOrganizations[]>;
    createForConnect(inputData?: Partial<Prisma.CitiesOnOrganizationsCreateInput & TTransients>): PromiseLike<Pick<CitiesOnOrganizations, "organizationId" | "cityCode">>;
}
export interface CitiesOnOrganizationsFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends CitiesOnOrganizationsFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): CitiesOnOrganizationsFactoryInterfaceWithoutTraits<TTransients>;
}
interface CitiesOnOrganizationsFactoryBuilder {
    <TOptions extends CitiesOnOrganizationsFactoryDefineOptions>(options: TOptions): CitiesOnOrganizationsFactoryInterface<{}, CitiesOnOrganizationsTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CitiesOnOrganizationsTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CitiesOnOrganizationsFactoryDefineOptions<TTransients>>(options: TOptions) => CitiesOnOrganizationsFactoryInterface<TTransients, CitiesOnOrganizationsTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link CitiesOnOrganizations} model.
 *
 * @param options
 * @returns factory {@link CitiesOnOrganizationsFactoryInterface}
 */
export declare const defineCitiesOnOrganizationsFactory: CitiesOnOrganizationsFactoryBuilder;
type CitiesOnEventseventFactory = {
    _factoryFor: "Event";
    build: () => PromiseLike<Prisma.EventCreateNestedOneWithoutCitiesInput["create"]>;
};
type CitiesOnEventscityFactory = {
    _factoryFor: "City";
    build: () => PromiseLike<Prisma.CityCreateNestedOneWithoutCitiesOnEventsInput["create"]>;
};
type CitiesOnEventsFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    event: CitiesOnEventseventFactory | Prisma.EventCreateNestedOneWithoutCitiesInput;
    city: CitiesOnEventscityFactory | Prisma.CityCreateNestedOneWithoutCitiesOnEventsInput;
};
type CitiesOnEventsTransientFields = Record<string, unknown> & Partial<Record<keyof CitiesOnEventsFactoryDefineInput, never>>;
type CitiesOnEventsFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CitiesOnEventsFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<CitiesOnEvents, Prisma.CitiesOnEventsCreateInput, TTransients>;
type CitiesOnEventsFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<CitiesOnEventsFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: CitiesOnEventsFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<CitiesOnEvents, Prisma.CitiesOnEventsCreateInput, TTransients>;
type CitiesOnEventsTraitKeys<TOptions extends CitiesOnEventsFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface CitiesOnEventsFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "CitiesOnEvents";
    build(inputData?: Partial<Prisma.CitiesOnEventsCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnEventsCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.CitiesOnEventsCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnEventsCreateInput>;
    buildList(list: readonly Partial<Prisma.CitiesOnEventsCreateInput & TTransients>[]): PromiseLike<Prisma.CitiesOnEventsCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.CitiesOnEventsCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnEventsCreateInput[]>;
    pickForConnect(inputData: CitiesOnEvents): Pick<CitiesOnEvents, "eventId" | "cityCode">;
    create(inputData?: Partial<Prisma.CitiesOnEventsCreateInput & TTransients>): PromiseLike<CitiesOnEvents>;
    createList(list: readonly Partial<Prisma.CitiesOnEventsCreateInput & TTransients>[]): PromiseLike<CitiesOnEvents[]>;
    createList(count: number, item?: Partial<Prisma.CitiesOnEventsCreateInput & TTransients>): PromiseLike<CitiesOnEvents[]>;
    createForConnect(inputData?: Partial<Prisma.CitiesOnEventsCreateInput & TTransients>): PromiseLike<Pick<CitiesOnEvents, "eventId" | "cityCode">>;
}
export interface CitiesOnEventsFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends CitiesOnEventsFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): CitiesOnEventsFactoryInterfaceWithoutTraits<TTransients>;
}
interface CitiesOnEventsFactoryBuilder {
    <TOptions extends CitiesOnEventsFactoryDefineOptions>(options: TOptions): CitiesOnEventsFactoryInterface<{}, CitiesOnEventsTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CitiesOnEventsTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CitiesOnEventsFactoryDefineOptions<TTransients>>(options: TOptions) => CitiesOnEventsFactoryInterface<TTransients, CitiesOnEventsTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link CitiesOnEvents} model.
 *
 * @param options
 * @returns factory {@link CitiesOnEventsFactoryInterface}
 */
export declare const defineCitiesOnEventsFactory: CitiesOnEventsFactoryBuilder;
type IndexFactoryDefineInput = {
    name?: string;
    valueType?: ValueType;
    description?: string | null;
    targets?: Prisma.TargetCreateNestedManyWithoutIndexInput;
};
type IndexTransientFields = Record<string, unknown> & Partial<Record<keyof IndexFactoryDefineInput, never>>;
type IndexFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<IndexFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Index, Prisma.IndexCreateInput, TTransients>;
type IndexFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<IndexFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: IndexFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Index, Prisma.IndexCreateInput, TTransients>;
type IndexTraitKeys<TOptions extends IndexFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface IndexFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Index";
    build(inputData?: Partial<Prisma.IndexCreateInput & TTransients>): PromiseLike<Prisma.IndexCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.IndexCreateInput & TTransients>): PromiseLike<Prisma.IndexCreateInput>;
    buildList(list: readonly Partial<Prisma.IndexCreateInput & TTransients>[]): PromiseLike<Prisma.IndexCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.IndexCreateInput & TTransients>): PromiseLike<Prisma.IndexCreateInput[]>;
    pickForConnect(inputData: Index): Pick<Index, "id">;
    create(inputData?: Partial<Prisma.IndexCreateInput & TTransients>): PromiseLike<Index>;
    createList(list: readonly Partial<Prisma.IndexCreateInput & TTransients>[]): PromiseLike<Index[]>;
    createList(count: number, item?: Partial<Prisma.IndexCreateInput & TTransients>): PromiseLike<Index[]>;
    createForConnect(inputData?: Partial<Prisma.IndexCreateInput & TTransients>): PromiseLike<Pick<Index, "id">>;
}
export interface IndexFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends IndexFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): IndexFactoryInterfaceWithoutTraits<TTransients>;
}
interface IndexFactoryBuilder {
    <TOptions extends IndexFactoryDefineOptions>(options?: TOptions): IndexFactoryInterface<{}, IndexTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends IndexTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends IndexFactoryDefineOptions<TTransients>>(options?: TOptions) => IndexFactoryInterface<TTransients, IndexTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Index} model.
 *
 * @param options
 * @returns factory {@link IndexFactoryInterface}
 */
export declare const defineIndexFactory: IndexFactoryBuilder;
type ActivityStatViewactivityFactory = {
    _factoryFor: "Activity";
    build: () => PromiseLike<Prisma.ActivityCreateNestedOneWithoutStatInput["create"]>;
};
type ActivityStatViewFactoryDefineInput = {
    isPublic?: boolean;
    startsAt?: Date;
    endsAt?: Date;
    userId?: string;
    eventId?: string;
    totalMinutes?: number;
    activity: ActivityStatViewactivityFactory | Prisma.ActivityCreateNestedOneWithoutStatInput;
};
type ActivityStatViewTransientFields = Record<string, unknown> & Partial<Record<keyof ActivityStatViewFactoryDefineInput, never>>;
type ActivityStatViewFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ActivityStatViewFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<ActivityStatView, Prisma.ActivityStatViewCreateInput, TTransients>;
type ActivityStatViewFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<ActivityStatViewFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: ActivityStatViewFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<ActivityStatView, Prisma.ActivityStatViewCreateInput, TTransients>;
type ActivityStatViewTraitKeys<TOptions extends ActivityStatViewFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface ActivityStatViewFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "ActivityStatView";
    build(inputData?: Partial<Prisma.ActivityStatViewCreateInput & TTransients>): PromiseLike<Prisma.ActivityStatViewCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ActivityStatViewCreateInput & TTransients>): PromiseLike<Prisma.ActivityStatViewCreateInput>;
    buildList(list: readonly Partial<Prisma.ActivityStatViewCreateInput & TTransients>[]): PromiseLike<Prisma.ActivityStatViewCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ActivityStatViewCreateInput & TTransients>): PromiseLike<Prisma.ActivityStatViewCreateInput[]>;
    pickForConnect(inputData: ActivityStatView): Pick<ActivityStatView, "id">;
    create(inputData?: Partial<Prisma.ActivityStatViewCreateInput & TTransients>): PromiseLike<ActivityStatView>;
    createList(list: readonly Partial<Prisma.ActivityStatViewCreateInput & TTransients>[]): PromiseLike<ActivityStatView[]>;
    createList(count: number, item?: Partial<Prisma.ActivityStatViewCreateInput & TTransients>): PromiseLike<ActivityStatView[]>;
    createForConnect(inputData?: Partial<Prisma.ActivityStatViewCreateInput & TTransients>): PromiseLike<Pick<ActivityStatView, "id">>;
}
export interface ActivityStatViewFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ActivityStatViewFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ActivityStatViewFactoryInterfaceWithoutTraits<TTransients>;
}
interface ActivityStatViewFactoryBuilder {
    <TOptions extends ActivityStatViewFactoryDefineOptions>(options: TOptions): ActivityStatViewFactoryInterface<{}, ActivityStatViewTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ActivityStatViewTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ActivityStatViewFactoryDefineOptions<TTransients>>(options: TOptions) => ActivityStatViewFactoryInterface<TTransients, ActivityStatViewTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link ActivityStatView} model.
 *
 * @param options
 * @returns factory {@link ActivityStatViewFactoryInterface}
 */
export declare const defineActivityStatViewFactory: ActivityStatViewFactoryBuilder;
type EventStatVieweventFactory = {
    _factoryFor: "Event";
    build: () => PromiseLike<Prisma.EventCreateNestedOneWithoutStatInput["create"]>;
};
type EventStatViewFactoryDefineInput = {
    isPublic?: boolean;
    startsAt?: Date;
    endsAt?: Date;
    plannedStartsAt?: Date | null;
    plannedEndsAt?: Date | null;
    totalMinutes?: number;
    event: EventStatVieweventFactory | Prisma.EventCreateNestedOneWithoutStatInput;
};
type EventStatViewTransientFields = Record<string, unknown> & Partial<Record<keyof EventStatViewFactoryDefineInput, never>>;
type EventStatViewFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<EventStatViewFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<EventStatView, Prisma.EventStatViewCreateInput, TTransients>;
type EventStatViewFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<EventStatViewFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: EventStatViewFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<EventStatView, Prisma.EventStatViewCreateInput, TTransients>;
type EventStatViewTraitKeys<TOptions extends EventStatViewFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface EventStatViewFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "EventStatView";
    build(inputData?: Partial<Prisma.EventStatViewCreateInput & TTransients>): PromiseLike<Prisma.EventStatViewCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.EventStatViewCreateInput & TTransients>): PromiseLike<Prisma.EventStatViewCreateInput>;
    buildList(list: readonly Partial<Prisma.EventStatViewCreateInput & TTransients>[]): PromiseLike<Prisma.EventStatViewCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.EventStatViewCreateInput & TTransients>): PromiseLike<Prisma.EventStatViewCreateInput[]>;
    pickForConnect(inputData: EventStatView): Pick<EventStatView, "id">;
    create(inputData?: Partial<Prisma.EventStatViewCreateInput & TTransients>): PromiseLike<EventStatView>;
    createList(list: readonly Partial<Prisma.EventStatViewCreateInput & TTransients>[]): PromiseLike<EventStatView[]>;
    createList(count: number, item?: Partial<Prisma.EventStatViewCreateInput & TTransients>): PromiseLike<EventStatView[]>;
    createForConnect(inputData?: Partial<Prisma.EventStatViewCreateInput & TTransients>): PromiseLike<Pick<EventStatView, "id">>;
}
export interface EventStatViewFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends EventStatViewFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): EventStatViewFactoryInterfaceWithoutTraits<TTransients>;
}
interface EventStatViewFactoryBuilder {
    <TOptions extends EventStatViewFactoryDefineOptions>(options: TOptions): EventStatViewFactoryInterface<{}, EventStatViewTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends EventStatViewTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends EventStatViewFactoryDefineOptions<TTransients>>(options: TOptions) => EventStatViewFactoryInterface<TTransients, EventStatViewTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link EventStatView} model.
 *
 * @param options
 * @returns factory {@link EventStatViewFactoryInterface}
 */
export declare const defineEventStatViewFactory: EventStatViewFactoryBuilder;
