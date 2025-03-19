"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineAccumulatedPointViewFactory = exports.defineCurrentPointViewFactory = exports.defineUtilityFactory = exports.defineUserFactory = exports.defineIdentityFactory = exports.defineTransactionFactory = exports.defineTicketStatusHistoryFactory = exports.defineTicketFactory = exports.definePlaceFactory = exports.defineParticipationStatusHistoryFactory = exports.defineParticipationFactory = exports.defineOpportunitySlotFactory = exports.defineOpportunityInvitationHistoryFactory = exports.defineOpportunityInvitationFactory = exports.defineOpportunityFactory = exports.defineWalletFactory = exports.defineMembershipHistoryFactory = exports.defineMembershipFactory = exports.defineStateFactory = exports.defineCityFactory = exports.defineCommunityFactory = exports.defineArticleFactory = exports.initialize = exports.resetScalarFieldValueGenerator = exports.registerScalarFieldValueGenerator = exports.resetSequence = void 0;
const internal_1 = require("@quramy/prisma-fabbrica/lib/internal");
var internal_2 = require("@quramy/prisma-fabbrica/lib/internal");
Object.defineProperty(exports, "resetSequence", { enumerable: true, get: function () { return internal_2.resetSequence; } });
Object.defineProperty(exports, "registerScalarFieldValueGenerator", { enumerable: true, get: function () { return internal_2.registerScalarFieldValueGenerator; } });
Object.defineProperty(exports, "resetScalarFieldValueGenerator", { enumerable: true, get: function () { return internal_2.resetScalarFieldValueGenerator; } });
const initializer = (0, internal_1.createInitializer)();
const { getClient } = initializer;
exports.initialize = initializer.initialize;
const modelFieldDefinitions = [{
        name: "Article",
        fields: [{
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
        name: "Community",
        fields: [{
                name: "places",
                type: "Place",
                relationName: "CommunityToPlace"
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
        name: "State",
        fields: [{
                name: "cities",
                type: "City",
                relationName: "CityToState"
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
        name: "Opportunity",
        fields: [{
                name: "place",
                type: "Place",
                relationName: "OpportunityToPlace"
            }, {
                name: "community",
                type: "Community",
                relationName: "CommunityToOpportunity"
            }, {
                name: "createdByUser",
                type: "User",
                relationName: "OpportunityToUser"
            }, {
                name: "articles",
                type: "Article",
                relationName: "t_opportunities_on_articles"
            }, {
                name: "participations",
                type: "Participation",
                relationName: "OpportunityToParticipation"
            }, {
                name: "slots",
                type: "OpportunitySlot",
                relationName: "OpportunityToOpportunitySlot"
            }, {
                name: "invitations",
                type: "OpportunityInvitation",
                relationName: "OpportunityToOpportunityInvitation"
            }, {
                name: "requiredUtilities",
                type: "Utility",
                relationName: "OpportunityToUtility"
            }]
    }, {
        name: "OpportunityInvitation",
        fields: [{
                name: "opportunity",
                type: "Opportunity",
                relationName: "OpportunityToOpportunityInvitation"
            }, {
                name: "createdByUser",
                type: "User",
                relationName: "OpportunityInvitationToUser"
            }, {
                name: "histories",
                type: "OpportunityInvitationHistory",
                relationName: "OpportunityInvitationToOpportunityInvitationHistory"
            }]
    }, {
        name: "OpportunityInvitationHistory",
        fields: [{
                name: "invitation",
                type: "OpportunityInvitation",
                relationName: "OpportunityInvitationToOpportunityInvitationHistory"
            }, {
                name: "invitedUser",
                type: "User",
                relationName: "OpportunityInvitationHistoryToUser"
            }]
    }, {
        name: "OpportunitySlot",
        fields: [{
                name: "opportunity",
                type: "Opportunity",
                relationName: "OpportunityToOpportunitySlot"
            }, {
                name: "participations",
                type: "Participation",
                relationName: "OpportunitySlotToParticipation"
            }]
    }, {
        name: "Participation",
        fields: [{
                name: "user",
                type: "User",
                relationName: "ParticipationToUser"
            }, {
                name: "community",
                type: "Community",
                relationName: "CommunityToParticipation"
            }, {
                name: "opportunity",
                type: "Opportunity",
                relationName: "OpportunityToParticipation"
            }, {
                name: "opportunitySlot",
                type: "OpportunitySlot",
                relationName: "OpportunitySlotToParticipation"
            }, {
                name: "statusHistories",
                type: "ParticipationStatusHistory",
                relationName: "ParticipationToParticipationStatusHistory"
            }, {
                name: "transactions",
                type: "Transaction",
                relationName: "ParticipationToTransaction"
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
        name: "Place",
        fields: [{
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
                name: "createdByUser",
                type: "User",
                relationName: "TicketStatusHistoryToUser"
            }, {
                name: "transaction",
                type: "Transaction",
                relationName: "TicketStatusHistoryToTransaction"
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
                name: "ticketStatusHistory",
                type: "TicketStatusHistory",
                relationName: "TicketStatusHistoryToTransaction"
            }]
    }, {
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
                name: "memberships",
                type: "Membership",
                relationName: "MembershipToUser"
            }, {
                name: "membershipHistory",
                type: "MembershipHistory",
                relationName: "MembershipHistoryToUser"
            }, {
                name: "wallets",
                type: "Wallet",
                relationName: "UserToWallet"
            }, {
                name: "opportunitiesCreatedByMe",
                type: "Opportunity",
                relationName: "OpportunityToUser"
            }, {
                name: "opportunityInvitations",
                type: "OpportunityInvitation",
                relationName: "OpportunityInvitationToUser"
            }, {
                name: "opportunityInvitationHistories",
                type: "OpportunityInvitationHistory",
                relationName: "OpportunityInvitationHistoryToUser"
            }, {
                name: "participations",
                type: "Participation",
                relationName: "ParticipationToUser"
            }, {
                name: "participationStatusChangedByMe",
                type: "ParticipationStatusHistory",
                relationName: "ParticipationStatusHistoryToUser"
            }, {
                name: "articlesWrittenByMe",
                type: "Article",
                relationName: "t_author_users_on_articles"
            }, {
                name: "articlesAboutMe",
                type: "Article",
                relationName: "t_related_users_on_articles"
            }, {
                name: "ticketStatusChangedByMe",
                type: "TicketStatusHistory",
                relationName: "TicketStatusHistoryToUser"
            }]
    }, {
        name: "Utility",
        fields: [{
                name: "community",
                type: "Community",
                relationName: "CommunityToUtility"
            }, {
                name: "tickets",
                type: "Ticket",
                relationName: "TicketToUtility"
            }, {
                name: "requiredForOpportunities",
                type: "Opportunity",
                relationName: "OpportunityToUtility"
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
    }];
function isArticlecommunityFactory(x) {
    return x?._factoryFor === "Community";
}
function autoGenerateArticleScalarsOrEnums({ seq }) {
    return {
        title: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Article", fieldName: "title", isId: false, isUnique: false, seq }),
        introduction: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Article", fieldName: "introduction", isId: false, isUnique: false, seq }),
        category: "ACTIVITY_REPORT",
        body: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Article", fieldName: "body", isId: false, isUnique: false, seq }),
        publishedAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "Article", fieldName: "publishedAt", isId: false, isUnique: false, seq })
    };
}
function defineArticleFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Article", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateArticleScalarsOrEnums({ seq });
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
                community: isArticlecommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().article.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Article",
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
 * Define factory for {@link Article} model.
 *
 * @param options
 * @returns factory {@link ArticleFactoryInterface}
 */
exports.defineArticleFactory = ((options) => {
    return defineArticleFactoryInternal(options, {});
});
exports.defineArticleFactory.withTransientFields = defaultTransientFieldValues => options => defineArticleFactoryInternal(options, defaultTransientFieldValues);
function autoGenerateCommunityScalarsOrEnums({ seq }) {
    return {
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Community", fieldName: "name", isId: false, isUnique: false, seq }),
        pointName: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Community", fieldName: "pointName", isId: false, isUnique: false, seq })
    };
}
function defineCommunityFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Community", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateCommunityScalarsOrEnums({ seq });
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().community.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Community",
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
 * Define factory for {@link Community} model.
 *
 * @param options
 * @returns factory {@link CommunityFactoryInterface}
 */
exports.defineCommunityFactory = ((options) => {
    return defineCommunityFactoryInternal(options ?? {}, {});
});
exports.defineCommunityFactory.withTransientFields = defaultTransientFieldValues => options => defineCommunityFactoryInternal(options ?? {}, defaultTransientFieldValues);
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
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
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "State", fieldName: "name", isId: false, isUnique: false, seq }),
        countryCode: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "State", fieldName: "countryCode", isId: true, isUnique: false, seq })
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
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
function isMembershipuserFactory(x) {
    return x?._factoryFor === "User";
}
function isMembershipcommunityFactory(x) {
    return x?._factoryFor === "Community";
}
function autoGenerateMembershipScalarsOrEnums({ seq }) {
    return {
        status: "PENDING",
        reason: "CREATED_COMMUNITY"
    };
}
function defineMembershipFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Membership", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateMembershipScalarsOrEnums({ seq });
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
                user: isMembershipuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                community: isMembershipcommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            userId: inputData.userId,
            communityId: inputData.communityId
        });
        const create = async (inputData = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().membership.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Membership",
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
 * Define factory for {@link Membership} model.
 *
 * @param options
 * @returns factory {@link MembershipFactoryInterface}
 */
exports.defineMembershipFactory = ((options) => {
    return defineMembershipFactoryInternal(options, {});
});
exports.defineMembershipFactory.withTransientFields = defaultTransientFieldValues => options => defineMembershipFactoryInternal(options, defaultTransientFieldValues);
function isMembershipHistorymembershipFactory(x) {
    return x?._factoryFor === "Membership";
}
function isMembershipHistorycreatedByUserFactory(x) {
    return x?._factoryFor === "User";
}
function autoGenerateMembershipHistoryScalarsOrEnums({ seq }) {
    return {
        status: "PENDING",
        reason: "CREATED_COMMUNITY"
    };
}
function defineMembershipHistoryFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("MembershipHistory", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateMembershipHistoryScalarsOrEnums({ seq });
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
                membership: isMembershipHistorymembershipFactory(defaultData.membership) ? {
                    create: await defaultData.membership.build()
                } : defaultData.membership,
                createdByUser: isMembershipHistorycreatedByUserFactory(defaultData.createdByUser) ? {
                    create: await defaultData.createdByUser.build()
                } : defaultData.createdByUser
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().membershipHistory.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "MembershipHistory",
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
 * Define factory for {@link MembershipHistory} model.
 *
 * @param options
 * @returns factory {@link MembershipHistoryFactoryInterface}
 */
exports.defineMembershipHistoryFactory = ((options) => {
    return defineMembershipHistoryFactoryInternal(options, {});
});
exports.defineMembershipHistoryFactory.withTransientFields = defaultTransientFieldValues => options => defineMembershipHistoryFactoryInternal(options, defaultTransientFieldValues);
function isWalletcommunityFactory(x) {
    return x?._factoryFor === "Community";
}
function isWalletuserFactory(x) {
    return x?._factoryFor === "User";
}
function isWalletcurrentPointViewFactory(x) {
    return x?._factoryFor === "CurrentPointView";
}
function isWalletaccumulatedPointViewFactory(x) {
    return x?._factoryFor === "AccumulatedPointView";
}
function autoGenerateWalletScalarsOrEnums({ seq }) {
    return {};
}
function defineWalletFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Wallet", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateWalletScalarsOrEnums({ seq });
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().wallet.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Wallet",
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
 * Define factory for {@link Wallet} model.
 *
 * @param options
 * @returns factory {@link WalletFactoryInterface}
 */
exports.defineWalletFactory = ((options) => {
    return defineWalletFactoryInternal(options, {});
});
exports.defineWalletFactory.withTransientFields = defaultTransientFieldValues => options => defineWalletFactoryInternal(options, defaultTransientFieldValues);
function isOpportunityplaceFactory(x) {
    return x?._factoryFor === "Place";
}
function isOpportunitycommunityFactory(x) {
    return x?._factoryFor === "Community";
}
function isOpportunitycreatedByUserFactory(x) {
    return x?._factoryFor === "User";
}
function autoGenerateOpportunityScalarsOrEnums({ seq }) {
    return {
        title: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Opportunity", fieldName: "title", isId: false, isUnique: false, seq }),
        description: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Opportunity", fieldName: "description", isId: false, isUnique: false, seq }),
        category: "QUEST"
    };
}
function defineOpportunityFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Opportunity", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateOpportunityScalarsOrEnums({ seq });
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
                place: isOpportunityplaceFactory(defaultData.place) ? {
                    create: await defaultData.place.build()
                } : defaultData.place,
                community: isOpportunitycommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community,
                createdByUser: isOpportunitycreatedByUserFactory(defaultData.createdByUser) ? {
                    create: await defaultData.createdByUser.build()
                } : defaultData.createdByUser
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().opportunity.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Opportunity",
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
 * Define factory for {@link Opportunity} model.
 *
 * @param options
 * @returns factory {@link OpportunityFactoryInterface}
 */
exports.defineOpportunityFactory = ((options) => {
    return defineOpportunityFactoryInternal(options, {});
});
exports.defineOpportunityFactory.withTransientFields = defaultTransientFieldValues => options => defineOpportunityFactoryInternal(options, defaultTransientFieldValues);
function isOpportunityInvitationopportunityFactory(x) {
    return x?._factoryFor === "Opportunity";
}
function isOpportunityInvitationcreatedByUserFactory(x) {
    return x?._factoryFor === "User";
}
function autoGenerateOpportunityInvitationScalarsOrEnums({ seq }) {
    return {
        code: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "OpportunityInvitation", fieldName: "code", isId: false, isUnique: false, seq })
    };
}
function defineOpportunityInvitationFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("OpportunityInvitation", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateOpportunityInvitationScalarsOrEnums({ seq });
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
                opportunity: isOpportunityInvitationopportunityFactory(defaultData.opportunity) ? {
                    create: await defaultData.opportunity.build()
                } : defaultData.opportunity,
                createdByUser: isOpportunityInvitationcreatedByUserFactory(defaultData.createdByUser) ? {
                    create: await defaultData.createdByUser.build()
                } : defaultData.createdByUser
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().opportunityInvitation.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "OpportunityInvitation",
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
 * Define factory for {@link OpportunityInvitation} model.
 *
 * @param options
 * @returns factory {@link OpportunityInvitationFactoryInterface}
 */
exports.defineOpportunityInvitationFactory = ((options) => {
    return defineOpportunityInvitationFactoryInternal(options, {});
});
exports.defineOpportunityInvitationFactory.withTransientFields = defaultTransientFieldValues => options => defineOpportunityInvitationFactoryInternal(options, defaultTransientFieldValues);
function isOpportunityInvitationHistoryinvitationFactory(x) {
    return x?._factoryFor === "OpportunityInvitation";
}
function isOpportunityInvitationHistoryinvitedUserFactory(x) {
    return x?._factoryFor === "User";
}
function autoGenerateOpportunityInvitationHistoryScalarsOrEnums({ seq }) {
    return {};
}
function defineOpportunityInvitationHistoryFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("OpportunityInvitationHistory", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateOpportunityInvitationHistoryScalarsOrEnums({ seq });
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
                invitation: isOpportunityInvitationHistoryinvitationFactory(defaultData.invitation) ? {
                    create: await defaultData.invitation.build()
                } : defaultData.invitation,
                invitedUser: isOpportunityInvitationHistoryinvitedUserFactory(defaultData.invitedUser) ? {
                    create: await defaultData.invitedUser.build()
                } : defaultData.invitedUser
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().opportunityInvitationHistory.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "OpportunityInvitationHistory",
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
 * Define factory for {@link OpportunityInvitationHistory} model.
 *
 * @param options
 * @returns factory {@link OpportunityInvitationHistoryFactoryInterface}
 */
exports.defineOpportunityInvitationHistoryFactory = ((options) => {
    return defineOpportunityInvitationHistoryFactoryInternal(options, {});
});
exports.defineOpportunityInvitationHistoryFactory.withTransientFields = defaultTransientFieldValues => options => defineOpportunityInvitationHistoryFactoryInternal(options, defaultTransientFieldValues);
function isOpportunitySlotopportunityFactory(x) {
    return x?._factoryFor === "Opportunity";
}
function autoGenerateOpportunitySlotScalarsOrEnums({ seq }) {
    return {
        startsAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "OpportunitySlot", fieldName: "startsAt", isId: false, isUnique: false, seq }),
        endsAt: (0, internal_1.getScalarFieldValueGenerator)().DateTime({ modelName: "OpportunitySlot", fieldName: "endsAt", isId: false, isUnique: false, seq })
    };
}
function defineOpportunitySlotFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("OpportunitySlot", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateOpportunitySlotScalarsOrEnums({ seq });
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
                opportunity: isOpportunitySlotopportunityFactory(defaultData.opportunity) ? {
                    create: await defaultData.opportunity.build()
                } : defaultData.opportunity
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().opportunitySlot.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "OpportunitySlot",
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
 * Define factory for {@link OpportunitySlot} model.
 *
 * @param options
 * @returns factory {@link OpportunitySlotFactoryInterface}
 */
exports.defineOpportunitySlotFactory = ((options) => {
    return defineOpportunitySlotFactoryInternal(options ?? {}, {});
});
exports.defineOpportunitySlotFactory.withTransientFields = defaultTransientFieldValues => options => defineOpportunitySlotFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isParticipationuserFactory(x) {
    return x?._factoryFor === "User";
}
function isParticipationcommunityFactory(x) {
    return x?._factoryFor === "Community";
}
function isParticipationopportunityFactory(x) {
    return x?._factoryFor === "Opportunity";
}
function isParticipationopportunitySlotFactory(x) {
    return x?._factoryFor === "OpportunitySlot";
}
function autoGenerateParticipationScalarsOrEnums({ seq }) {
    return {
        status: "PENDING",
        eventType: "INVITATION",
        eventTrigger: "ISSUED"
    };
}
function defineParticipationFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Participation", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateParticipationScalarsOrEnums({ seq });
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
                user: isParticipationuserFactory(defaultData.user) ? {
                    create: await defaultData.user.build()
                } : defaultData.user,
                community: isParticipationcommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community,
                opportunity: isParticipationopportunityFactory(defaultData.opportunity) ? {
                    create: await defaultData.opportunity.build()
                } : defaultData.opportunity,
                opportunitySlot: isParticipationopportunitySlotFactory(defaultData.opportunitySlot) ? {
                    create: await defaultData.opportunitySlot.build()
                } : defaultData.opportunitySlot
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().participation.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Participation",
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
 * Define factory for {@link Participation} model.
 *
 * @param options
 * @returns factory {@link ParticipationFactoryInterface}
 */
exports.defineParticipationFactory = ((options) => {
    return defineParticipationFactoryInternal(options ?? {}, {});
});
exports.defineParticipationFactory.withTransientFields = defaultTransientFieldValues => options => defineParticipationFactoryInternal(options ?? {}, defaultTransientFieldValues);
function isParticipationStatusHistoryparticipationFactory(x) {
    return x?._factoryFor === "Participation";
}
function isParticipationStatusHistorycreatedByUserFactory(x) {
    return x?._factoryFor === "User";
}
function autoGenerateParticipationStatusHistoryScalarsOrEnums({ seq }) {
    return {
        status: "PENDING",
        eventType: "INVITATION",
        eventTrigger: "ISSUED"
    };
}
function defineParticipationStatusHistoryFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("ParticipationStatusHistory", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateParticipationStatusHistoryScalarsOrEnums({ seq });
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
                participation: isParticipationStatusHistoryparticipationFactory(defaultData.participation) ? {
                    create: await defaultData.participation.build()
                } : defaultData.participation,
                createdByUser: isParticipationStatusHistorycreatedByUserFactory(defaultData.createdByUser) ? {
                    create: await defaultData.createdByUser.build()
                } : defaultData.createdByUser
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().participationStatusHistory.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "ParticipationStatusHistory",
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
 * Define factory for {@link ParticipationStatusHistory} model.
 *
 * @param options
 * @returns factory {@link ParticipationStatusHistoryFactoryInterface}
 */
exports.defineParticipationStatusHistoryFactory = ((options) => {
    return defineParticipationStatusHistoryFactoryInternal(options, {});
});
exports.defineParticipationStatusHistoryFactory.withTransientFields = defaultTransientFieldValues => options => defineParticipationStatusHistoryFactoryInternal(options, defaultTransientFieldValues);
function isPlacecityFactory(x) {
    return x?._factoryFor === "City";
}
function isPlacecommunityFactory(x) {
    return x?._factoryFor === "Community";
}
function autoGeneratePlaceScalarsOrEnums({ seq }) {
    return {
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Place", fieldName: "name", isId: false, isUnique: false, seq }),
        address: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Place", fieldName: "address", isId: false, isUnique: false, seq }),
        latitude: (0, internal_1.getScalarFieldValueGenerator)().Decimal({ modelName: "Place", fieldName: "latitude", isId: false, isUnique: false, seq }),
        longitude: (0, internal_1.getScalarFieldValueGenerator)().Decimal({ modelName: "Place", fieldName: "longitude", isId: false, isUnique: false, seq }),
        isManual: (0, internal_1.getScalarFieldValueGenerator)().Boolean({ modelName: "Place", fieldName: "isManual", isId: false, isUnique: false, seq })
    };
}
function definePlaceFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Place", modelFieldDefinitions);
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
            const requiredScalarData = autoGeneratePlaceScalarsOrEnums({ seq });
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
                city: isPlacecityFactory(defaultData.city) ? {
                    create: await defaultData.city.build()
                } : defaultData.city,
                community: isPlacecommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().place.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Place",
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
 * Define factory for {@link Place} model.
 *
 * @param options
 * @returns factory {@link PlaceFactoryInterface}
 */
exports.definePlaceFactory = ((options) => {
    return definePlaceFactoryInternal(options, {});
});
exports.definePlaceFactory.withTransientFields = defaultTransientFieldValues => options => definePlaceFactoryInternal(options, defaultTransientFieldValues);
function isTicketwalletFactory(x) {
    return x?._factoryFor === "Wallet";
}
function isTicketutilityFactory(x) {
    return x?._factoryFor === "Utility";
}
function autoGenerateTicketScalarsOrEnums({ seq }) {
    return {};
}
function defineTicketFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Ticket", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateTicketScalarsOrEnums({ seq });
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
                wallet: isTicketwalletFactory(defaultData.wallet) ? {
                    create: await defaultData.wallet.build()
                } : defaultData.wallet,
                utility: isTicketutilityFactory(defaultData.utility) ? {
                    create: await defaultData.utility.build()
                } : defaultData.utility
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().ticket.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Ticket",
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
 * Define factory for {@link Ticket} model.
 *
 * @param options
 * @returns factory {@link TicketFactoryInterface}
 */
exports.defineTicketFactory = ((options) => {
    return defineTicketFactoryInternal(options, {});
});
exports.defineTicketFactory.withTransientFields = defaultTransientFieldValues => options => defineTicketFactoryInternal(options, defaultTransientFieldValues);
function isTicketStatusHistoryticketFactory(x) {
    return x?._factoryFor === "Ticket";
}
function isTicketStatusHistorycreatedByUserFactory(x) {
    return x?._factoryFor === "User";
}
function isTicketStatusHistorytransactionFactory(x) {
    return x?._factoryFor === "Transaction";
}
function autoGenerateTicketStatusHistoryScalarsOrEnums({ seq }) {
    return {};
}
function defineTicketStatusHistoryFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("TicketStatusHistory", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateTicketStatusHistoryScalarsOrEnums({ seq });
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
                ticket: isTicketStatusHistoryticketFactory(defaultData.ticket) ? {
                    create: await defaultData.ticket.build()
                } : defaultData.ticket,
                createdByUser: isTicketStatusHistorycreatedByUserFactory(defaultData.createdByUser) ? {
                    create: await defaultData.createdByUser.build()
                } : defaultData.createdByUser,
                transaction: isTicketStatusHistorytransactionFactory(defaultData.transaction) ? {
                    create: await defaultData.transaction.build()
                } : defaultData.transaction
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().ticketStatusHistory.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "TicketStatusHistory",
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
 * Define factory for {@link TicketStatusHistory} model.
 *
 * @param options
 * @returns factory {@link TicketStatusHistoryFactoryInterface}
 */
exports.defineTicketStatusHistoryFactory = ((options) => {
    return defineTicketStatusHistoryFactoryInternal(options, {});
});
exports.defineTicketStatusHistoryFactory.withTransientFields = defaultTransientFieldValues => options => defineTicketStatusHistoryFactoryInternal(options, defaultTransientFieldValues);
function isTransactionfromWalletFactory(x) {
    return x?._factoryFor === "Wallet";
}
function isTransactiontoWalletFactory(x) {
    return x?._factoryFor === "Wallet";
}
function isTransactionparticipationFactory(x) {
    return x?._factoryFor === "Participation";
}
function isTransactionticketStatusHistoryFactory(x) {
    return x?._factoryFor === "TicketStatusHistory";
}
function autoGenerateTransactionScalarsOrEnums({ seq }) {
    return {
        reason: "POINT_ISSUED",
        fromPointChange: (0, internal_1.getScalarFieldValueGenerator)().Int({ modelName: "Transaction", fieldName: "fromPointChange", isId: false, isUnique: false, seq }),
        toPointChange: (0, internal_1.getScalarFieldValueGenerator)().Int({ modelName: "Transaction", fieldName: "toPointChange", isId: false, isUnique: false, seq })
    };
}
function defineTransactionFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Transaction", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateTransactionScalarsOrEnums({ seq });
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
                fromWallet: isTransactionfromWalletFactory(defaultData.fromWallet) ? {
                    create: await defaultData.fromWallet.build()
                } : defaultData.fromWallet,
                toWallet: isTransactiontoWalletFactory(defaultData.toWallet) ? {
                    create: await defaultData.toWallet.build()
                } : defaultData.toWallet,
                participation: isTransactionparticipationFactory(defaultData.participation) ? {
                    create: await defaultData.participation.build()
                } : defaultData.participation,
                ticketStatusHistory: isTransactionticketStatusHistoryFactory(defaultData.ticketStatusHistory) ? {
                    create: await defaultData.ticketStatusHistory.build()
                } : defaultData.ticketStatusHistory
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().transaction.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Transaction",
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
 * Define factory for {@link Transaction} model.
 *
 * @param options
 * @returns factory {@link TransactionFactoryInterface}
 */
exports.defineTransactionFactory = ((options) => {
    return defineTransactionFactoryInternal(options ?? {}, {});
});
exports.defineTransactionFactory.withTransientFields = defaultTransientFieldValues => options => defineTransactionFactoryInternal(options ?? {}, defaultTransientFieldValues);
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
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
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "User", fieldName: "name", isId: false, isUnique: false, seq }),
        slug: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "User", fieldName: "slug", isId: false, isUnique: false, seq })
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
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
function isUtilitycommunityFactory(x) {
    return x?._factoryFor === "Community";
}
function autoGenerateUtilityScalarsOrEnums({ seq }) {
    return {
        name: (0, internal_1.getScalarFieldValueGenerator)().String({ modelName: "Utility", fieldName: "name", isId: false, isUnique: false, seq }),
        pointsRequired: (0, internal_1.getScalarFieldValueGenerator)().Int({ modelName: "Utility", fieldName: "pointsRequired", isId: false, isUnique: false, seq })
    };
}
function defineUtilityFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("Utility", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateUtilityScalarsOrEnums({ seq });
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
                community: isUtilitycommunityFactory(defaultData.community) ? {
                    create: await defaultData.community.build()
                } : defaultData.community
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
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().utility.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "Utility",
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
 * Define factory for {@link Utility} model.
 *
 * @param options
 * @returns factory {@link UtilityFactoryInterface}
 */
exports.defineUtilityFactory = ((options) => {
    return defineUtilityFactoryInternal(options, {});
});
exports.defineUtilityFactory.withTransientFields = defaultTransientFieldValues => options => defineUtilityFactoryInternal(options, defaultTransientFieldValues);
function isCurrentPointViewwalletFactory(x) {
    return x?._factoryFor === "Wallet";
}
function autoGenerateCurrentPointViewScalarsOrEnums({ seq }) {
    return {
        currentPoint: (0, internal_1.getScalarFieldValueGenerator)().Int({ modelName: "CurrentPointView", fieldName: "currentPoint", isId: false, isUnique: false, seq })
    };
}
function defineCurrentPointViewFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("CurrentPointView", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateCurrentPointViewScalarsOrEnums({ seq });
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
                wallet: isCurrentPointViewwalletFactory(defaultData.wallet) ? {
                    create: await defaultData.wallet.build()
                } : defaultData.wallet
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            walletId: inputData.walletId
        });
        const create = async (inputData = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().currentPointView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "CurrentPointView",
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
 * Define factory for {@link CurrentPointView} model.
 *
 * @param options
 * @returns factory {@link CurrentPointViewFactoryInterface}
 */
exports.defineCurrentPointViewFactory = ((options) => {
    return defineCurrentPointViewFactoryInternal(options, {});
});
exports.defineCurrentPointViewFactory.withTransientFields = defaultTransientFieldValues => options => defineCurrentPointViewFactoryInternal(options, defaultTransientFieldValues);
function isAccumulatedPointViewwalletFactory(x) {
    return x?._factoryFor === "Wallet";
}
function autoGenerateAccumulatedPointViewScalarsOrEnums({ seq }) {
    return {
        accumulatedPoint: (0, internal_1.getScalarFieldValueGenerator)().Int({ modelName: "AccumulatedPointView", fieldName: "accumulatedPoint", isId: false, isUnique: false, seq })
    };
}
function defineAccumulatedPointViewFactoryInternal({ defaultData: defaultDataResolver, onAfterBuild, onBeforeCreate, onAfterCreate, traits: traitsDefs = {} }, defaultTransientFieldValues) {
    const getFactoryWithTraits = (traitKeys = []) => {
        const seqKey = {};
        const getSeq = () => (0, internal_1.getSequenceCounter)(seqKey);
        const screen = (0, internal_1.createScreener)("AccumulatedPointView", modelFieldDefinitions);
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
            const requiredScalarData = autoGenerateAccumulatedPointViewScalarsOrEnums({ seq });
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
                wallet: isAccumulatedPointViewwalletFactory(defaultData.wallet) ? {
                    create: await defaultData.wallet.build()
                } : defaultData.wallet
            };
            const data = { ...requiredScalarData, ...defaultData, ...defaultAssociations, ...filteredInputData };
            await handleAfterBuild(data, transientFields);
            return data;
        };
        const buildList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => build(data)));
        const pickForConnect = (inputData) => ({
            walletId: inputData.walletId
        });
        const create = async (inputData = {}) => {
            const data = await build({ ...inputData }).then(screen);
            const [transientFields] = (0, internal_1.destructure)(defaultTransientFieldValues, inputData);
            await handleBeforeCreate(data, transientFields);
            const createdData = await getClient().accumulatedPointView.create({ data });
            await handleAfterCreate(createdData, transientFields);
            return createdData;
        };
        const createList = (...args) => Promise.all((0, internal_1.normalizeList)(...args).map(data => create(data)));
        const createForConnect = (inputData = {}) => create(inputData).then(pickForConnect);
        return {
            _factoryFor: "AccumulatedPointView",
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
 * Define factory for {@link AccumulatedPointView} model.
 *
 * @param options
 * @returns factory {@link AccumulatedPointViewFactoryInterface}
 */
exports.defineAccumulatedPointViewFactory = ((options) => {
    return defineAccumulatedPointViewFactoryInternal(options, {});
});
exports.defineAccumulatedPointViewFactory.withTransientFields = defaultTransientFieldValues => options => defineAccumulatedPointViewFactoryInternal(options, defaultTransientFieldValues);
