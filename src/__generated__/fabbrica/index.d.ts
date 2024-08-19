import type { User } from "@prisma/client";
import type { Group } from "@prisma/client";
import type { UsersOnGroups } from "@prisma/client";
import type { Organization } from "@prisma/client";
import type { UsersOnOrganizations } from "@prisma/client";
import type { Activity } from "@prisma/client";
import type { Application } from "@prisma/client";
import type { ApplicationConfirmation } from "@prisma/client";
import type { Event } from "@prisma/client";
import type { EventsOnGroups } from "@prisma/client";
import type { EventsOnOrganizations } from "@prisma/client";
import type { Issue } from "@prisma/client";
import type { IssuesOnGroups } from "@prisma/client";
import type { IssuesOnOrganizations } from "@prisma/client";
import type { Like } from "@prisma/client";
import type { Comment } from "@prisma/client";
import type { Target } from "@prisma/client";
import type { Agenda } from "@prisma/client";
import type { AgendasOnUsers } from "@prisma/client";
import type { AgendasOnGroups } from "@prisma/client";
import type { AgendasOnOrganizations } from "@prisma/client";
import type { AgendasOnEvents } from "@prisma/client";
import type { IssueCategory } from "@prisma/client";
import type { IssueCategoriesOnIssues } from "@prisma/client";
import type { IssueCategoriesOnUsers } from "@prisma/client";
import type { Skillset } from "@prisma/client";
import type { SkillsetsOnUsers } from "@prisma/client";
import type { SkillsetsOnEvents } from "@prisma/client";
import type { SkillsetsOnIssues } from "@prisma/client";
import type { City } from "@prisma/client";
import type { State } from "@prisma/client";
import type { CitiesOnUsers } from "@prisma/client";
import type { CitiesOnGroups } from "@prisma/client";
import type { CitiesOnOrganizations } from "@prisma/client";
import type { CitiesOnEvents } from "@prisma/client";
import type { CitiesOnIssues } from "@prisma/client";
import type { Index } from "@prisma/client";
import type { ActivityStatView } from "@prisma/client";
import type { EventStatView } from "@prisma/client";
import type { IssueStatView } from "@prisma/client";
import type { SysRole } from "@prisma/client";
import type { Role } from "@prisma/client";
import type { EntityPosition } from "@prisma/client";
import type { ActivityStyle } from "@prisma/client";
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
    sysRole?: SysRole;
    isPublic?: boolean;
    createdAt?: Date;
    updatedAt?: Date | null;
    agendas?: Prisma.AgendasOnUsersCreateNestedManyWithoutUserInput;
    skillsets?: Prisma.SkillsetsOnUsersCreateNestedManyWithoutUserInput;
    issueCategories?: Prisma.IssueCategoriesOnUsersCreateNestedManyWithoutUserInput;
    cities?: Prisma.CitiesOnUsersCreateNestedManyWithoutUserInput;
    groups?: Prisma.UsersOnGroupsCreateNestedManyWithoutUserInput;
    organizations?: Prisma.UsersOnOrganizationsCreateNestedManyWithoutUserInput;
    applications?: Prisma.ApplicationCreateNestedManyWithoutUserInput;
    confirmations?: Prisma.ApplicationConfirmationCreateNestedManyWithoutConfirmedByInput;
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
    issues?: Prisma.IssuesOnGroupsCreateNestedManyWithoutGroupInput;
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
    role?: Role | null;
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
    isPublic?: boolean;
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
    issues?: Prisma.IssuesOnOrganizationsCreateNestedManyWithoutOrganizationInput;
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
    role?: Role;
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
type ActivityissueFactory = {
    _factoryFor: "Issue";
    build: () => PromiseLike<Prisma.IssueCreateNestedOneWithoutActivitiesInput["create"]>;
};
type ActivityapplicationFactory = {
    _factoryFor: "Application";
    build: () => PromiseLike<Prisma.ApplicationCreateNestedOneWithoutActivityInput["create"]>;
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
    activityStyle?: ActivityStyle;
    images?: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
    startsAt?: Date;
    endsAt?: Date;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: ActivityuserFactory | Prisma.UserCreateNestedOneWithoutActivitiesInput;
    event?: ActivityeventFactory | Prisma.EventCreateNestedOneWithoutActivitiesInput;
    issue?: ActivityissueFactory | Prisma.IssueCreateNestedOneWithoutActivitiesInput;
    application?: ActivityapplicationFactory | Prisma.ApplicationCreateNestedOneWithoutActivityInput;
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
type ApplicationeventFactory = {
    _factoryFor: "Event";
    build: () => PromiseLike<Prisma.EventCreateNestedOneWithoutApplicationsInput["create"]>;
};
type ApplicationuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutApplicationsInput["create"]>;
};
type ApplicationactivityFactory = {
    _factoryFor: "Activity";
    build: () => PromiseLike<Prisma.ActivityCreateNestedOneWithoutApplicationInput["create"]>;
};
type ApplicationFactoryDefineInput = {
    id?: string;
    comment?: string | null;
    isPublic?: boolean;
    submittedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date | null;
    event?: ApplicationeventFactory | Prisma.EventCreateNestedOneWithoutApplicationsInput;
    user?: ApplicationuserFactory | Prisma.UserCreateNestedOneWithoutApplicationsInput;
    activity?: ApplicationactivityFactory | Prisma.ActivityCreateNestedOneWithoutApplicationInput;
    approvals?: Prisma.ApplicationConfirmationCreateNestedManyWithoutApplicationInput;
};
type ApplicationTransientFields = Record<string, unknown> & Partial<Record<keyof ApplicationFactoryDefineInput, never>>;
type ApplicationFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ApplicationFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Application, Prisma.ApplicationCreateInput, TTransients>;
type ApplicationFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<ApplicationFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: ApplicationFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Application, Prisma.ApplicationCreateInput, TTransients>;
type ApplicationTraitKeys<TOptions extends ApplicationFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface ApplicationFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Application";
    build(inputData?: Partial<Prisma.ApplicationCreateInput & TTransients>): PromiseLike<Prisma.ApplicationCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ApplicationCreateInput & TTransients>): PromiseLike<Prisma.ApplicationCreateInput>;
    buildList(list: readonly Partial<Prisma.ApplicationCreateInput & TTransients>[]): PromiseLike<Prisma.ApplicationCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ApplicationCreateInput & TTransients>): PromiseLike<Prisma.ApplicationCreateInput[]>;
    pickForConnect(inputData: Application): Pick<Application, "id">;
    create(inputData?: Partial<Prisma.ApplicationCreateInput & TTransients>): PromiseLike<Application>;
    createList(list: readonly Partial<Prisma.ApplicationCreateInput & TTransients>[]): PromiseLike<Application[]>;
    createList(count: number, item?: Partial<Prisma.ApplicationCreateInput & TTransients>): PromiseLike<Application[]>;
    createForConnect(inputData?: Partial<Prisma.ApplicationCreateInput & TTransients>): PromiseLike<Pick<Application, "id">>;
}
export interface ApplicationFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ApplicationFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ApplicationFactoryInterfaceWithoutTraits<TTransients>;
}
interface ApplicationFactoryBuilder {
    <TOptions extends ApplicationFactoryDefineOptions>(options?: TOptions): ApplicationFactoryInterface<{}, ApplicationTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ApplicationTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ApplicationFactoryDefineOptions<TTransients>>(options?: TOptions) => ApplicationFactoryInterface<TTransients, ApplicationTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Application} model.
 *
 * @param options
 * @returns factory {@link ApplicationFactoryInterface}
 */
export declare const defineApplicationFactory: ApplicationFactoryBuilder;
type ApplicationConfirmationapplicationFactory = {
    _factoryFor: "Application";
    build: () => PromiseLike<Prisma.ApplicationCreateNestedOneWithoutApprovalsInput["create"]>;
};
type ApplicationConfirmationconfirmedByFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutConfirmationsInput["create"]>;
};
type ApplicationConfirmationFactoryDefineInput = {
    id?: string;
    isApproved?: boolean;
    comment?: string | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    application: ApplicationConfirmationapplicationFactory | Prisma.ApplicationCreateNestedOneWithoutApprovalsInput;
    confirmedBy?: ApplicationConfirmationconfirmedByFactory | Prisma.UserCreateNestedOneWithoutConfirmationsInput;
};
type ApplicationConfirmationTransientFields = Record<string, unknown> & Partial<Record<keyof ApplicationConfirmationFactoryDefineInput, never>>;
type ApplicationConfirmationFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ApplicationConfirmationFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<ApplicationConfirmation, Prisma.ApplicationConfirmationCreateInput, TTransients>;
type ApplicationConfirmationFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<ApplicationConfirmationFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: ApplicationConfirmationFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<ApplicationConfirmation, Prisma.ApplicationConfirmationCreateInput, TTransients>;
type ApplicationConfirmationTraitKeys<TOptions extends ApplicationConfirmationFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface ApplicationConfirmationFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "ApplicationConfirmation";
    build(inputData?: Partial<Prisma.ApplicationConfirmationCreateInput & TTransients>): PromiseLike<Prisma.ApplicationConfirmationCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ApplicationConfirmationCreateInput & TTransients>): PromiseLike<Prisma.ApplicationConfirmationCreateInput>;
    buildList(list: readonly Partial<Prisma.ApplicationConfirmationCreateInput & TTransients>[]): PromiseLike<Prisma.ApplicationConfirmationCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ApplicationConfirmationCreateInput & TTransients>): PromiseLike<Prisma.ApplicationConfirmationCreateInput[]>;
    pickForConnect(inputData: ApplicationConfirmation): Pick<ApplicationConfirmation, "id">;
    create(inputData?: Partial<Prisma.ApplicationConfirmationCreateInput & TTransients>): PromiseLike<ApplicationConfirmation>;
    createList(list: readonly Partial<Prisma.ApplicationConfirmationCreateInput & TTransients>[]): PromiseLike<ApplicationConfirmation[]>;
    createList(count: number, item?: Partial<Prisma.ApplicationConfirmationCreateInput & TTransients>): PromiseLike<ApplicationConfirmation[]>;
    createForConnect(inputData?: Partial<Prisma.ApplicationConfirmationCreateInput & TTransients>): PromiseLike<Pick<ApplicationConfirmation, "id">>;
}
export interface ApplicationConfirmationFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ApplicationConfirmationFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ApplicationConfirmationFactoryInterfaceWithoutTraits<TTransients>;
}
interface ApplicationConfirmationFactoryBuilder {
    <TOptions extends ApplicationConfirmationFactoryDefineOptions>(options: TOptions): ApplicationConfirmationFactoryInterface<{}, ApplicationConfirmationTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ApplicationConfirmationTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ApplicationConfirmationFactoryDefineOptions<TTransients>>(options: TOptions) => ApplicationConfirmationFactoryInterface<TTransients, ApplicationConfirmationTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link ApplicationConfirmation} model.
 *
 * @param options
 * @returns factory {@link ApplicationConfirmationFactoryInterface}
 */
export declare const defineApplicationConfirmationFactory: ApplicationConfirmationFactoryBuilder;
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
    skillsets?: Prisma.SkillsetsOnEventsCreateNestedManyWithoutEventInput;
    groups?: Prisma.EventsOnGroupsCreateNestedManyWithoutEventInput;
    organizations?: Prisma.EventsOnOrganizationsCreateNestedManyWithoutEventInput;
    applications?: Prisma.ApplicationCreateNestedManyWithoutEventInput;
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
type IssuestatFactory = {
    _factoryFor: "IssueStatView";
    build: () => PromiseLike<Prisma.IssueStatViewCreateNestedOneWithoutIssueInput["create"]>;
};
type IssueFactoryDefineInput = {
    id?: string;
    description?: string | null;
    isPublic?: boolean;
    images?: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
    createdAt?: Date;
    updatedAt?: Date | null;
    skillsets?: Prisma.SkillsetsOnIssuesCreateNestedManyWithoutIssueInput;
    issueCategories?: Prisma.IssueCategoriesOnIssuesCreateNestedManyWithoutIssueInput;
    groups?: Prisma.IssuesOnGroupsCreateNestedManyWithoutIssueInput;
    organizations?: Prisma.IssuesOnOrganizationsCreateNestedManyWithoutIssueInput;
    likes?: Prisma.LikeCreateNestedManyWithoutIssueInput;
    comments?: Prisma.CommentCreateNestedManyWithoutIssueInput;
    activities?: Prisma.ActivityCreateNestedManyWithoutIssueInput;
    cities?: Prisma.CitiesOnIssuesCreateNestedManyWithoutIssueInput;
    stat?: IssuestatFactory | Prisma.IssueStatViewCreateNestedOneWithoutIssueInput;
};
type IssueTransientFields = Record<string, unknown> & Partial<Record<keyof IssueFactoryDefineInput, never>>;
type IssueFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<IssueFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Issue, Prisma.IssueCreateInput, TTransients>;
type IssueFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<IssueFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: IssueFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Issue, Prisma.IssueCreateInput, TTransients>;
type IssueTraitKeys<TOptions extends IssueFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface IssueFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Issue";
    build(inputData?: Partial<Prisma.IssueCreateInput & TTransients>): PromiseLike<Prisma.IssueCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.IssueCreateInput & TTransients>): PromiseLike<Prisma.IssueCreateInput>;
    buildList(list: readonly Partial<Prisma.IssueCreateInput & TTransients>[]): PromiseLike<Prisma.IssueCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.IssueCreateInput & TTransients>): PromiseLike<Prisma.IssueCreateInput[]>;
    pickForConnect(inputData: Issue): Pick<Issue, "id">;
    create(inputData?: Partial<Prisma.IssueCreateInput & TTransients>): PromiseLike<Issue>;
    createList(list: readonly Partial<Prisma.IssueCreateInput & TTransients>[]): PromiseLike<Issue[]>;
    createList(count: number, item?: Partial<Prisma.IssueCreateInput & TTransients>): PromiseLike<Issue[]>;
    createForConnect(inputData?: Partial<Prisma.IssueCreateInput & TTransients>): PromiseLike<Pick<Issue, "id">>;
}
export interface IssueFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends IssueFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): IssueFactoryInterfaceWithoutTraits<TTransients>;
}
interface IssueFactoryBuilder {
    <TOptions extends IssueFactoryDefineOptions>(options?: TOptions): IssueFactoryInterface<{}, IssueTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends IssueTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends IssueFactoryDefineOptions<TTransients>>(options?: TOptions) => IssueFactoryInterface<TTransients, IssueTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Issue} model.
 *
 * @param options
 * @returns factory {@link IssueFactoryInterface}
 */
export declare const defineIssueFactory: IssueFactoryBuilder;
type IssuesOnGroupsgroupFactory = {
    _factoryFor: "Group";
    build: () => PromiseLike<Prisma.GroupCreateNestedOneWithoutIssuesInput["create"]>;
};
type IssuesOnGroupsissueFactory = {
    _factoryFor: "Issue";
    build: () => PromiseLike<Prisma.IssueCreateNestedOneWithoutGroupsInput["create"]>;
};
type IssuesOnGroupsFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    group: IssuesOnGroupsgroupFactory | Prisma.GroupCreateNestedOneWithoutIssuesInput;
    issue: IssuesOnGroupsissueFactory | Prisma.IssueCreateNestedOneWithoutGroupsInput;
};
type IssuesOnGroupsTransientFields = Record<string, unknown> & Partial<Record<keyof IssuesOnGroupsFactoryDefineInput, never>>;
type IssuesOnGroupsFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<IssuesOnGroupsFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<IssuesOnGroups, Prisma.IssuesOnGroupsCreateInput, TTransients>;
type IssuesOnGroupsFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<IssuesOnGroupsFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: IssuesOnGroupsFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<IssuesOnGroups, Prisma.IssuesOnGroupsCreateInput, TTransients>;
type IssuesOnGroupsTraitKeys<TOptions extends IssuesOnGroupsFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface IssuesOnGroupsFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "IssuesOnGroups";
    build(inputData?: Partial<Prisma.IssuesOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.IssuesOnGroupsCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.IssuesOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.IssuesOnGroupsCreateInput>;
    buildList(list: readonly Partial<Prisma.IssuesOnGroupsCreateInput & TTransients>[]): PromiseLike<Prisma.IssuesOnGroupsCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.IssuesOnGroupsCreateInput & TTransients>): PromiseLike<Prisma.IssuesOnGroupsCreateInput[]>;
    pickForConnect(inputData: IssuesOnGroups): Pick<IssuesOnGroups, "groupId" | "issueId">;
    create(inputData?: Partial<Prisma.IssuesOnGroupsCreateInput & TTransients>): PromiseLike<IssuesOnGroups>;
    createList(list: readonly Partial<Prisma.IssuesOnGroupsCreateInput & TTransients>[]): PromiseLike<IssuesOnGroups[]>;
    createList(count: number, item?: Partial<Prisma.IssuesOnGroupsCreateInput & TTransients>): PromiseLike<IssuesOnGroups[]>;
    createForConnect(inputData?: Partial<Prisma.IssuesOnGroupsCreateInput & TTransients>): PromiseLike<Pick<IssuesOnGroups, "groupId" | "issueId">>;
}
export interface IssuesOnGroupsFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends IssuesOnGroupsFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): IssuesOnGroupsFactoryInterfaceWithoutTraits<TTransients>;
}
interface IssuesOnGroupsFactoryBuilder {
    <TOptions extends IssuesOnGroupsFactoryDefineOptions>(options: TOptions): IssuesOnGroupsFactoryInterface<{}, IssuesOnGroupsTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends IssuesOnGroupsTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends IssuesOnGroupsFactoryDefineOptions<TTransients>>(options: TOptions) => IssuesOnGroupsFactoryInterface<TTransients, IssuesOnGroupsTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link IssuesOnGroups} model.
 *
 * @param options
 * @returns factory {@link IssuesOnGroupsFactoryInterface}
 */
export declare const defineIssuesOnGroupsFactory: IssuesOnGroupsFactoryBuilder;
type IssuesOnOrganizationsorganizationFactory = {
    _factoryFor: "Organization";
    build: () => PromiseLike<Prisma.OrganizationCreateNestedOneWithoutIssuesInput["create"]>;
};
type IssuesOnOrganizationsissueFactory = {
    _factoryFor: "Issue";
    build: () => PromiseLike<Prisma.IssueCreateNestedOneWithoutOrganizationsInput["create"]>;
};
type IssuesOnOrganizationsFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    organization: IssuesOnOrganizationsorganizationFactory | Prisma.OrganizationCreateNestedOneWithoutIssuesInput;
    issue: IssuesOnOrganizationsissueFactory | Prisma.IssueCreateNestedOneWithoutOrganizationsInput;
};
type IssuesOnOrganizationsTransientFields = Record<string, unknown> & Partial<Record<keyof IssuesOnOrganizationsFactoryDefineInput, never>>;
type IssuesOnOrganizationsFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<IssuesOnOrganizationsFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<IssuesOnOrganizations, Prisma.IssuesOnOrganizationsCreateInput, TTransients>;
type IssuesOnOrganizationsFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<IssuesOnOrganizationsFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: IssuesOnOrganizationsFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<IssuesOnOrganizations, Prisma.IssuesOnOrganizationsCreateInput, TTransients>;
type IssuesOnOrganizationsTraitKeys<TOptions extends IssuesOnOrganizationsFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface IssuesOnOrganizationsFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "IssuesOnOrganizations";
    build(inputData?: Partial<Prisma.IssuesOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.IssuesOnOrganizationsCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.IssuesOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.IssuesOnOrganizationsCreateInput>;
    buildList(list: readonly Partial<Prisma.IssuesOnOrganizationsCreateInput & TTransients>[]): PromiseLike<Prisma.IssuesOnOrganizationsCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.IssuesOnOrganizationsCreateInput & TTransients>): PromiseLike<Prisma.IssuesOnOrganizationsCreateInput[]>;
    pickForConnect(inputData: IssuesOnOrganizations): Pick<IssuesOnOrganizations, "organizationId" | "issueId">;
    create(inputData?: Partial<Prisma.IssuesOnOrganizationsCreateInput & TTransients>): PromiseLike<IssuesOnOrganizations>;
    createList(list: readonly Partial<Prisma.IssuesOnOrganizationsCreateInput & TTransients>[]): PromiseLike<IssuesOnOrganizations[]>;
    createList(count: number, item?: Partial<Prisma.IssuesOnOrganizationsCreateInput & TTransients>): PromiseLike<IssuesOnOrganizations[]>;
    createForConnect(inputData?: Partial<Prisma.IssuesOnOrganizationsCreateInput & TTransients>): PromiseLike<Pick<IssuesOnOrganizations, "organizationId" | "issueId">>;
}
export interface IssuesOnOrganizationsFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends IssuesOnOrganizationsFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): IssuesOnOrganizationsFactoryInterfaceWithoutTraits<TTransients>;
}
interface IssuesOnOrganizationsFactoryBuilder {
    <TOptions extends IssuesOnOrganizationsFactoryDefineOptions>(options: TOptions): IssuesOnOrganizationsFactoryInterface<{}, IssuesOnOrganizationsTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends IssuesOnOrganizationsTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends IssuesOnOrganizationsFactoryDefineOptions<TTransients>>(options: TOptions) => IssuesOnOrganizationsFactoryInterface<TTransients, IssuesOnOrganizationsTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link IssuesOnOrganizations} model.
 *
 * @param options
 * @returns factory {@link IssuesOnOrganizationsFactoryInterface}
 */
export declare const defineIssuesOnOrganizationsFactory: IssuesOnOrganizationsFactoryBuilder;
type LikeuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutLikesInput["create"]>;
};
type LikeeventFactory = {
    _factoryFor: "Event";
    build: () => PromiseLike<Prisma.EventCreateNestedOneWithoutLikesInput["create"]>;
};
type LikeissueFactory = {
    _factoryFor: "Issue";
    build: () => PromiseLike<Prisma.IssueCreateNestedOneWithoutLikesInput["create"]>;
};
type LikeFactoryDefineInput = {
    id?: string;
    postedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: LikeuserFactory | Prisma.UserCreateNestedOneWithoutLikesInput;
    event?: LikeeventFactory | Prisma.EventCreateNestedOneWithoutLikesInput;
    issue?: LikeissueFactory | Prisma.IssueCreateNestedOneWithoutLikesInput;
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
    pickForConnect(inputData: Like): Pick<Like, "id">;
    create(inputData?: Partial<Prisma.LikeCreateInput & TTransients>): PromiseLike<Like>;
    createList(list: readonly Partial<Prisma.LikeCreateInput & TTransients>[]): PromiseLike<Like[]>;
    createList(count: number, item?: Partial<Prisma.LikeCreateInput & TTransients>): PromiseLike<Like[]>;
    createForConnect(inputData?: Partial<Prisma.LikeCreateInput & TTransients>): PromiseLike<Pick<Like, "id">>;
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
type CommentissueFactory = {
    _factoryFor: "Issue";
    build: () => PromiseLike<Prisma.IssueCreateNestedOneWithoutCommentsInput["create"]>;
};
type CommentFactoryDefineInput = {
    id?: string;
    content?: string;
    postedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date | null;
    user: CommentuserFactory | Prisma.UserCreateNestedOneWithoutCommentsInput;
    event?: CommenteventFactory | Prisma.EventCreateNestedOneWithoutCommentsInput;
    issue?: CommentissueFactory | Prisma.IssueCreateNestedOneWithoutCommentsInput;
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
type IssueCategoryFactoryDefineInput = {
    id?: number;
    code?: string;
    name?: string;
    description?: string | null;
    issues?: Prisma.IssueCategoriesOnIssuesCreateNestedManyWithoutIssueCategoryInput;
    users?: Prisma.IssueCategoriesOnUsersCreateNestedManyWithoutIssueCategoryInput;
};
type IssueCategoryTransientFields = Record<string, unknown> & Partial<Record<keyof IssueCategoryFactoryDefineInput, never>>;
type IssueCategoryFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<IssueCategoryFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<IssueCategory, Prisma.IssueCategoryCreateInput, TTransients>;
type IssueCategoryFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<IssueCategoryFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: IssueCategoryFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<IssueCategory, Prisma.IssueCategoryCreateInput, TTransients>;
type IssueCategoryTraitKeys<TOptions extends IssueCategoryFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface IssueCategoryFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "IssueCategory";
    build(inputData?: Partial<Prisma.IssueCategoryCreateInput & TTransients>): PromiseLike<Prisma.IssueCategoryCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.IssueCategoryCreateInput & TTransients>): PromiseLike<Prisma.IssueCategoryCreateInput>;
    buildList(list: readonly Partial<Prisma.IssueCategoryCreateInput & TTransients>[]): PromiseLike<Prisma.IssueCategoryCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.IssueCategoryCreateInput & TTransients>): PromiseLike<Prisma.IssueCategoryCreateInput[]>;
    pickForConnect(inputData: IssueCategory): Pick<IssueCategory, "id">;
    create(inputData?: Partial<Prisma.IssueCategoryCreateInput & TTransients>): PromiseLike<IssueCategory>;
    createList(list: readonly Partial<Prisma.IssueCategoryCreateInput & TTransients>[]): PromiseLike<IssueCategory[]>;
    createList(count: number, item?: Partial<Prisma.IssueCategoryCreateInput & TTransients>): PromiseLike<IssueCategory[]>;
    createForConnect(inputData?: Partial<Prisma.IssueCategoryCreateInput & TTransients>): PromiseLike<Pick<IssueCategory, "id">>;
}
export interface IssueCategoryFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends IssueCategoryFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): IssueCategoryFactoryInterfaceWithoutTraits<TTransients>;
}
interface IssueCategoryFactoryBuilder {
    <TOptions extends IssueCategoryFactoryDefineOptions>(options?: TOptions): IssueCategoryFactoryInterface<{}, IssueCategoryTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends IssueCategoryTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends IssueCategoryFactoryDefineOptions<TTransients>>(options?: TOptions) => IssueCategoryFactoryInterface<TTransients, IssueCategoryTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link IssueCategory} model.
 *
 * @param options
 * @returns factory {@link IssueCategoryFactoryInterface}
 */
export declare const defineIssueCategoryFactory: IssueCategoryFactoryBuilder;
type IssueCategoriesOnIssuesissueFactory = {
    _factoryFor: "Issue";
    build: () => PromiseLike<Prisma.IssueCreateNestedOneWithoutIssueCategoriesInput["create"]>;
};
type IssueCategoriesOnIssuesissueCategoryFactory = {
    _factoryFor: "IssueCategory";
    build: () => PromiseLike<Prisma.IssueCategoryCreateNestedOneWithoutIssuesInput["create"]>;
};
type IssueCategoriesOnIssuesFactoryDefineInput = {
    issue: IssueCategoriesOnIssuesissueFactory | Prisma.IssueCreateNestedOneWithoutIssueCategoriesInput;
    issueCategory: IssueCategoriesOnIssuesissueCategoryFactory | Prisma.IssueCategoryCreateNestedOneWithoutIssuesInput;
};
type IssueCategoriesOnIssuesTransientFields = Record<string, unknown> & Partial<Record<keyof IssueCategoriesOnIssuesFactoryDefineInput, never>>;
type IssueCategoriesOnIssuesFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<IssueCategoriesOnIssuesFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<IssueCategoriesOnIssues, Prisma.IssueCategoriesOnIssuesCreateInput, TTransients>;
type IssueCategoriesOnIssuesFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<IssueCategoriesOnIssuesFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: IssueCategoriesOnIssuesFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<IssueCategoriesOnIssues, Prisma.IssueCategoriesOnIssuesCreateInput, TTransients>;
type IssueCategoriesOnIssuesTraitKeys<TOptions extends IssueCategoriesOnIssuesFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface IssueCategoriesOnIssuesFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "IssueCategoriesOnIssues";
    build(inputData?: Partial<Prisma.IssueCategoriesOnIssuesCreateInput & TTransients>): PromiseLike<Prisma.IssueCategoriesOnIssuesCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.IssueCategoriesOnIssuesCreateInput & TTransients>): PromiseLike<Prisma.IssueCategoriesOnIssuesCreateInput>;
    buildList(list: readonly Partial<Prisma.IssueCategoriesOnIssuesCreateInput & TTransients>[]): PromiseLike<Prisma.IssueCategoriesOnIssuesCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.IssueCategoriesOnIssuesCreateInput & TTransients>): PromiseLike<Prisma.IssueCategoriesOnIssuesCreateInput[]>;
    pickForConnect(inputData: IssueCategoriesOnIssues): Pick<IssueCategoriesOnIssues, "issueId" | "issueCategoryId">;
    create(inputData?: Partial<Prisma.IssueCategoriesOnIssuesCreateInput & TTransients>): PromiseLike<IssueCategoriesOnIssues>;
    createList(list: readonly Partial<Prisma.IssueCategoriesOnIssuesCreateInput & TTransients>[]): PromiseLike<IssueCategoriesOnIssues[]>;
    createList(count: number, item?: Partial<Prisma.IssueCategoriesOnIssuesCreateInput & TTransients>): PromiseLike<IssueCategoriesOnIssues[]>;
    createForConnect(inputData?: Partial<Prisma.IssueCategoriesOnIssuesCreateInput & TTransients>): PromiseLike<Pick<IssueCategoriesOnIssues, "issueId" | "issueCategoryId">>;
}
export interface IssueCategoriesOnIssuesFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends IssueCategoriesOnIssuesFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): IssueCategoriesOnIssuesFactoryInterfaceWithoutTraits<TTransients>;
}
interface IssueCategoriesOnIssuesFactoryBuilder {
    <TOptions extends IssueCategoriesOnIssuesFactoryDefineOptions>(options: TOptions): IssueCategoriesOnIssuesFactoryInterface<{}, IssueCategoriesOnIssuesTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends IssueCategoriesOnIssuesTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends IssueCategoriesOnIssuesFactoryDefineOptions<TTransients>>(options: TOptions) => IssueCategoriesOnIssuesFactoryInterface<TTransients, IssueCategoriesOnIssuesTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link IssueCategoriesOnIssues} model.
 *
 * @param options
 * @returns factory {@link IssueCategoriesOnIssuesFactoryInterface}
 */
export declare const defineIssueCategoriesOnIssuesFactory: IssueCategoriesOnIssuesFactoryBuilder;
type IssueCategoriesOnUsersuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutIssueCategoriesInput["create"]>;
};
type IssueCategoriesOnUsersissueCategoryFactory = {
    _factoryFor: "IssueCategory";
    build: () => PromiseLike<Prisma.IssueCategoryCreateNestedOneWithoutUsersInput["create"]>;
};
type IssueCategoriesOnUsersFactoryDefineInput = {
    user: IssueCategoriesOnUsersuserFactory | Prisma.UserCreateNestedOneWithoutIssueCategoriesInput;
    issueCategory: IssueCategoriesOnUsersissueCategoryFactory | Prisma.IssueCategoryCreateNestedOneWithoutUsersInput;
};
type IssueCategoriesOnUsersTransientFields = Record<string, unknown> & Partial<Record<keyof IssueCategoriesOnUsersFactoryDefineInput, never>>;
type IssueCategoriesOnUsersFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<IssueCategoriesOnUsersFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<IssueCategoriesOnUsers, Prisma.IssueCategoriesOnUsersCreateInput, TTransients>;
type IssueCategoriesOnUsersFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<IssueCategoriesOnUsersFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: IssueCategoriesOnUsersFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<IssueCategoriesOnUsers, Prisma.IssueCategoriesOnUsersCreateInput, TTransients>;
type IssueCategoriesOnUsersTraitKeys<TOptions extends IssueCategoriesOnUsersFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface IssueCategoriesOnUsersFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "IssueCategoriesOnUsers";
    build(inputData?: Partial<Prisma.IssueCategoriesOnUsersCreateInput & TTransients>): PromiseLike<Prisma.IssueCategoriesOnUsersCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.IssueCategoriesOnUsersCreateInput & TTransients>): PromiseLike<Prisma.IssueCategoriesOnUsersCreateInput>;
    buildList(list: readonly Partial<Prisma.IssueCategoriesOnUsersCreateInput & TTransients>[]): PromiseLike<Prisma.IssueCategoriesOnUsersCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.IssueCategoriesOnUsersCreateInput & TTransients>): PromiseLike<Prisma.IssueCategoriesOnUsersCreateInput[]>;
    pickForConnect(inputData: IssueCategoriesOnUsers): Pick<IssueCategoriesOnUsers, "userId" | "issueCategoryId">;
    create(inputData?: Partial<Prisma.IssueCategoriesOnUsersCreateInput & TTransients>): PromiseLike<IssueCategoriesOnUsers>;
    createList(list: readonly Partial<Prisma.IssueCategoriesOnUsersCreateInput & TTransients>[]): PromiseLike<IssueCategoriesOnUsers[]>;
    createList(count: number, item?: Partial<Prisma.IssueCategoriesOnUsersCreateInput & TTransients>): PromiseLike<IssueCategoriesOnUsers[]>;
    createForConnect(inputData?: Partial<Prisma.IssueCategoriesOnUsersCreateInput & TTransients>): PromiseLike<Pick<IssueCategoriesOnUsers, "userId" | "issueCategoryId">>;
}
export interface IssueCategoriesOnUsersFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends IssueCategoriesOnUsersFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): IssueCategoriesOnUsersFactoryInterfaceWithoutTraits<TTransients>;
}
interface IssueCategoriesOnUsersFactoryBuilder {
    <TOptions extends IssueCategoriesOnUsersFactoryDefineOptions>(options: TOptions): IssueCategoriesOnUsersFactoryInterface<{}, IssueCategoriesOnUsersTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends IssueCategoriesOnUsersTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends IssueCategoriesOnUsersFactoryDefineOptions<TTransients>>(options: TOptions) => IssueCategoriesOnUsersFactoryInterface<TTransients, IssueCategoriesOnUsersTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link IssueCategoriesOnUsers} model.
 *
 * @param options
 * @returns factory {@link IssueCategoriesOnUsersFactoryInterface}
 */
export declare const defineIssueCategoriesOnUsersFactory: IssueCategoriesOnUsersFactoryBuilder;
type SkillsetFactoryDefineInput = {
    id?: number;
    code?: string;
    name?: string;
    description?: string | null;
    users?: Prisma.SkillsetsOnUsersCreateNestedManyWithoutSkillsetInput;
    events?: Prisma.SkillsetsOnEventsCreateNestedManyWithoutSkillsetInput;
    issues?: Prisma.SkillsetsOnIssuesCreateNestedManyWithoutSkillsetInput;
};
type SkillsetTransientFields = Record<string, unknown> & Partial<Record<keyof SkillsetFactoryDefineInput, never>>;
type SkillsetFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<SkillsetFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Skillset, Prisma.SkillsetCreateInput, TTransients>;
type SkillsetFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<SkillsetFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: SkillsetFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Skillset, Prisma.SkillsetCreateInput, TTransients>;
type SkillsetTraitKeys<TOptions extends SkillsetFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface SkillsetFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Skillset";
    build(inputData?: Partial<Prisma.SkillsetCreateInput & TTransients>): PromiseLike<Prisma.SkillsetCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.SkillsetCreateInput & TTransients>): PromiseLike<Prisma.SkillsetCreateInput>;
    buildList(list: readonly Partial<Prisma.SkillsetCreateInput & TTransients>[]): PromiseLike<Prisma.SkillsetCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.SkillsetCreateInput & TTransients>): PromiseLike<Prisma.SkillsetCreateInput[]>;
    pickForConnect(inputData: Skillset): Pick<Skillset, "id">;
    create(inputData?: Partial<Prisma.SkillsetCreateInput & TTransients>): PromiseLike<Skillset>;
    createList(list: readonly Partial<Prisma.SkillsetCreateInput & TTransients>[]): PromiseLike<Skillset[]>;
    createList(count: number, item?: Partial<Prisma.SkillsetCreateInput & TTransients>): PromiseLike<Skillset[]>;
    createForConnect(inputData?: Partial<Prisma.SkillsetCreateInput & TTransients>): PromiseLike<Pick<Skillset, "id">>;
}
export interface SkillsetFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends SkillsetFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): SkillsetFactoryInterfaceWithoutTraits<TTransients>;
}
interface SkillsetFactoryBuilder {
    <TOptions extends SkillsetFactoryDefineOptions>(options?: TOptions): SkillsetFactoryInterface<{}, SkillsetTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends SkillsetTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends SkillsetFactoryDefineOptions<TTransients>>(options?: TOptions) => SkillsetFactoryInterface<TTransients, SkillsetTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Skillset} model.
 *
 * @param options
 * @returns factory {@link SkillsetFactoryInterface}
 */
export declare const defineSkillsetFactory: SkillsetFactoryBuilder;
type SkillsetsOnUsersuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutSkillsetsInput["create"]>;
};
type SkillsetsOnUsersskillsetFactory = {
    _factoryFor: "Skillset";
    build: () => PromiseLike<Prisma.SkillsetCreateNestedOneWithoutUsersInput["create"]>;
};
type SkillsetsOnUsersFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    user: SkillsetsOnUsersuserFactory | Prisma.UserCreateNestedOneWithoutSkillsetsInput;
    skillset: SkillsetsOnUsersskillsetFactory | Prisma.SkillsetCreateNestedOneWithoutUsersInput;
};
type SkillsetsOnUsersTransientFields = Record<string, unknown> & Partial<Record<keyof SkillsetsOnUsersFactoryDefineInput, never>>;
type SkillsetsOnUsersFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<SkillsetsOnUsersFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<SkillsetsOnUsers, Prisma.SkillsetsOnUsersCreateInput, TTransients>;
type SkillsetsOnUsersFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<SkillsetsOnUsersFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: SkillsetsOnUsersFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<SkillsetsOnUsers, Prisma.SkillsetsOnUsersCreateInput, TTransients>;
type SkillsetsOnUsersTraitKeys<TOptions extends SkillsetsOnUsersFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface SkillsetsOnUsersFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "SkillsetsOnUsers";
    build(inputData?: Partial<Prisma.SkillsetsOnUsersCreateInput & TTransients>): PromiseLike<Prisma.SkillsetsOnUsersCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.SkillsetsOnUsersCreateInput & TTransients>): PromiseLike<Prisma.SkillsetsOnUsersCreateInput>;
    buildList(list: readonly Partial<Prisma.SkillsetsOnUsersCreateInput & TTransients>[]): PromiseLike<Prisma.SkillsetsOnUsersCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.SkillsetsOnUsersCreateInput & TTransients>): PromiseLike<Prisma.SkillsetsOnUsersCreateInput[]>;
    pickForConnect(inputData: SkillsetsOnUsers): Pick<SkillsetsOnUsers, "userId" | "skillsetId">;
    create(inputData?: Partial<Prisma.SkillsetsOnUsersCreateInput & TTransients>): PromiseLike<SkillsetsOnUsers>;
    createList(list: readonly Partial<Prisma.SkillsetsOnUsersCreateInput & TTransients>[]): PromiseLike<SkillsetsOnUsers[]>;
    createList(count: number, item?: Partial<Prisma.SkillsetsOnUsersCreateInput & TTransients>): PromiseLike<SkillsetsOnUsers[]>;
    createForConnect(inputData?: Partial<Prisma.SkillsetsOnUsersCreateInput & TTransients>): PromiseLike<Pick<SkillsetsOnUsers, "userId" | "skillsetId">>;
}
export interface SkillsetsOnUsersFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends SkillsetsOnUsersFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): SkillsetsOnUsersFactoryInterfaceWithoutTraits<TTransients>;
}
interface SkillsetsOnUsersFactoryBuilder {
    <TOptions extends SkillsetsOnUsersFactoryDefineOptions>(options: TOptions): SkillsetsOnUsersFactoryInterface<{}, SkillsetsOnUsersTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends SkillsetsOnUsersTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends SkillsetsOnUsersFactoryDefineOptions<TTransients>>(options: TOptions) => SkillsetsOnUsersFactoryInterface<TTransients, SkillsetsOnUsersTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link SkillsetsOnUsers} model.
 *
 * @param options
 * @returns factory {@link SkillsetsOnUsersFactoryInterface}
 */
export declare const defineSkillsetsOnUsersFactory: SkillsetsOnUsersFactoryBuilder;
type SkillsetsOnEventseventFactory = {
    _factoryFor: "Event";
    build: () => PromiseLike<Prisma.EventCreateNestedOneWithoutSkillsetsInput["create"]>;
};
type SkillsetsOnEventsskillsetFactory = {
    _factoryFor: "Skillset";
    build: () => PromiseLike<Prisma.SkillsetCreateNestedOneWithoutEventsInput["create"]>;
};
type SkillsetsOnEventsFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    event: SkillsetsOnEventseventFactory | Prisma.EventCreateNestedOneWithoutSkillsetsInput;
    skillset: SkillsetsOnEventsskillsetFactory | Prisma.SkillsetCreateNestedOneWithoutEventsInput;
};
type SkillsetsOnEventsTransientFields = Record<string, unknown> & Partial<Record<keyof SkillsetsOnEventsFactoryDefineInput, never>>;
type SkillsetsOnEventsFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<SkillsetsOnEventsFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<SkillsetsOnEvents, Prisma.SkillsetsOnEventsCreateInput, TTransients>;
type SkillsetsOnEventsFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<SkillsetsOnEventsFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: SkillsetsOnEventsFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<SkillsetsOnEvents, Prisma.SkillsetsOnEventsCreateInput, TTransients>;
type SkillsetsOnEventsTraitKeys<TOptions extends SkillsetsOnEventsFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface SkillsetsOnEventsFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "SkillsetsOnEvents";
    build(inputData?: Partial<Prisma.SkillsetsOnEventsCreateInput & TTransients>): PromiseLike<Prisma.SkillsetsOnEventsCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.SkillsetsOnEventsCreateInput & TTransients>): PromiseLike<Prisma.SkillsetsOnEventsCreateInput>;
    buildList(list: readonly Partial<Prisma.SkillsetsOnEventsCreateInput & TTransients>[]): PromiseLike<Prisma.SkillsetsOnEventsCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.SkillsetsOnEventsCreateInput & TTransients>): PromiseLike<Prisma.SkillsetsOnEventsCreateInput[]>;
    pickForConnect(inputData: SkillsetsOnEvents): Pick<SkillsetsOnEvents, "eventId" | "skillsetId">;
    create(inputData?: Partial<Prisma.SkillsetsOnEventsCreateInput & TTransients>): PromiseLike<SkillsetsOnEvents>;
    createList(list: readonly Partial<Prisma.SkillsetsOnEventsCreateInput & TTransients>[]): PromiseLike<SkillsetsOnEvents[]>;
    createList(count: number, item?: Partial<Prisma.SkillsetsOnEventsCreateInput & TTransients>): PromiseLike<SkillsetsOnEvents[]>;
    createForConnect(inputData?: Partial<Prisma.SkillsetsOnEventsCreateInput & TTransients>): PromiseLike<Pick<SkillsetsOnEvents, "eventId" | "skillsetId">>;
}
export interface SkillsetsOnEventsFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends SkillsetsOnEventsFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): SkillsetsOnEventsFactoryInterfaceWithoutTraits<TTransients>;
}
interface SkillsetsOnEventsFactoryBuilder {
    <TOptions extends SkillsetsOnEventsFactoryDefineOptions>(options: TOptions): SkillsetsOnEventsFactoryInterface<{}, SkillsetsOnEventsTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends SkillsetsOnEventsTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends SkillsetsOnEventsFactoryDefineOptions<TTransients>>(options: TOptions) => SkillsetsOnEventsFactoryInterface<TTransients, SkillsetsOnEventsTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link SkillsetsOnEvents} model.
 *
 * @param options
 * @returns factory {@link SkillsetsOnEventsFactoryInterface}
 */
export declare const defineSkillsetsOnEventsFactory: SkillsetsOnEventsFactoryBuilder;
type SkillsetsOnIssuesissueFactory = {
    _factoryFor: "Issue";
    build: () => PromiseLike<Prisma.IssueCreateNestedOneWithoutSkillsetsInput["create"]>;
};
type SkillsetsOnIssuesskillsetFactory = {
    _factoryFor: "Skillset";
    build: () => PromiseLike<Prisma.SkillsetCreateNestedOneWithoutIssuesInput["create"]>;
};
type SkillsetsOnIssuesFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    issue: SkillsetsOnIssuesissueFactory | Prisma.IssueCreateNestedOneWithoutSkillsetsInput;
    skillset: SkillsetsOnIssuesskillsetFactory | Prisma.SkillsetCreateNestedOneWithoutIssuesInput;
};
type SkillsetsOnIssuesTransientFields = Record<string, unknown> & Partial<Record<keyof SkillsetsOnIssuesFactoryDefineInput, never>>;
type SkillsetsOnIssuesFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<SkillsetsOnIssuesFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<SkillsetsOnIssues, Prisma.SkillsetsOnIssuesCreateInput, TTransients>;
type SkillsetsOnIssuesFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<SkillsetsOnIssuesFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: SkillsetsOnIssuesFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<SkillsetsOnIssues, Prisma.SkillsetsOnIssuesCreateInput, TTransients>;
type SkillsetsOnIssuesTraitKeys<TOptions extends SkillsetsOnIssuesFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface SkillsetsOnIssuesFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "SkillsetsOnIssues";
    build(inputData?: Partial<Prisma.SkillsetsOnIssuesCreateInput & TTransients>): PromiseLike<Prisma.SkillsetsOnIssuesCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.SkillsetsOnIssuesCreateInput & TTransients>): PromiseLike<Prisma.SkillsetsOnIssuesCreateInput>;
    buildList(list: readonly Partial<Prisma.SkillsetsOnIssuesCreateInput & TTransients>[]): PromiseLike<Prisma.SkillsetsOnIssuesCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.SkillsetsOnIssuesCreateInput & TTransients>): PromiseLike<Prisma.SkillsetsOnIssuesCreateInput[]>;
    pickForConnect(inputData: SkillsetsOnIssues): Pick<SkillsetsOnIssues, "issueId" | "skillsetId">;
    create(inputData?: Partial<Prisma.SkillsetsOnIssuesCreateInput & TTransients>): PromiseLike<SkillsetsOnIssues>;
    createList(list: readonly Partial<Prisma.SkillsetsOnIssuesCreateInput & TTransients>[]): PromiseLike<SkillsetsOnIssues[]>;
    createList(count: number, item?: Partial<Prisma.SkillsetsOnIssuesCreateInput & TTransients>): PromiseLike<SkillsetsOnIssues[]>;
    createForConnect(inputData?: Partial<Prisma.SkillsetsOnIssuesCreateInput & TTransients>): PromiseLike<Pick<SkillsetsOnIssues, "issueId" | "skillsetId">>;
}
export interface SkillsetsOnIssuesFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends SkillsetsOnIssuesFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): SkillsetsOnIssuesFactoryInterfaceWithoutTraits<TTransients>;
}
interface SkillsetsOnIssuesFactoryBuilder {
    <TOptions extends SkillsetsOnIssuesFactoryDefineOptions>(options: TOptions): SkillsetsOnIssuesFactoryInterface<{}, SkillsetsOnIssuesTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends SkillsetsOnIssuesTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends SkillsetsOnIssuesFactoryDefineOptions<TTransients>>(options: TOptions) => SkillsetsOnIssuesFactoryInterface<TTransients, SkillsetsOnIssuesTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link SkillsetsOnIssues} model.
 *
 * @param options
 * @returns factory {@link SkillsetsOnIssuesFactoryInterface}
 */
export declare const defineSkillsetsOnIssuesFactory: SkillsetsOnIssuesFactoryBuilder;
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
    events?: Prisma.CitiesOnEventsCreateNestedManyWithoutCityInput;
    issues?: Prisma.CitiesOnIssuesCreateNestedManyWithoutCityInput;
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
    build: () => PromiseLike<Prisma.CityCreateNestedOneWithoutEventsInput["create"]>;
};
type CitiesOnEventsFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    event: CitiesOnEventseventFactory | Prisma.EventCreateNestedOneWithoutCitiesInput;
    city: CitiesOnEventscityFactory | Prisma.CityCreateNestedOneWithoutEventsInput;
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
type CitiesOnIssuesissueFactory = {
    _factoryFor: "Issue";
    build: () => PromiseLike<Prisma.IssueCreateNestedOneWithoutCitiesInput["create"]>;
};
type CitiesOnIssuescityFactory = {
    _factoryFor: "City";
    build: () => PromiseLike<Prisma.CityCreateNestedOneWithoutIssuesInput["create"]>;
};
type CitiesOnIssuesFactoryDefineInput = {
    createdAt?: Date;
    updatedAt?: Date | null;
    issue: CitiesOnIssuesissueFactory | Prisma.IssueCreateNestedOneWithoutCitiesInput;
    city: CitiesOnIssuescityFactory | Prisma.CityCreateNestedOneWithoutIssuesInput;
};
type CitiesOnIssuesTransientFields = Record<string, unknown> & Partial<Record<keyof CitiesOnIssuesFactoryDefineInput, never>>;
type CitiesOnIssuesFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<CitiesOnIssuesFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<CitiesOnIssues, Prisma.CitiesOnIssuesCreateInput, TTransients>;
type CitiesOnIssuesFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<CitiesOnIssuesFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: CitiesOnIssuesFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<CitiesOnIssues, Prisma.CitiesOnIssuesCreateInput, TTransients>;
type CitiesOnIssuesTraitKeys<TOptions extends CitiesOnIssuesFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface CitiesOnIssuesFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "CitiesOnIssues";
    build(inputData?: Partial<Prisma.CitiesOnIssuesCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnIssuesCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.CitiesOnIssuesCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnIssuesCreateInput>;
    buildList(list: readonly Partial<Prisma.CitiesOnIssuesCreateInput & TTransients>[]): PromiseLike<Prisma.CitiesOnIssuesCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.CitiesOnIssuesCreateInput & TTransients>): PromiseLike<Prisma.CitiesOnIssuesCreateInput[]>;
    pickForConnect(inputData: CitiesOnIssues): Pick<CitiesOnIssues, "issueId" | "cityCode">;
    create(inputData?: Partial<Prisma.CitiesOnIssuesCreateInput & TTransients>): PromiseLike<CitiesOnIssues>;
    createList(list: readonly Partial<Prisma.CitiesOnIssuesCreateInput & TTransients>[]): PromiseLike<CitiesOnIssues[]>;
    createList(count: number, item?: Partial<Prisma.CitiesOnIssuesCreateInput & TTransients>): PromiseLike<CitiesOnIssues[]>;
    createForConnect(inputData?: Partial<Prisma.CitiesOnIssuesCreateInput & TTransients>): PromiseLike<Pick<CitiesOnIssues, "issueId" | "cityCode">>;
}
export interface CitiesOnIssuesFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends CitiesOnIssuesFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): CitiesOnIssuesFactoryInterfaceWithoutTraits<TTransients>;
}
interface CitiesOnIssuesFactoryBuilder {
    <TOptions extends CitiesOnIssuesFactoryDefineOptions>(options: TOptions): CitiesOnIssuesFactoryInterface<{}, CitiesOnIssuesTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends CitiesOnIssuesTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends CitiesOnIssuesFactoryDefineOptions<TTransients>>(options: TOptions) => CitiesOnIssuesFactoryInterface<TTransients, CitiesOnIssuesTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link CitiesOnIssues} model.
 *
 * @param options
 * @returns factory {@link CitiesOnIssuesFactoryInterface}
 */
export declare const defineCitiesOnIssuesFactory: CitiesOnIssuesFactoryBuilder;
type IndexFactoryDefineInput = {
    id?: number;
    code?: string;
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
type IssueStatViewissueFactory = {
    _factoryFor: "Issue";
    build: () => PromiseLike<Prisma.IssueCreateNestedOneWithoutStatInput["create"]>;
};
type IssueStatViewFactoryDefineInput = {
    isPublic?: boolean;
    startsAt?: Date;
    endsAt?: Date;
    plannedStartsAt?: Date | null;
    plannedEndsAt?: Date | null;
    totalMinutes?: number;
    issue: IssueStatViewissueFactory | Prisma.IssueCreateNestedOneWithoutStatInput;
};
type IssueStatViewTransientFields = Record<string, unknown> & Partial<Record<keyof IssueStatViewFactoryDefineInput, never>>;
type IssueStatViewFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<IssueStatViewFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<IssueStatView, Prisma.IssueStatViewCreateInput, TTransients>;
type IssueStatViewFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<IssueStatViewFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: IssueStatViewFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<IssueStatView, Prisma.IssueStatViewCreateInput, TTransients>;
type IssueStatViewTraitKeys<TOptions extends IssueStatViewFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface IssueStatViewFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "IssueStatView";
    build(inputData?: Partial<Prisma.IssueStatViewCreateInput & TTransients>): PromiseLike<Prisma.IssueStatViewCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.IssueStatViewCreateInput & TTransients>): PromiseLike<Prisma.IssueStatViewCreateInput>;
    buildList(list: readonly Partial<Prisma.IssueStatViewCreateInput & TTransients>[]): PromiseLike<Prisma.IssueStatViewCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.IssueStatViewCreateInput & TTransients>): PromiseLike<Prisma.IssueStatViewCreateInput[]>;
    pickForConnect(inputData: IssueStatView): Pick<IssueStatView, "id">;
    create(inputData?: Partial<Prisma.IssueStatViewCreateInput & TTransients>): PromiseLike<IssueStatView>;
    createList(list: readonly Partial<Prisma.IssueStatViewCreateInput & TTransients>[]): PromiseLike<IssueStatView[]>;
    createList(count: number, item?: Partial<Prisma.IssueStatViewCreateInput & TTransients>): PromiseLike<IssueStatView[]>;
    createForConnect(inputData?: Partial<Prisma.IssueStatViewCreateInput & TTransients>): PromiseLike<Pick<IssueStatView, "id">>;
}
export interface IssueStatViewFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends IssueStatViewFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): IssueStatViewFactoryInterfaceWithoutTraits<TTransients>;
}
interface IssueStatViewFactoryBuilder {
    <TOptions extends IssueStatViewFactoryDefineOptions>(options: TOptions): IssueStatViewFactoryInterface<{}, IssueStatViewTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends IssueStatViewTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends IssueStatViewFactoryDefineOptions<TTransients>>(options: TOptions) => IssueStatViewFactoryInterface<TTransients, IssueStatViewTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link IssueStatView} model.
 *
 * @param options
 * @returns factory {@link IssueStatViewFactoryInterface}
 */
export declare const defineIssueStatViewFactory: IssueStatViewFactoryBuilder;
