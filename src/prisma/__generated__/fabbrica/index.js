"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineIssueStatViewFactory = exports.defineEventStatViewFactory = exports.defineActivityStatViewFactory = exports.defineIndexFactory = exports.defineCitiesOnIssuesFactory = exports.defineCitiesOnEventsFactory = exports.defineCitiesOnOrganizationsFactory = exports.defineCitiesOnGroupsFactory = exports.defineCitiesOnUsersFactory = exports.defineStateFactory = exports.defineCityFactory = exports.defineSkillsetsOnIssuesFactory = exports.defineSkillsetsOnEventsFactory = exports.defineSkillsetsOnUsersFactory = exports.defineSkillsetFactory = exports.defineIssueCategoriesOnUsersFactory = exports.defineIssueCategoriesOnIssuesFactory = exports.defineIssueCategoryFactory = exports.defineAgendasOnEventsFactory = exports.defineAgendasOnOrganizationsFactory = exports.defineAgendasOnGroupsFactory = exports.defineAgendasOnUsersFactory = exports.defineAgendaFactory = exports.defineTargetFactory = exports.defineCommentFactory = exports.defineLikeFactory = exports.defineIssuesOnOrganizationsFactory = exports.defineIssuesOnGroupsFactory = exports.defineIssueFactory = exports.defineEventsOnOrganizationsFactory = exports.defineEventsOnGroupsFactory = exports.defineEventFactory = exports.defineApplicationConfirmationFactory = exports.defineApplicationFactory = exports.defineActivityFactory = exports.defineUsersOnOrganizationsFactory = exports.defineOrganizationFactory = exports.defineUsersOnGroupsFactory = exports.defineGroupFactory = exports.defineUserFactory = exports.defineIdentityFactory = exports.initialize = exports.resetScalarFieldValueGenerator = exports.registerScalarFieldValueGenerator = exports.resetSequence = void 0;
const internal_1 = require("@quramy/prisma-fabbrica/lib/internal");
var internal_2 = require("@quramy/prisma-fabbrica/lib/internal");
Object.defineProperty(exports, "resetSequence", { enumerable: true, get: function () { return internal_2.resetSequence; } });
Object.defineProperty(exports, "registerScalarFieldValueGenerator", { enumerable: true, get: function () { return internal_2.registerScalarFieldValueGenerator; } });
Object.defineProperty(exports, "resetScalarFieldValueGenerator", { enumerable: true, get: function () { return internal_2.resetScalarFieldValueGenerator; } });
const initializer = (0, internal_1.createInitializer)();
const { getClient } = initializer;
exports.initialize = initializer.initialize;
const modelFieldDefinitions = [{
        name: "Identity",
        fields: [{
                name: "user",
                type: "User",
                relationName: "IdentityToUser"
            }]
    }, {
        name: "User",
        fields: [{
                name: "identities",
                type: "Identity",
                relationName: "IdentityToUser"
            }, {
                name: "agendas",
                type: "AgendasOnUsers",
                relationName: "AgendasOnUsersToUser"
            }, {
                name: "skillsets",
                type: "SkillsetsOnUsers",
                relationName: "SkillsetsOnUsersToUser"
            }, {
                name: "issueCategories",
                type: "IssueCategoriesOnUsers",
                relationName: "IssueCategoriesOnUsersToUser"
            }, {
                name: "cities",
                type: "CitiesOnUsers",
                relationName: "CitiesOnUsersToUser"
            }, {
                name: "groups",
                type: "UsersOnGroups",
                relationName: "UserToUsersOnGroups"
            }, {
                name: "organizations",
                type: "UsersOnOrganizations",
                relationName: "UserToUsersOnOrganizations"
            }, {
                name: "applications",
                type: "Application",
                relationName: "ApplicationToUser"
            }, {
                name: "confirmations",
                type: "ApplicationConfirmation",
                relationName: "ApplicationConfirmationToUser"
            }, {
                name: "activities",
                type: "Activity",
                relationName: "ActivityToUser"
            }, {
                name: "likes",
                type: "Like",
                relationName: "LikeToUser"
            }, {
                name: "comments",
                type: "Comment",
                relationName: "CommentToUser"
            }]
    }, {
        name: "Group",
        fields: [{
                name: "users",
                type: "UsersOnGroups",
                relationName: "GroupToUsersOnGroups"
            }, {
                name: "events",
                type: "EventsOnGroups",
                relationName: "EventsOnGroupsToGroup"
            }, {
                name: "issues",
                type: "IssuesOnGroups",
                relationName: "GroupToIssuesOnGroups"
            }, {
                name: "agendas",
                type: "AgendasOnGroups",
                relationName: "AgendasOnGroupsToGroup"
            }, {
                name: "cities",
                type: "CitiesOnGroups",
                relationName: "CitiesOnGroupsToGroup"
            }, {
                name: "targets",
                type: "Target",
                relationName: "GroupToTarget"
            }, {
                name: "parent",
                type: "Group",
                relationName: "groups_on_groups"
            }, {
                name: "children",
                type: "Group",
                relationName: "groups_on_groups"
            }, {
                name: "organization",
                type: "Organization",
                relationName: "GroupToOrganization"
            }]
    }, {
        name: "UsersOnGroups",
        fields: [{
                name: "user",
                type: "User",
                relationName: "UserToUsersOnGroups"
            }, {
                name: "group",
                type: "Group",
                relationName: "GroupToUsersOnGroups"
            }]
    }, {
        name: "Organization",
        fields: [{
                name: "state",
                type: "State",
                relationName: "OrganizationToState"
            }, {
                name: "city",
                type: "City",
                relationName: "CityToOrganization"
            }, {
                name: "groups",
                type: "Group",
                relationName: "GroupToOrganization"
            }, {
                name: "users",
                type: "UsersOnOrganizations",
                relationName: "OrganizationToUsersOnOrganizations"
            }, {
                name: "events",
                type: "EventsOnOrganizations",
                relationName: "EventsOnOrganizationsToOrganization"
            }, {
                name: "issues",
                type: "IssuesOnOrganizations",
                relationName: "IssuesOnOrganizationsToOrganization"
            }, {
                name: "agendas",
                type: "AgendasOnOrganizations",
                relationName: "AgendasOnOrganizationsToOrganization"
            }, {
                name: "cities",
                type: "CitiesOnOrganizations",
                relationName: "CitiesOnOrganizationsToOrganization"
            }, {
                name: "targets",
                type: "Target",
                relationName: "OrganizationToTarget"
            }, {
                name: "activitiesNotInEvents",
                type: "Activity",
                relationName: "ActivityToOrganization"
            }]
    }, {
        name: "UsersOnOrganizations",
        fields: [{
                name: "user",
                type: "User",
                relationName: "UserToUsersOnOrganizations"
            }, {
                name: "organization",
                type: "Organization",
                relationName: "OrganizationToUsersOnOrganizations"
            }]
    }, {
        name: "Activity",
        fields: [{
                name: "user",
                type: "User",
                relationName: "ActivityToUser"
            }, {
                name: "organization",
                type: "Organization",
                relationName: "ActivityToOrganization"
            }, {
                name: "event",
                type: "Event",
                relationName: "ActivityToEvent"
            }, {
                name: "issue",
                type: "Issue",
                relationName: "ActivityToIssue"
            }, {
                name: "application",
                type: "Application",
                relationName: "ActivityToApplication"
            }, {
                name: "stat",
                type: "ActivityStatView",
                relationName: "ActivityToActivityStatView"
            }]
    }, {
        name: "Application",
        fields: [{
                name: "event",
                type: "Event",
                relationName: "ApplicationToEvent"
            }, {
                name: "user",
                type: "User",
                relationName: "ApplicationToUser"
            }, {
                name: "activity",
                type: "Activity",
                relationName: "ActivityToApplication"
            }, {
                name: "approvals",
                type: "ApplicationConfirmation",
                relationName: "ApplicationToApplicationConfirmation"
            }]
    }, {
        name: "ApplicationConfirmation",
        fields: [{
                name: "application",
                type: "Application",
                relationName: "ApplicationToApplicationConfirmation"
            }, {
                name: "confirmedBy",
                type: "User",
                relationName: "ApplicationConfirmationToUser"
            }]
    }, {
        name: "Event",
        fields: [{
                name: "agendas",
                type: "AgendasOnEvents",
                relationName: "AgendasOnEventsToEvent"
            }, {
                name: "skillsets",
                type: "SkillsetsOnEvents",
                relationName: "EventToSkillsetsOnEvents"
            }, {
                name: "groups",
                type: "EventsOnGroups",
                relationName: "EventToEventsOnGroups"
            }, {
                name: "organizations",
                type: "EventsOnOrganizations",
                relationName: "EventToEventsOnOrganizations"
            }, {
                name: "applications",
                type: "Application",
                relationName: "ApplicationToEvent"
            }, {
                name: "likes",
                type: "Like",
                relationName: "EventToLike"
            }, {
                name: "comments",
                type: "Comment",
                relationName: "CommentToEvent"
            }, {
                name: "activities",
                type: "Activity",
                relationName: "ActivityToEvent"
            }, {
                name: "cities",
                type: "CitiesOnEvents",
                relationName: "CitiesOnEventsToEvent"
            }, {
                name: "stat",
                type: "EventStatView",
                relationName: "EventToEventStatView"
            }]
    }, {
        name: "EventsOnGroups",
        fields: [{
                name: "group",
                type: "Group",
                relationName: "EventsOnGroupsToGroup"
            }, {
                name: "event",
                type: "Event",
                relationName: "EventToEventsOnGroups"
            }]
    }, {
        name: "EventsOnOrganizations",
        fields: [{
                name: "organization",
                type: "Organization",
                relationName: "EventsOnOrganizationsToOrganization"
            }, {
                name: "event",
                type: "Event",
                relationName: "EventToEventsOnOrganizations"
            }]
    }, {
        name: "Issue",
        fields: [{
                name: "skillsets",
                type: "SkillsetsOnIssues",
                relationName: "IssueToSkillsetsOnIssues"
            }, {
                name: "issueCategories",
                type: "IssueCategoriesOnIssues",
                relationName: "IssueToIssueCategoriesOnIssues"
            }, {
                name: "groups",
                type: "IssuesOnGroups",
                relationName: "IssueToIssuesOnGroups"
            }, {
                name: "organizations",
                type: "IssuesOnOrganizations",
                relationName: "IssueToIssuesOnOrganizations"
            }, {
                name: "likes",
                type: "Like",
                relationName: "IssueToLike"
            }, {
                name: "comments",
                type: "Comment",
                relationName: "CommentToIssue"
            }, {
                name: "activities",
                type: "Activity",
                relationName: "ActivityToIssue"
            }, {
                name: "cities",
                type: "CitiesOnIssues",
                relationName: "CitiesOnIssuesToIssue"
            }, {
                name: "stat",
                type: "IssueStatView",
                relationName: "IssueToIssueStatView"
            }]
    }, {
        name: "IssuesOnGroups",
        fields: [{
                name: "group",
                type: "Group",
                relationName: "GroupToIssuesOnGroups"
            }, {
                name: "issue",
                type: "Issue",
                relationName: "IssueToIssuesOnGroups"
            }]
    }, {
        name: "IssuesOnOrganizations",
        fields: [{
                name: "organization",
                type: "Organization",
                relationName: "IssuesOnOrganizationsToOrganization"
            }, {
                name: "issue",
                type: "Issue",
                relationName: "IssueToIssuesOnOrganizations"
            }]
    }, {
        name: "Like",
        fields: [{
                name: "user",
                type: "User",
                relationName: "LikeToUser"
            }, {
                name: "event",
                type: "Event",
                relationName: "EventToLike"
            }, {
                name: "issue",
                type: "Issue",
                relationName: "IssueToLike"
            }]
    }, {
        name: "Comment",
        fields: [{
                name: "user",
                type: "User",
                relationName: "CommentToUser"
            }, {
                name: "event",
                type: "Event",
                relationName: "CommentToEvent"
            }, {
                name: "issue",
                type: "Issue",
                relationName: "CommentToIssue"
            }]
    }, {
        name: "Target",
        fields: [{
                name: "organization",
                type: "Organization",
                relationName: "OrganizationToTarget"
            }, {
                name: "group",
                type: "Group",
                relationName: "GroupToTarget"
            }, {
                name: "index",
                type: "Index",
                relationName: "IndexToTarget"
            }]
    }, {
        name: "Agenda",
        fields: [{
                name: "users",
                type: "AgendasOnUsers",
                relationName: "AgendaToAgendasOnUsers"
            }, {
                name: "groups",
                type: "AgendasOnGroups",
                relationName: "AgendaToAgendasOnGroups"
            }, {
                name: "organizations",
                type: "AgendasOnOrganizations",
                relationName: "AgendaToAgendasOnOrganizations"
            }, {
                name: "events",
                type: "AgendasOnEvents",
                relationName: "AgendaToAgendasOnEvents"
            }]
    }, {
        name: "AgendasOnUsers",
        fields: [{
                name: "user",
                type: "User",
                relationName: "AgendasOnUsersToUser"
            }, {
                name: "agenda",
                type: "Agenda",
                relationName: "AgendaToAgendasOnUsers"
            }]
    }, {
        name: "AgendasOnGroups",
        fields: [{
                name: "group",
                type: "Group",
                relationName: "AgendasOnGroupsToGroup"
            }, {
                name: "agenda",
                type: "Agenda",
                relationName: "AgendaToAgendasOnGroups"
            }]
    }, {
        name: "AgendasOnOrganizations",
        fields: [{
                name: "organization",
                type: "Organization",
                relationName: "AgendasOnOrganizationsToOrganization"
            }, {
                name: "agenda",
                type: "Agenda",
                relationName: "AgendaToAgendasOnOrganizations"
            }]
    }, {
        name: "AgendasOnEvents",
        fields: [{
                name: "event",
                type: "Event",
                relationName: "AgendasOnEventsToEvent"
            }, {
                name: "agenda",
                type: "Agenda",
                relationName: "AgendaToAgendasOnEvents"
            }]
    }, {
        name: "IssueCategory",
        fields: [{
                name: "issues",
                type: "IssueCategoriesOnIssues",
                relationName: "IssueCategoriesOnIssuesToIssueCategory"
            }, {
                name: "users",
                type: "IssueCategoriesOnUsers",
                relationName: "IssueCategoriesOnUsersToIssueCategory"
            }]
    }, {
        name: "IssueCategoriesOnIssues",
        fields: [{
                name: "issue",
                type: "Issue",
                relationName: "IssueToIssueCategoriesOnIssues"
            }, {
                name: "issueCategory",
                type: "IssueCategory",
                relationName: "IssueCategoriesOnIssuesToIssueCategory"
            }]
    }, {
        name: "IssueCategoriesOnUsers",
        fields: [{
                name: "user",
                type: "User",
                relationName: "IssueCategoriesOnUsersToUser"
            }, {
                name: "issueCategory",
                type: "IssueCategory",
                relationName: "IssueCategoriesOnUsersToIssueCategory"
            }]
    }, {
        name: "Skillset",
        fields: [{
                name: "users",
                type: "SkillsetsOnUsers",
                relationName: "SkillsetToSkillsetsOnUsers"
            }, {
                name: "events",
                type: "SkillsetsOnEvents",
                relationName: "SkillsetToSkillsetsOnEvents"
            }, {
                name: "issues",
                type: "SkillsetsOnIssues",
                relationName: "SkillsetToSkillsetsOnIssues"
            }]
    }, {
        name: "SkillsetsOnUsers",
        fields: [{
                name: "user",
                type: "User",
                relationName: "SkillsetsOnUsersToUser"
            }, {
                name: "skillset",
                type: "Skillset",
                relationName: "SkillsetToSkillsetsOnUsers"
            }]
    }, {
        name: "SkillsetsOnEvents",
        fields: [{
                name: "event",
                type: "Event",
                relationName: "EventToSkillsetsOnEvents"
            }, {
                name: "skillset",
                type: "Skillset",
                relationName: "SkillsetToSkillsetsOnEvents"
            }]
    }, {
        name: "SkillsetsOnIssues",
        fields: [{
                name: "issue",
                type: "Issue",
                relationName: "IssueToSkillsetsOnIssues"
            }, {
                name: "skillset",
                type: "Skillset",
                relationName: "SkillsetToSkillsetsOnIssues"
            }]
    }, {
        name: "City",
        fields: [{
                name: "state",
                type: "State",
                relationName: "CityToState"
            }, {
                name: "cities",
                type: "CitiesOnUsers",
                relationName: "CitiesOnUsersToCity"
            }, {
                name: "groups",
                type: "CitiesOnGroups",
                relationName: "CitiesOnGroupsToCity"
            }, {
                name: "organizations",
                type: "CitiesOnOrganizations",
                relationName: "CitiesOnOrganizationsToCity"
            }, {
                name: "addressedOrganizations",
                type: "Organization",
                relationName: "CityToOrganization"
            }, {
                name: "events",
                type: "CitiesOnEvents",
                relationName: "CitiesOnEventsToCity"
            }, {
                name: "issues",
                type: "CitiesOnIssues",
                relationName: "CitiesOnIssuesToCity"
            }]
    }, {
        name: "State",
        fields: [{
                name: "cities",
                type: "City",
                relationName: "CityToState"
            }, {
                name: "organization",
                type: "Organization",
                relationName: "OrganizationToState"
            }]
    }, {
        name: "CitiesOnUsers",
        fields: [{
                name: "user",
                type: "User",
                relationName: "CitiesOnUsersToUser"
            }, {
                name: "city",
                type: "City",
                relationName: "CitiesOnUsersToCity"
            }]
    }, {
        name: "CitiesOnGroups",
        fields: [{
                name: "group",
                type: "Group",
                relationName: "CitiesOnGroupsToGroup"
            }, {
                name: "city",
                type: "City",
                relationName: "CitiesOnGroupsToCity"
            }]
    }, {
        name: "CitiesOnOrganizations",
        fields: [{
                name: "organization",
                type: "Organization",
                relationName: "CitiesOnOrganizationsToOrganization"
            }, {
                name: "city",
                type: "City",
                relationName: "CitiesOnOrganizationsToCity"
            }]
    }, {
        name: "CitiesOnEvents",
        fields: [{
                name: "event",
                type: "Event",
                relationName: "CitiesOnEventsToEvent"
            }, {
                name: "city",
                type: "City",
                relationName: "CitiesOnEventsToCity"
            }]
    }, {
        name: "CitiesOnIssues",
        fields: [{
                name: "issue",
                type: "Issue",
                relationName: "CitiesOnIssuesToIssue"
            }, {
                name: "city",
                type: "City",
                relationName: "CitiesOnIssuesToCity"
            }]
    }, {
        name: "Index",
        fields: [{
                name: "targets",
                type: "Target",
                relationName: "IndexToTarget"
            }]
    }, {
        name: "ActivityStatView",
        fields: [{
                name: "activity",
                type: "Activity",
                relationName: "ActivityToActivityStatView"
            }]
    }, {
        name: "EventStatView",
        fields: [{
                name: "event",
                type: "Event",
                relationName: "EventToEventStatView"
            }]
    }, {
        name: "IssueStatView",
        fields: [{
                name: "issue",
                type: "Issue",
                relationName: "IssueToIssueStatView"
            }]
    }];
function isIdentityuserFactory(x) {
    return x?._factoryFor === "User";
}
function autoGenerateIdentityScalarsOrEnums({ seq }) {
    return {
        uid: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Identity", fieldName: "uid", isId: true, isUnique: false, seq }),
        platform: "LINE"
    };
}
function defineIdentityFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Identity", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateIdentityScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isIdentityuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            uid: inputData.uid
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().identity.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Identity",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link Identity} model.
 *
 * @param options
 * @returns factory {@link IdentityFactoryInterface}
 */
exports.defineIdentityFactory = ((options) => {
    return defineIdentityFactoryInternal(options, {});
});
exports.defineIdentityFactory.withTransientFields = defaultTransientFieldValues => options => defineIdentityFactoryInternal(options, defaultTransientFieldValues);
function autoGenerateUserScalarsOrEnums({ seq }) {
    return {
        lastName: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "User", fieldName: "lastName", isId: false, isUnique: false, seq }),
        firstName: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "User", fieldName: "firstName", isId: false, isUnique: false, seq })
    };
}
function defineUserFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("User", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateUserScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {};
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().user.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "User",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link User} model.
 *
 * @param options
 * @returns factory {@link UserFactoryInterface}
 */
exports.defineUserFactory = ((options) => {
    return defineUserFactoryInternal(options ?? {}, {});
});
exports.defineUserFactory.withTransientFields = defaultTransientFieldValues => options => defineUserFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isGroupparentFactory(x) {
    return x?._factoryFor === "Group";
}
function isGrouporganizationFactory(x) {
    return x?._factoryFor === "Organization";
}
function autoGenerateGroupScalarsOrEnums({ seq }) {
    return {
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Group", fieldName: "name", isId: false, isUnique: false, seq })
    };
}
function defineGroupFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Group", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateGroupScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                parent: isGroupparentFactory(defaultData.parent) ? {
                    create: await defaultData.parent.build()
                } : defaultData.parent,
                organization: isGrouporganizationFactory(defaultData.organization) ? {
                    create: await defaultData.organization.build()
                } : defaultData.organization
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().group.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Group",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link Group} model.
 *
 * @param options
 * @returns factory {@link GroupFactoryInterface}
 */
exports.defineGroupFactory = ((options) => {
    return defineGroupFactoryInternal(options, {});
});
exports.defineGroupFactory.withTransientFields = defaultTransientFieldValues => options => defineGroupFactoryInternal(options, defaultTransientFieldValues);
function isUsersOnGroupsuserFactory(x) {
    return x?._factoryFor === "User";
}
function isUsersOnGroupsgroupFactory(x) {
    return x?._factoryFor === "Group";
}
function autoGenerateUsersOnGroupsScalarsOrEnums({ seq }) {
    return {};
}
function defineUsersOnGroupsFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("UsersOnGroups", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateUsersOnGroupsScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isUsersOnGroupsuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                group: isUsersOnGroupsgroupFactory(defaultData.group) ? {
                    create: await defaultData.group.build()
                } : defaultData.group
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            userId: inputData.userId,
            groupId: inputData.groupId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().usersOnGroups.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "UsersOnGroups",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link UsersOnGroups} model.
 *
 * @param options
 * @returns factory {@link UsersOnGroupsFactoryInterface}
 */
exports.defineUsersOnGroupsFactory = ((options) => {
    return defineUsersOnGroupsFactoryInternal(options, {});
});
exports.defineUsersOnGroupsFactory.withTransientFields = defaultTransientFieldValues => options => defineUsersOnGroupsFactoryInternal(options, defaultTransientFieldValues);
function isOrganizationstateFactory(x) {
    return x?._factoryFor === "State";
}
function isOrganizationcityFactory(x) {
    return x?._factoryFor === "City";
}
function autoGenerateOrganizationScalarsOrEnums({ seq }) {
    return {
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Organization", fieldName: "name", isId: false, isUnique: false, seq }),
        zipcode: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Organization", fieldName: "zipcode", isId: false, isUnique: false, seq }),
        address1: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Organization", fieldName: "address1", isId: false, isUnique: false, seq })
    };
}
function defineOrganizationFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Organization", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateOrganizationScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                state: isOrganizationstateFactory(defaultData.state) ? {
                    create: await defaultData.state.build()
                } : defaultData.state,
                city: isOrganizationcityFactory(defaultData.city) ? {
                    create: await defaultData.city.build()
                } : defaultData.city
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().organization.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Organization",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link Organization} model.
 *
 * @param options
 * @returns factory {@link OrganizationFactoryInterface}
 */
exports.defineOrganizationFactory = ((options) => {
    return defineOrganizationFactoryInternal(options, {});
});
exports.defineOrganizationFactory.withTransientFields = defaultTransientFieldValues => options => defineOrganizationFactoryInternal(options, defaultTransientFieldValues);
function isUsersOnOrganizationsuserFactory(x) {
    return x?._factoryFor === "User";
}
function isUsersOnOrganizationsorganizationFactory(x) {
    return x?._factoryFor === "Organization";
}
function autoGenerateUsersOnOrganizationsScalarsOrEnums({ seq }) {
    return {};
}
function defineUsersOnOrganizationsFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("UsersOnOrganizations", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateUsersOnOrganizationsScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isUsersOnOrganizationsuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                organization: isUsersOnOrganizationsorganizationFactory(defaultData.organization) ? {
                    create: await defaultData.organization.build()
                } : defaultData.organization
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            userId: inputData.userId,
            organizationId: inputData.organizationId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().usersOnOrganizations.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "UsersOnOrganizations",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link UsersOnOrganizations} model.
 *
 * @param options
 * @returns factory {@link UsersOnOrganizationsFactoryInterface}
 */
exports.defineUsersOnOrganizationsFactory = ((options) => {
    return defineUsersOnOrganizationsFactoryInternal(options, {});
});
exports.defineUsersOnOrganizationsFactory.withTransientFields = defaultTransientFieldValues => options => defineUsersOnOrganizationsFactoryInternal(options, defaultTransientFieldValues);
function isActivityuserFactory(x) {
    return x?._factoryFor === "User";
}
function isActivityorganizationFactory(x) {
    return x?._factoryFor === "Organization";
}
function isActivityeventFactory(x) {
    return x?._factoryFor === "Event";
}
function isActivityissueFactory(x) {
    return x?._factoryFor === "Issue";
}
function isActivityapplicationFactory(x) {
    return x?._factoryFor === "Application";
}
function isActivitystatFactory(x) {
    return x?._factoryFor === "ActivityStatView";
}
function autoGenerateActivityScalarsOrEnums({ seq }) {
    return {
        startsAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "Activity", fieldName: "startsAt", isId: false, isUnique: false, seq }),
        endsAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "Activity", fieldName: "endsAt", isId: false, isUnique: false, seq })
    };
}
function defineActivityFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Activity", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateActivityScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isActivityuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                organization: isActivityorganizationFactory(defaultData.organization) ? {
                    create: await defaultData.organization.build()
                } : defaultData.organization,
                event: isActivityeventFactory(defaultData.event) ? {
                    create: await defaultData.event.build()
                } : defaultData.event,
                issue: isActivityissueFactory(defaultData.issue) ? {
                    create: await defaultData.issue.build()
                } : defaultData.issue,
                application: isActivityapplicationFactory(defaultData.application) ? {
                    create: await defaultData.application.build()
                } : defaultData.application,
                stat: isActivitystatFactory(defaultData.stat) ? {
                    create: await defaultData.stat.build()
                } : defaultData.stat
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().activity.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Activity",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link Activity} model.
 *
 * @param options
 * @returns factory {@link ActivityFactoryInterface}
 */
exports.defineActivityFactory = ((options) => {
    return defineActivityFactoryInternal(options ?? {}, {});
});
exports.defineActivityFactory.withTransientFields = defaultTransientFieldValues => options => defineActivityFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isApplicationeventFactory(x) {
    return x?._factoryFor === "Event";
}
function isApplicationuserFactory(x) {
    return x?._factoryFor === "User";
}
function isApplicationactivityFactory(x) {
    return x?._factoryFor === "Activity";
}
function autoGenerateApplicationScalarsOrEnums({ seq }) {
    return {
        submittedAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "Application", fieldName: "submittedAt", isId: false, isUnique: false, seq })
    };
}
function defineApplicationFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Application", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateApplicationScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                event: isApplicationeventFactory(defaultData.event) ? {
                    create: await defaultData.event.build()
                } : defaultData.event,
                user: isApplicationuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                activity: isApplicationactivityFactory(defaultData.activity) ? {
                    create: await defaultData.activity.build()
                } : defaultData.activity
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().application.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Application",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link Application} model.
 *
 * @param options
 * @returns factory {@link ApplicationFactoryInterface}
 */
exports.defineApplicationFactory = ((options) => {
    return defineApplicationFactoryInternal(options ?? {}, {});
});
exports.defineApplicationFactory.withTransientFields = defaultTransientFieldValues => options => defineApplicationFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isApplicationConfirmationapplicationFactory(x) {
    return x?._factoryFor === "Application";
}
function isApplicationConfirmationconfirmedByFactory(x) {
    return x?._factoryFor === "User";
}
function autoGenerateApplicationConfirmationScalarsOrEnums({ seq }) {
    return {};
}
function defineApplicationConfirmationFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("ApplicationConfirmation", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateApplicationConfirmationScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                application: isApplicationConfirmationapplicationFactory(defaultData.application) ? {
                    create: await defaultData.application.build()
                } : defaultData.application,
                confirmedBy: isApplicationConfirmationconfirmedByFactory(defaultData.confirmedBy) ? {
                    create: await defaultData.confirmedBy.build()
                } : defaultData.confirmedBy
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().applicationConfirmation.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "ApplicationConfirmation",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link ApplicationConfirmation} model.
 *
 * @param options
 * @returns factory {@link ApplicationConfirmationFactoryInterface}
 */
exports.defineApplicationConfirmationFactory = ((options) => {
    return defineApplicationConfirmationFactoryInternal(options, {});
});
exports.defineApplicationConfirmationFactory.withTransientFields = defaultTransientFieldValues => options => defineApplicationConfirmationFactoryInternal(options, defaultTransientFieldValues);
function isEventstatFactory(x) {
    return x?._factoryFor === "EventStatView";
}
function autoGenerateEventScalarsOrEnums({ seq }) {
    return {
        startsAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "Event", fieldName: "startsAt", isId: false, isUnique: false, seq }),
        endsAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "Event", fieldName: "endsAt", isId: false, isUnique: false, seq })
    };
}
function defineEventFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Event", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateEventScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                stat: isEventstatFactory(defaultData.stat) ? {
                    create: await defaultData.stat.build()
                } : defaultData.stat
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().event.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Event",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link Event} model.
 *
 * @param options
 * @returns factory {@link EventFactoryInterface}
 */
exports.defineEventFactory = ((options) => {
    return defineEventFactoryInternal(options ?? {}, {});
});
exports.defineEventFactory.withTransientFields = defaultTransientFieldValues => options => defineEventFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isEventsOnGroupsgroupFactory(x) {
    return x?._factoryFor === "Group";
}
function isEventsOnGroupseventFactory(x) {
    return x?._factoryFor === "Event";
}
function autoGenerateEventsOnGroupsScalarsOrEnums({ seq }) {
    return {};
}
function defineEventsOnGroupsFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("EventsOnGroups", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateEventsOnGroupsScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                group: isEventsOnGroupsgroupFactory(defaultData.group) ? {
                    create: await defaultData.group.build()
                } : defaultData.group,
                event: isEventsOnGroupseventFactory(defaultData.event) ? {
                    create: await defaultData.event.build()
                } : defaultData.event
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            groupId: inputData.groupId,
            eventId: inputData.eventId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().eventsOnGroups.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "EventsOnGroups",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link EventsOnGroups} model.
 *
 * @param options
 * @returns factory {@link EventsOnGroupsFactoryInterface}
 */
exports.defineEventsOnGroupsFactory = ((options) => {
    return defineEventsOnGroupsFactoryInternal(options, {});
});
exports.defineEventsOnGroupsFactory.withTransientFields = defaultTransientFieldValues => options => defineEventsOnGroupsFactoryInternal(options, defaultTransientFieldValues);
function isEventsOnOrganizationsorganizationFactory(x) {
    return x?._factoryFor === "Organization";
}
function isEventsOnOrganizationseventFactory(x) {
    return x?._factoryFor === "Event";
}
function autoGenerateEventsOnOrganizationsScalarsOrEnums({ seq }) {
    return {};
}
function defineEventsOnOrganizationsFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("EventsOnOrganizations", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateEventsOnOrganizationsScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                organization: isEventsOnOrganizationsorganizationFactory(defaultData.organization) ? {
                    create: await defaultData.organization.build()
                } : defaultData.organization,
                event: isEventsOnOrganizationseventFactory(defaultData.event) ? {
                    create: await defaultData.event.build()
                } : defaultData.event
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            organizationId: inputData.organizationId,
            eventId: inputData.eventId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().eventsOnOrganizations.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "EventsOnOrganizations",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link EventsOnOrganizations} model.
 *
 * @param options
 * @returns factory {@link EventsOnOrganizationsFactoryInterface}
 */
exports.defineEventsOnOrganizationsFactory = ((options) => {
    return defineEventsOnOrganizationsFactoryInternal(options, {});
});
exports.defineEventsOnOrganizationsFactory.withTransientFields = defaultTransientFieldValues => options => defineEventsOnOrganizationsFactoryInternal(options, defaultTransientFieldValues);
function isIssuestatFactory(x) {
    return x?._factoryFor === "IssueStatView";
}
function autoGenerateIssueScalarsOrEnums({ seq }) {
    return {};
}
function defineIssueFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Issue", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateIssueScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                stat: isIssuestatFactory(defaultData.stat) ? {
                    create: await defaultData.stat.build()
                } : defaultData.stat
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().issue.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Issue",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link Issue} model.
 *
 * @param options
 * @returns factory {@link IssueFactoryInterface}
 */
exports.defineIssueFactory = ((options) => {
    return defineIssueFactoryInternal(options ?? {}, {});
});
exports.defineIssueFactory.withTransientFields = defaultTransientFieldValues => options => defineIssueFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isIssuesOnGroupsgroupFactory(x) {
    return x?._factoryFor === "Group";
}
function isIssuesOnGroupsissueFactory(x) {
    return x?._factoryFor === "Issue";
}
function autoGenerateIssuesOnGroupsScalarsOrEnums({ seq }) {
    return {};
}
function defineIssuesOnGroupsFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("IssuesOnGroups", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateIssuesOnGroupsScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                group: isIssuesOnGroupsgroupFactory(defaultData.group) ? {
                    create: await defaultData.group.build()
                } : defaultData.group,
                issue: isIssuesOnGroupsissueFactory(defaultData.issue) ? {
                    create: await defaultData.issue.build()
                } : defaultData.issue
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            groupId: inputData.groupId,
            issueId: inputData.issueId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().issuesOnGroups.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "IssuesOnGroups",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link IssuesOnGroups} model.
 *
 * @param options
 * @returns factory {@link IssuesOnGroupsFactoryInterface}
 */
exports.defineIssuesOnGroupsFactory = ((options) => {
    return defineIssuesOnGroupsFactoryInternal(options, {});
});
exports.defineIssuesOnGroupsFactory.withTransientFields = defaultTransientFieldValues => options => defineIssuesOnGroupsFactoryInternal(options, defaultTransientFieldValues);
function isIssuesOnOrganizationsorganizationFactory(x) {
    return x?._factoryFor === "Organization";
}
function isIssuesOnOrganizationsissueFactory(x) {
    return x?._factoryFor === "Issue";
}
function autoGenerateIssuesOnOrganizationsScalarsOrEnums({ seq }) {
    return {};
}
function defineIssuesOnOrganizationsFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("IssuesOnOrganizations", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateIssuesOnOrganizationsScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                organization: isIssuesOnOrganizationsorganizationFactory(defaultData.organization) ? {
                    create: await defaultData.organization.build()
                } : defaultData.organization,
                issue: isIssuesOnOrganizationsissueFactory(defaultData.issue) ? {
                    create: await defaultData.issue.build()
                } : defaultData.issue
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            organizationId: inputData.organizationId,
            issueId: inputData.issueId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().issuesOnOrganizations.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "IssuesOnOrganizations",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link IssuesOnOrganizations} model.
 *
 * @param options
 * @returns factory {@link IssuesOnOrganizationsFactoryInterface}
 */
exports.defineIssuesOnOrganizationsFactory = ((options) => {
    return defineIssuesOnOrganizationsFactoryInternal(options, {});
});
exports.defineIssuesOnOrganizationsFactory.withTransientFields = defaultTransientFieldValues => options => defineIssuesOnOrganizationsFactoryInternal(options, defaultTransientFieldValues);
function isLikeuserFactory(x) {
    return x?._factoryFor === "User";
}
function isLikeeventFactory(x) {
    return x?._factoryFor === "Event";
}
function isLikeissueFactory(x) {
    return x?._factoryFor === "Issue";
}
function autoGenerateLikeScalarsOrEnums({ seq }) {
    return {
        postedAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "Like", fieldName: "postedAt", isId: false, isUnique: false, seq })
    };
}
function defineLikeFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Like", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateLikeScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isLikeuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                event: isLikeeventFactory(defaultData.event) ? {
                    create: await defaultData.event.build()
                } : defaultData.event,
                issue: isLikeissueFactory(defaultData.issue) ? {
                    create: await defaultData.issue.build()
                } : defaultData.issue
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().like.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Like",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link Like} model.
 *
 * @param options
 * @returns factory {@link LikeFactoryInterface}
 */
exports.defineLikeFactory = ((options) => {
    return defineLikeFactoryInternal(options ?? {}, {});
});
exports.defineLikeFactory.withTransientFields = defaultTransientFieldValues => options => defineLikeFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isCommentuserFactory(x) {
    return x?._factoryFor === "User";
}
function isCommenteventFactory(x) {
    return x?._factoryFor === "Event";
}
function isCommentissueFactory(x) {
    return x?._factoryFor === "Issue";
}
function autoGenerateCommentScalarsOrEnums({ seq }) {
    return {
        content: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Comment", fieldName: "content", isId: false, isUnique: false, seq }),
        postedAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "Comment", fieldName: "postedAt", isId: false, isUnique: false, seq })
    };
}
function defineCommentFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Comment", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCommentScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isCommentuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                event: isCommenteventFactory(defaultData.event) ? {
                    create: await defaultData.event.build()
                } : defaultData.event,
                issue: isCommentissueFactory(defaultData.issue) ? {
                    create: await defaultData.issue.build()
                } : defaultData.issue
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().comment.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Comment",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link Comment} model.
 *
 * @param options
 * @returns factory {@link CommentFactoryInterface}
 */
exports.defineCommentFactory = ((options) => {
    return defineCommentFactoryInternal(options ?? {}, {});
});
exports.defineCommentFactory.withTransientFields = defaultTransientFieldValues => options => defineCommentFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isTargetorganizationFactory(x) {
    return x?._factoryFor === "Organization";
}
function isTargetgroupFactory(x) {
    return x?._factoryFor === "Group";
}
function isTargetindexFactory(x) {
    return x?._factoryFor === "Index";
}
function autoGenerateTargetScalarsOrEnums({ seq }) {
    return {
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Target", fieldName: "name", isId: false, isUnique: false, seq }),
        value: (0, internal_1.getScalarFieldValueGenerator)().Float({ modelName: "Target", fieldName: "value", isId: false, isUnique: false, seq }),
        validFrom: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "Target", fieldName: "validFrom", isId: false, isUnique: false, seq }),
        validTo: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "Target", fieldName: "validTo", isId: false, isUnique: false, seq })
    };
}
function defineTargetFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Target", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateTargetScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                organization: isTargetorganizationFactory(defaultData.organization) ? {
                    create: await defaultData.organization.build()
                } : defaultData.organization,
                group: isTargetgroupFactory(defaultData.group) ? {
                    create: await defaultData.group.build()
                } : defaultData.group,
                index: isTargetindexFactory(defaultData.index) ? {
                    create: await defaultData.index.build()
                } : defaultData.index
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().target.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Target",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link Target} model.
 *
 * @param options
 * @returns factory {@link TargetFactoryInterface}
 */
exports.defineTargetFactory = ((options) => {
    return defineTargetFactoryInternal(options, {});
});
exports.defineTargetFactory.withTransientFields = defaultTransientFieldValues => options => defineTargetFactoryInternal(options, defaultTransientFieldValues);
function autoGenerateAgendaScalarsOrEnums({ seq }) {
    return {
        id: (0, internal_1.getScalarFieldValueGenerator)().Int({ modelName: "Agenda", fieldName: "id", isId: true, isUnique: false, seq }),
        code: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Agenda", fieldName: "code", isId: false, isUnique: false, seq }),
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Agenda", fieldName: "name", isId: false, isUnique: false, seq })
    };
}
function defineAgendaFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Agenda", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateAgendaScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {};
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().agenda.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Agenda",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link Agenda} model.
 *
 * @param options
 * @returns factory {@link AgendaFactoryInterface}
 */
exports.defineAgendaFactory = ((options) => {
    return defineAgendaFactoryInternal(options ?? {}, {});
});
exports.defineAgendaFactory.withTransientFields = defaultTransientFieldValues => options => defineAgendaFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isAgendasOnUsersuserFactory(x) {
    return x?._factoryFor === "User";
}
function isAgendasOnUsersagendaFactory(x) {
    return x?._factoryFor === "Agenda";
}
function autoGenerateAgendasOnUsersScalarsOrEnums({ seq }) {
    return {};
}
function defineAgendasOnUsersFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("AgendasOnUsers", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateAgendasOnUsersScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isAgendasOnUsersuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                agenda: isAgendasOnUsersagendaFactory(defaultData.agenda) ? {
                    create: await defaultData.agenda.build()
                } : defaultData.agenda
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            userId: inputData.userId,
            agendaId: inputData.agendaId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().agendasOnUsers.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "AgendasOnUsers",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link AgendasOnUsers} model.
 *
 * @param options
 * @returns factory {@link AgendasOnUsersFactoryInterface}
 */
exports.defineAgendasOnUsersFactory = ((options) => {
    return defineAgendasOnUsersFactoryInternal(options, {});
});
exports.defineAgendasOnUsersFactory.withTransientFields = defaultTransientFieldValues => options => defineAgendasOnUsersFactoryInternal(options, defaultTransientFieldValues);
function isAgendasOnGroupsgroupFactory(x) {
    return x?._factoryFor === "Group";
}
function isAgendasOnGroupsagendaFactory(x) {
    return x?._factoryFor === "Agenda";
}
function autoGenerateAgendasOnGroupsScalarsOrEnums({ seq }) {
    return {};
}
function defineAgendasOnGroupsFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("AgendasOnGroups", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateAgendasOnGroupsScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                group: isAgendasOnGroupsgroupFactory(defaultData.group) ? {
                    create: await defaultData.group.build()
                } : defaultData.group,
                agenda: isAgendasOnGroupsagendaFactory(defaultData.agenda) ? {
                    create: await defaultData.agenda.build()
                } : defaultData.agenda
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            groupId: inputData.groupId,
            agendaId: inputData.agendaId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().agendasOnGroups.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "AgendasOnGroups",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link AgendasOnGroups} model.
 *
 * @param options
 * @returns factory {@link AgendasOnGroupsFactoryInterface}
 */
exports.defineAgendasOnGroupsFactory = ((options) => {
    return defineAgendasOnGroupsFactoryInternal(options, {});
});
exports.defineAgendasOnGroupsFactory.withTransientFields = defaultTransientFieldValues => options => defineAgendasOnGroupsFactoryInternal(options, defaultTransientFieldValues);
function isAgendasOnOrganizationsorganizationFactory(x) {
    return x?._factoryFor === "Organization";
}
function isAgendasOnOrganizationsagendaFactory(x) {
    return x?._factoryFor === "Agenda";
}
function autoGenerateAgendasOnOrganizationsScalarsOrEnums({ seq }) {
    return {};
}
function defineAgendasOnOrganizationsFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("AgendasOnOrganizations", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateAgendasOnOrganizationsScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                organization: isAgendasOnOrganizationsorganizationFactory(defaultData.organization) ? {
                    create: await defaultData.organization.build()
                } : defaultData.organization,
                agenda: isAgendasOnOrganizationsagendaFactory(defaultData.agenda) ? {
                    create: await defaultData.agenda.build()
                } : defaultData.agenda
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            organizationId: inputData.organizationId,
            agendaId: inputData.agendaId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().agendasOnOrganizations.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "AgendasOnOrganizations",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link AgendasOnOrganizations} model.
 *
 * @param options
 * @returns factory {@link AgendasOnOrganizationsFactoryInterface}
 */
exports.defineAgendasOnOrganizationsFactory = ((options) => {
    return defineAgendasOnOrganizationsFactoryInternal(options, {});
});
exports.defineAgendasOnOrganizationsFactory.withTransientFields = defaultTransientFieldValues => options => defineAgendasOnOrganizationsFactoryInternal(options, defaultTransientFieldValues);
function isAgendasOnEventseventFactory(x) {
    return x?._factoryFor === "Event";
}
function isAgendasOnEventsagendaFactory(x) {
    return x?._factoryFor === "Agenda";
}
function autoGenerateAgendasOnEventsScalarsOrEnums({ seq }) {
    return {};
}
function defineAgendasOnEventsFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("AgendasOnEvents", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateAgendasOnEventsScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                event: isAgendasOnEventseventFactory(defaultData.event) ? {
                    create: await defaultData.event.build()
                } : defaultData.event,
                agenda: isAgendasOnEventsagendaFactory(defaultData.agenda) ? {
                    create: await defaultData.agenda.build()
                } : defaultData.agenda
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            eventId: inputData.eventId,
            agendaId: inputData.agendaId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().agendasOnEvents.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "AgendasOnEvents",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link AgendasOnEvents} model.
 *
 * @param options
 * @returns factory {@link AgendasOnEventsFactoryInterface}
 */
exports.defineAgendasOnEventsFactory = ((options) => {
    return defineAgendasOnEventsFactoryInternal(options, {});
});
exports.defineAgendasOnEventsFactory.withTransientFields = defaultTransientFieldValues => options => defineAgendasOnEventsFactoryInternal(options, defaultTransientFieldValues);
function autoGenerateIssueCategoryScalarsOrEnums({ seq }) {
    return {
        id: (0, internal_1.getScalarFieldValueGenerator)().Int({ modelName: "IssueCategory", fieldName: "id", isId: true, isUnique: false, seq }),
        code: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "IssueCategory", fieldName: "code", isId: false, isUnique: false, seq }),
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "IssueCategory", fieldName: "name", isId: false, isUnique: false, seq })
    };
}
function defineIssueCategoryFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("IssueCategory", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateIssueCategoryScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {};
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().issueCategory.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "IssueCategory",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link IssueCategory} model.
 *
 * @param options
 * @returns factory {@link IssueCategoryFactoryInterface}
 */
exports.defineIssueCategoryFactory = ((options) => {
    return defineIssueCategoryFactoryInternal(options ?? {}, {});
});
exports.defineIssueCategoryFactory.withTransientFields = defaultTransientFieldValues => options => defineIssueCategoryFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isIssueCategoriesOnIssuesissueFactory(x) {
    return x?._factoryFor === "Issue";
}
function isIssueCategoriesOnIssuesissueCategoryFactory(x) {
    return x?._factoryFor === "IssueCategory";
}
function autoGenerateIssueCategoriesOnIssuesScalarsOrEnums({ seq }) {
    return {};
}
function defineIssueCategoriesOnIssuesFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("IssueCategoriesOnIssues", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateIssueCategoriesOnIssuesScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                issue: isIssueCategoriesOnIssuesissueFactory(defaultData.issue) ? {
                    create: await defaultData.issue.build()
                } : defaultData.issue,
                issueCategory: isIssueCategoriesOnIssuesissueCategoryFactory(defaultData.issueCategory) ? {
                    create: await defaultData.issueCategory.build()
                } : defaultData.issueCategory
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            issueId: inputData.issueId,
            issueCategoryId: inputData.issueCategoryId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().issueCategoriesOnIssues.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "IssueCategoriesOnIssues",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link IssueCategoriesOnIssues} model.
 *
 * @param options
 * @returns factory {@link IssueCategoriesOnIssuesFactoryInterface}
 */
exports.defineIssueCategoriesOnIssuesFactory = ((options) => {
    return defineIssueCategoriesOnIssuesFactoryInternal(options, {});
});
exports.defineIssueCategoriesOnIssuesFactory.withTransientFields = defaultTransientFieldValues => options => defineIssueCategoriesOnIssuesFactoryInternal(options, defaultTransientFieldValues);
function isIssueCategoriesOnUsersuserFactory(x) {
    return x?._factoryFor === "User";
}
function isIssueCategoriesOnUsersissueCategoryFactory(x) {
    return x?._factoryFor === "IssueCategory";
}
function autoGenerateIssueCategoriesOnUsersScalarsOrEnums({ seq }) {
    return {};
}
function defineIssueCategoriesOnUsersFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("IssueCategoriesOnUsers", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateIssueCategoriesOnUsersScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isIssueCategoriesOnUsersuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                issueCategory: isIssueCategoriesOnUsersissueCategoryFactory(defaultData.issueCategory) ? {
                    create: await defaultData.issueCategory.build()
                } : defaultData.issueCategory
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            userId: inputData.userId,
            issueCategoryId: inputData.issueCategoryId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().issueCategoriesOnUsers.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "IssueCategoriesOnUsers",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link IssueCategoriesOnUsers} model.
 *
 * @param options
 * @returns factory {@link IssueCategoriesOnUsersFactoryInterface}
 */
exports.defineIssueCategoriesOnUsersFactory = ((options) => {
    return defineIssueCategoriesOnUsersFactoryInternal(options, {});
});
exports.defineIssueCategoriesOnUsersFactory.withTransientFields = defaultTransientFieldValues => options => defineIssueCategoriesOnUsersFactoryInternal(options, defaultTransientFieldValues);
function autoGenerateSkillsetScalarsOrEnums({ seq }) {
    return {
        id: (0, internal_1.getScalarFieldValueGenerator)().Int({ modelName: "Skillset", fieldName: "id", isId: true, isUnique: false, seq }),
        code: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Skillset", fieldName: "code", isId: false, isUnique: false, seq }),
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Skillset", fieldName: "name", isId: false, isUnique: false, seq })
    };
}
function defineSkillsetFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Skillset", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateSkillsetScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {};
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().skillset.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Skillset",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link Skillset} model.
 *
 * @param options
 * @returns factory {@link SkillsetFactoryInterface}
 */
exports.defineSkillsetFactory = ((options) => {
    return defineSkillsetFactoryInternal(options ?? {}, {});
});
exports.defineSkillsetFactory.withTransientFields = defaultTransientFieldValues => options => defineSkillsetFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isSkillsetsOnUsersuserFactory(x) {
    return x?._factoryFor === "User";
}
function isSkillsetsOnUsersskillsetFactory(x) {
    return x?._factoryFor === "Skillset";
}
function autoGenerateSkillsetsOnUsersScalarsOrEnums({ seq }) {
    return {};
}
function defineSkillsetsOnUsersFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("SkillsetsOnUsers", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateSkillsetsOnUsersScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isSkillsetsOnUsersuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                skillset: isSkillsetsOnUsersskillsetFactory(defaultData.skillset) ? {
                    create: await defaultData.skillset.build()
                } : defaultData.skillset
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            userId: inputData.userId,
            skillsetId: inputData.skillsetId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().skillsetsOnUsers.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "SkillsetsOnUsers",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link SkillsetsOnUsers} model.
 *
 * @param options
 * @returns factory {@link SkillsetsOnUsersFactoryInterface}
 */
exports.defineSkillsetsOnUsersFactory = ((options) => {
    return defineSkillsetsOnUsersFactoryInternal(options, {});
});
exports.defineSkillsetsOnUsersFactory.withTransientFields = defaultTransientFieldValues => options => defineSkillsetsOnUsersFactoryInternal(options, defaultTransientFieldValues);
function isSkillsetsOnEventseventFactory(x) {
    return x?._factoryFor === "Event";
}
function isSkillsetsOnEventsskillsetFactory(x) {
    return x?._factoryFor === "Skillset";
}
function autoGenerateSkillsetsOnEventsScalarsOrEnums({ seq }) {
    return {};
}
function defineSkillsetsOnEventsFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("SkillsetsOnEvents", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateSkillsetsOnEventsScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                event: isSkillsetsOnEventseventFactory(defaultData.event) ? {
                    create: await defaultData.event.build()
                } : defaultData.event,
                skillset: isSkillsetsOnEventsskillsetFactory(defaultData.skillset) ? {
                    create: await defaultData.skillset.build()
                } : defaultData.skillset
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            eventId: inputData.eventId,
            skillsetId: inputData.skillsetId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().skillsetsOnEvents.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "SkillsetsOnEvents",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link SkillsetsOnEvents} model.
 *
 * @param options
 * @returns factory {@link SkillsetsOnEventsFactoryInterface}
 */
exports.defineSkillsetsOnEventsFactory = ((options) => {
    return defineSkillsetsOnEventsFactoryInternal(options, {});
});
exports.defineSkillsetsOnEventsFactory.withTransientFields = defaultTransientFieldValues => options => defineSkillsetsOnEventsFactoryInternal(options, defaultTransientFieldValues);
function isSkillsetsOnIssuesissueFactory(x) {
    return x?._factoryFor === "Issue";
}
function isSkillsetsOnIssuesskillsetFactory(x) {
    return x?._factoryFor === "Skillset";
}
function autoGenerateSkillsetsOnIssuesScalarsOrEnums({ seq }) {
    return {};
}
function defineSkillsetsOnIssuesFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("SkillsetsOnIssues", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateSkillsetsOnIssuesScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                issue: isSkillsetsOnIssuesissueFactory(defaultData.issue) ? {
                    create: await defaultData.issue.build()
                } : defaultData.issue,
                skillset: isSkillsetsOnIssuesskillsetFactory(defaultData.skillset) ? {
                    create: await defaultData.skillset.build()
                } : defaultData.skillset
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            issueId: inputData.issueId,
            skillsetId: inputData.skillsetId
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().skillsetsOnIssues.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "SkillsetsOnIssues",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link SkillsetsOnIssues} model.
 *
 * @param options
 * @returns factory {@link SkillsetsOnIssuesFactoryInterface}
 */
exports.defineSkillsetsOnIssuesFactory = ((options) => {
    return defineSkillsetsOnIssuesFactoryInternal(options, {});
});
exports.defineSkillsetsOnIssuesFactory.withTransientFields = defaultTransientFieldValues => options => defineSkillsetsOnIssuesFactoryInternal(options, defaultTransientFieldValues);
function isCitystateFactory(x) {
    return x?._factoryFor === "State";
}
function autoGenerateCityScalarsOrEnums({ seq }) {
    return {
        code: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "City", fieldName: "code", isId: true, isUnique: false, seq }),
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "City", fieldName: "name", isId: false, isUnique: false, seq })
    };
}
function defineCityFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("City", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCityScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
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
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            code: inputData.code
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().city.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "City",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link City} model.
 *
 * @param options
 * @returns factory {@link CityFactoryInterface}
 */
exports.defineCityFactory = ((options) => {
    return defineCityFactoryInternal(options, {});
});
exports.defineCityFactory.withTransientFields = defaultTransientFieldValues => options => defineCityFactoryInternal(options, defaultTransientFieldValues);
function autoGenerateStateScalarsOrEnums({ seq }) {
    return {
        code: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "State", fieldName: "code", isId: true, isUnique: false, seq }),
        countryCode: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "State", fieldName: "countryCode", isId: true, isUnique: false, seq }),
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "State", fieldName: "name", isId: false, isUnique: false, seq })
    };
}
function defineStateFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("State", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateStateScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {};
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            code: inputData.code,
            countryCode: inputData.countryCode
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().state.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "State",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link State} model.
 *
 * @param options
 * @returns factory {@link StateFactoryInterface}
 */
exports.defineStateFactory = ((options) => {
    return defineStateFactoryInternal(options ?? {}, {});
});
exports.defineStateFactory.withTransientFields = defaultTransientFieldValues => options => defineStateFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isCitiesOnUsersuserFactory(x) {
    return x?._factoryFor === "User";
}
function isCitiesOnUserscityFactory(x) {
    return x?._factoryFor === "City";
}
function autoGenerateCitiesOnUsersScalarsOrEnums({ seq }) {
    return {};
}
function defineCitiesOnUsersFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("CitiesOnUsers", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCitiesOnUsersScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                user: isCitiesOnUsersuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                city: isCitiesOnUserscityFactory(defaultData.city) ? {
                    create: await defaultData.city.build()
                } : defaultData.city
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            userId: inputData.userId,
            cityCode: inputData.cityCode
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().citiesOnUsers.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "CitiesOnUsers",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link CitiesOnUsers} model.
 *
 * @param options
 * @returns factory {@link CitiesOnUsersFactoryInterface}
 */
exports.defineCitiesOnUsersFactory = ((options) => {
    return defineCitiesOnUsersFactoryInternal(options, {});
});
exports.defineCitiesOnUsersFactory.withTransientFields = defaultTransientFieldValues => options => defineCitiesOnUsersFactoryInternal(options, defaultTransientFieldValues);
function isCitiesOnGroupsgroupFactory(x) {
    return x?._factoryFor === "Group";
}
function isCitiesOnGroupscityFactory(x) {
    return x?._factoryFor === "City";
}
function autoGenerateCitiesOnGroupsScalarsOrEnums({ seq }) {
    return {};
}
function defineCitiesOnGroupsFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("CitiesOnGroups", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCitiesOnGroupsScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                group: isCitiesOnGroupsgroupFactory(defaultData.group) ? {
                    create: await defaultData.group.build()
                } : defaultData.group,
                city: isCitiesOnGroupscityFactory(defaultData.city) ? {
                    create: await defaultData.city.build()
                } : defaultData.city
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            groupId: inputData.groupId,
            cityCode: inputData.cityCode
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().citiesOnGroups.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "CitiesOnGroups",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link CitiesOnGroups} model.
 *
 * @param options
 * @returns factory {@link CitiesOnGroupsFactoryInterface}
 */
exports.defineCitiesOnGroupsFactory = ((options) => {
    return defineCitiesOnGroupsFactoryInternal(options, {});
});
exports.defineCitiesOnGroupsFactory.withTransientFields = defaultTransientFieldValues => options => defineCitiesOnGroupsFactoryInternal(options, defaultTransientFieldValues);
function isCitiesOnOrganizationsorganizationFactory(x) {
    return x?._factoryFor === "Organization";
}
function isCitiesOnOrganizationscityFactory(x) {
    return x?._factoryFor === "City";
}
function autoGenerateCitiesOnOrganizationsScalarsOrEnums({ seq }) {
    return {};
}
function defineCitiesOnOrganizationsFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("CitiesOnOrganizations", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCitiesOnOrganizationsScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                organization: isCitiesOnOrganizationsorganizationFactory(defaultData.organization) ? {
                    create: await defaultData.organization.build()
                } : defaultData.organization,
                city: isCitiesOnOrganizationscityFactory(defaultData.city) ? {
                    create: await defaultData.city.build()
                } : defaultData.city
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            organizationId: inputData.organizationId,
            cityCode: inputData.cityCode
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().citiesOnOrganizations.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "CitiesOnOrganizations",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link CitiesOnOrganizations} model.
 *
 * @param options
 * @returns factory {@link CitiesOnOrganizationsFactoryInterface}
 */
exports.defineCitiesOnOrganizationsFactory = ((options) => {
    return defineCitiesOnOrganizationsFactoryInternal(options, {});
});
exports.defineCitiesOnOrganizationsFactory.withTransientFields = defaultTransientFieldValues => options => defineCitiesOnOrganizationsFactoryInternal(options, defaultTransientFieldValues);
function isCitiesOnEventseventFactory(x) {
    return x?._factoryFor === "Event";
}
function isCitiesOnEventscityFactory(x) {
    return x?._factoryFor === "City";
}
function autoGenerateCitiesOnEventsScalarsOrEnums({ seq }) {
    return {};
}
function defineCitiesOnEventsFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("CitiesOnEvents", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCitiesOnEventsScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                event: isCitiesOnEventseventFactory(defaultData.event) ? {
                    create: await defaultData.event.build()
                } : defaultData.event,
                city: isCitiesOnEventscityFactory(defaultData.city) ? {
                    create: await defaultData.city.build()
                } : defaultData.city
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            eventId: inputData.eventId,
            cityCode: inputData.cityCode
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().citiesOnEvents.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "CitiesOnEvents",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link CitiesOnEvents} model.
 *
 * @param options
 * @returns factory {@link CitiesOnEventsFactoryInterface}
 */
exports.defineCitiesOnEventsFactory = ((options) => {
    return defineCitiesOnEventsFactoryInternal(options, {});
});
exports.defineCitiesOnEventsFactory.withTransientFields = defaultTransientFieldValues => options => defineCitiesOnEventsFactoryInternal(options, defaultTransientFieldValues);
function isCitiesOnIssuesissueFactory(x) {
    return x?._factoryFor === "Issue";
}
function isCitiesOnIssuescityFactory(x) {
    return x?._factoryFor === "City";
}
function autoGenerateCitiesOnIssuesScalarsOrEnums({ seq }) {
    return {};
}
function defineCitiesOnIssuesFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("CitiesOnIssues", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateCitiesOnIssuesScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                issue: isCitiesOnIssuesissueFactory(defaultData.issue) ? {
                    create: await defaultData.issue.build()
                } : defaultData.issue,
                city: isCitiesOnIssuescityFactory(defaultData.city) ? {
                    create: await defaultData.city.build()
                } : defaultData.city
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            issueId: inputData.issueId,
            cityCode: inputData.cityCode
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().citiesOnIssues.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "CitiesOnIssues",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link CitiesOnIssues} model.
 *
 * @param options
 * @returns factory {@link CitiesOnIssuesFactoryInterface}
 */
exports.defineCitiesOnIssuesFactory = ((options) => {
    return defineCitiesOnIssuesFactoryInternal(options, {});
});
exports.defineCitiesOnIssuesFactory.withTransientFields = defaultTransientFieldValues => options => defineCitiesOnIssuesFactoryInternal(options, defaultTransientFieldValues);
function autoGenerateIndexScalarsOrEnums({ seq }) {
    return {
        id: (0, internal_1.getScalarFieldValueGenerator)().Int({ modelName: "Index", fieldName: "id", isId: true, isUnique: false, seq }),
        code: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Index", fieldName: "code", isId: false, isUnique: false, seq }),
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Index", fieldName: "name", isId: false, isUnique: false, seq }),
        valueType: "INT"
    };
}
function defineIndexFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Index", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateIndexScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver ?? {});
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {};
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().index.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Index",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link Index} model.
 *
 * @param options
 * @returns factory {@link IndexFactoryInterface}
 */
exports.defineIndexFactory = ((options) => {
    return defineIndexFactoryInternal(options ?? {}, {});
});
exports.defineIndexFactory.withTransientFields = defaultTransientFieldValues => options => defineIndexFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isActivityStatViewactivityFactory(x) {
    return x?._factoryFor === "Activity";
}
function autoGenerateActivityStatViewScalarsOrEnums({ seq }) {
    return {
        isPublic: (0, internal_1.getScalarFieldValueGenerator)().Boolean({ modelName: "ActivityStatView", fieldName: "isPublic", isId: false, isUnique: false, seq }),
        startsAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "ActivityStatView", fieldName: "startsAt", isId: false, isUnique: false, seq }),
        endsAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "ActivityStatView", fieldName: "endsAt", isId: false, isUnique: false, seq }),
        userId: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "ActivityStatView", fieldName: "userId", isId: false, isUnique: false, seq }),
        eventId: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "ActivityStatView", fieldName: "eventId", isId: false, isUnique: false, seq }),
        totalMinutes: (0, internal_1.getScalarFieldValueGenerator)().Int({ modelName: "ActivityStatView", fieldName: "totalMinutes", isId: false, isUnique: false, seq })
    };
}
function defineActivityStatViewFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("ActivityStatView", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateActivityStatViewScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                activity: isActivityStatViewactivityFactory(defaultData.activity) ? {
                    create: await defaultData.activity.build()
                } : defaultData.activity
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().activityStatView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "ActivityStatView",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link ActivityStatView} model.
 *
 * @param options
 * @returns factory {@link ActivityStatViewFactoryInterface}
 */
exports.defineActivityStatViewFactory = ((options) => {
    return defineActivityStatViewFactoryInternal(options, {});
});
exports.defineActivityStatViewFactory.withTransientFields = defaultTransientFieldValues => options => defineActivityStatViewFactoryInternal(options, defaultTransientFieldValues);
function isEventStatVieweventFactory(x) {
    return x?._factoryFor === "Event";
}
function autoGenerateEventStatViewScalarsOrEnums({ seq }) {
    return {
        isPublic: (0, internal_1.getScalarFieldValueGenerator)().Boolean({ modelName: "EventStatView", fieldName: "isPublic", isId: false, isUnique: false, seq }),
        startsAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "EventStatView", fieldName: "startsAt", isId: false, isUnique: false, seq }),
        endsAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "EventStatView", fieldName: "endsAt", isId: false, isUnique: false, seq }),
        totalMinutes: (0, internal_1.getScalarFieldValueGenerator)().Int({ modelName: "EventStatView", fieldName: "totalMinutes", isId: false, isUnique: false, seq })
    };
}
function defineEventStatViewFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("EventStatView", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateEventStatViewScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                event: isEventStatVieweventFactory(defaultData.event) ? {
                    create: await defaultData.event.build()
                } : defaultData.event
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().eventStatView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "EventStatView",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link EventStatView} model.
 *
 * @param options
 * @returns factory {@link EventStatViewFactoryInterface}
 */
exports.defineEventStatViewFactory = ((options) => {
    return defineEventStatViewFactoryInternal(options, {});
});
exports.defineEventStatViewFactory.withTransientFields = defaultTransientFieldValues => options => defineEventStatViewFactoryInternal(options, defaultTransientFieldValues);
function isIssueStatViewissueFactory(x) {
    return x?._factoryFor === "Issue";
}
function autoGenerateIssueStatViewScalarsOrEnums({ seq }) {
    return {
        isPublic: (0, internal_1.getScalarFieldValueGenerator)().Boolean({ modelName: "IssueStatView", fieldName: "isPublic", isId: false, isUnique: false, seq }),
        startsAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "IssueStatView", fieldName: "startsAt", isId: false, isUnique: false, seq }),
        endsAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "IssueStatView", fieldName: "endsAt", isId: false, isUnique: false, seq }),
        totalMinutes: (0, internal_1.getScalarFieldValueGenerator)().Int({ modelName: "IssueStatView", fieldName: "totalMinutes", isId: false, isUnique: false, seq })
    };
}
function defineIssueStatViewFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("IssueStatView", modelFieldDefinitions);
        const handleAfterBuild = (0, internal_1.createCallbackChain)([
            onAfterBuild,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterBuild),
        ]);
        const handleBeforeCreate = (0, internal_1.createCallbackChain)([
            ...traitKeys.slice().reverse().map(traitKey => traitsDefs[traitKey]?.onBeforeCreate),
            onBeforeCreate,
        ]);
        const handleAfterCreate = (0, internal_1.createCallbackChain)([
            onAfterCreate,
            ...traitKeys.map(traitKey => traitsDefs[traitKey]?.onAfterCreate),
        ]);
        const build = async (inputData = {}) => {
            const seq = getSeq();
            const requiredScalarData = autoGenerateIssueStatViewScalarsOrEnums({ seq });
            const resolveValue = (0, internal_1.normalizeResolver)(defaultDataResolver);
            const [transientFields, filteredInputData] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const resolverInput = { seq, ...transientFields };
            const defaultData = await traitKeys.reduce(async (queue, traitKey) => {
                const acc = await queue;
                const resolveTraitValue = (0, internal_1.normalizeResolver)(traitsDefs[traitKey]?.data ?? {});
                const traitData = await resolveTraitValue(resolverInput);
                return {
                    ...acc,
                    ...traitData,
                };
            }, resolveValue(resolverInput));
            const defaultAssociations = {
                issue: isIssueStatViewissueFactory(defaultData.issue) ? {
                    create: await defaultData.issue.build()
                } : defaultData.issue
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            id: inputData.id
        });
        const create = async (inputData = {}) => {
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            const data = await build(inputData).then(screen);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().issueStatView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "IssueStatView",
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
    const useTraits = (name, ...names) => {
        return getFactoryWithTraits([name, ...names]);
    };
    return {
        ...factory,
        use: useTraits,
    };
}
/**
 * Define factory for {@link IssueStatView} model.
 *
 * @param options
 * @returns factory {@link IssueStatViewFactoryInterface}
 */
exports.defineIssueStatViewFactory = ((options) => {
    return defineIssueStatViewFactoryInternal(options, {});
});
exports.defineIssueStatViewFactory.withTransientFields = defaultTransientFieldValues => options => defineIssueStatViewFactoryInternal(options, defaultTransientFieldValues);
