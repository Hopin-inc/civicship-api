"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineEventStatViewFactory = exports.defineActivityStatViewFactory = exports.defineIndexFactory = exports.defineCitiesOnEventsFactory = exports.defineCitiesOnOrganizationsFactory = exports.defineCitiesOnGroupsFactory = exports.defineCitiesOnUsersFactory = exports.defineStateFactory = exports.defineCityFactory = exports.defineAgendasOnEventsFactory = exports.defineAgendasOnOrganizationsFactory = exports.defineAgendasOnGroupsFactory = exports.defineAgendasOnUsersFactory = exports.defineAgendaFactory = exports.defineTargetFactory = exports.defineCommentFactory = exports.defineLikeFactory = exports.defineEventsOnOrganizationsFactory = exports.defineEventsOnGroupsFactory = exports.defineEventFactory = exports.defineActivityFactory = exports.defineUsersOnOrganizationsFactory = exports.defineOrganizationFactory = exports.defineUsersOnGroupsFactory = exports.defineGroupFactory = exports.defineUserFactory = exports.initialize = exports.resetScalarFieldValueGenerator = exports.registerScalarFieldValueGenerator = exports.resetSequence = void 0;
const internal_1 = require("@quramy/prisma-fabbrica/lib/internal");
var internal_2 = require("@quramy/prisma-fabbrica/lib/internal");
Object.defineProperty(exports, "resetSequence", { enumerable: true, get: function () { return internal_2.resetSequence; } });
Object.defineProperty(exports, "registerScalarFieldValueGenerator", { enumerable: true, get: function () { return internal_2.registerScalarFieldValueGenerator; } });
Object.defineProperty(exports, "resetScalarFieldValueGenerator", { enumerable: true, get: function () { return internal_2.resetScalarFieldValueGenerator; } });
const initializer = (0, internal_1.createInitializer)();
const { getClient } = initializer;
exports.initialize = initializer.initialize;
const modelFieldDefinitions = [{
        name: "User",
        fields: [{
                name: "agendas",
                type: "AgendasOnUsers",
                relationName: "AgendasOnUsersToUser"
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
                name: "event",
                type: "Event",
                relationName: "ActivityToEvent"
            }, {
                name: "stat",
                type: "ActivityStatView",
                relationName: "ActivityToActivityStatView"
            }]
    }, {
        name: "Event",
        fields: [{
                name: "agendas",
                type: "AgendasOnEvents",
                relationName: "AgendasOnEventsToEvent"
            }, {
                name: "groups",
                type: "EventsOnGroups",
                relationName: "EventToEventsOnGroups"
            }, {
                name: "organizations",
                type: "EventsOnOrganizations",
                relationName: "EventToEventsOnOrganizations"
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
        name: "Like",
        fields: [{
                name: "user",
                type: "User",
                relationName: "LikeToUser"
            }, {
                name: "event",
                type: "Event",
                relationName: "EventToLike"
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
                name: "citiesOnEvents",
                type: "CitiesOnEvents",
                relationName: "CitiesOnEventsToCity"
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
    }];
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
function isActivityeventFactory(x) {
    return x?._factoryFor === "Event";
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
                user: isActivityuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                event: isActivityeventFactory(defaultData.event) ? {
                    create: await defaultData.event.build()
                } : defaultData.event,
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
    return defineActivityFactoryInternal(options, {});
});
exports.defineActivityFactory.withTransientFields = defaultTransientFieldValues => options => defineActivityFactoryInternal(options, defaultTransientFieldValues);
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
function isLikeuserFactory(x) {
    return x?._factoryFor === "User";
}
function isLikeeventFactory(x) {
    return x?._factoryFor === "Event";
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
                user: isLikeuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                event: isLikeeventFactory(defaultData.event) ? {
                    create: await defaultData.event.build()
                } : defaultData.event
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            userId: inputData.userId,
            eventId: inputData.eventId
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
    return defineLikeFactoryInternal(options, {});
});
exports.defineLikeFactory.withTransientFields = defaultTransientFieldValues => options => defineLikeFactoryInternal(options, defaultTransientFieldValues);
function isCommentuserFactory(x) {
    return x?._factoryFor === "User";
}
function isCommenteventFactory(x) {
    return x?._factoryFor === "Event";
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
                user: isCommentuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                event: isCommenteventFactory(defaultData.event) ? {
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
    return defineCommentFactoryInternal(options, {});
});
exports.defineCommentFactory.withTransientFields = defaultTransientFieldValues => options => defineCommentFactoryInternal(options, defaultTransientFieldValues);
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
function autoGenerateIndexScalarsOrEnums({ seq }) {
    return {
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
