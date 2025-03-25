import participationResolver from "@/presentation/graphql/resolvers/opportunity/participation";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { GqlCommunityCreateInput, GqlParticipationSetStatusInput } from "@/types/graphql";
import { OpportunityCategory, ParticipationStatus, PublishStatus, WalletType } from "@prisma/client";

describe("Participation Integration Tests", () => {
    beforeEach(async () => {
        await TestDataSourceHelper.deleteAll();
        TestDataSourceHelper.disconnect();
    });

    afterAll(async () => {
        TestDataSourceHelper.disconnect();
    });

    describe("accept participation application", () => {
        it("should create a member wallet if not existed", async () => {
            //////////////////////////////////////////////////
            // insert seed data
            //////////////////////////////////////////////////
            const name = "John Doe"
            const slug = "user-1-slug"
            const createUserInput = {
                name: name,
                slug: slug,
                image: undefined
            }
            const userInserted = await TestDataSourceHelper.create(createUserInput);
            const userId = userInserted.id;

            const ctx = { currentUser: { id: userId } } as unknown as IContext;

            const communityName = "community-1";
            const pointName = "community-1-point";

            const createCommunityInput: GqlCommunityCreateInput = {
                name: communityName,
                pointName: pointName,
                image: undefined,
                bio: undefined,
                establishedAt: undefined,
                website: undefined
            };
            const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
            const communityId = communityInserted.id;

            const createOpportunityInput = {
                category: OpportunityCategory.EVENT,
                description: "opportunity",
                publishStatus: PublishStatus.PUBLIC,
                requireApproval: true,
                title: "opportunity",
                community: { connect: { id: communityId } },
                createdByUser: { connect: { id: userId } },
            };
            const opportunityInserted = await TestDataSourceHelper.createOpportunity(createOpportunityInput);
            const opportunityId = opportunityInserted.id;

            const createParticipationInput = {
                status: ParticipationStatus.INVITED,
                community: { connect: { id: communityId } },
                user: { connect: { id: userId } },
                opportunity: { connect: { id: opportunityId } }
            }
            const participationInserted = await TestDataSourceHelper.createParticipation(createParticipationInput);
            const participationId = participationInserted.id;

            //////////////////////////////////////////////////
            // construct request
            //////////////////////////////////////////////////
            const input: GqlParticipationSetStatusInput = {
                communityId: communityId
            };

            //////////////////////////////////////////////////
            // execute
            //////////////////////////////////////////////////
            await participationResolver.Mutation.participationAcceptApplication(
                {},
                {
                    id: participationId,
                    input: input
                },
                ctx
            );

            //////////////////////////////////////////////////
            // assert result
            //////////////////////////////////////////////////
            const participationActual = await TestDataSourceHelper.findParticipationById(participationId);

            // 参加申請のステータスが ACCEPTED に変更されていること
            expect(participationActual?.status).toEqual(ParticipationStatus.PARTICIPATING);
            // member walletが作成されていること
            const memberWallet = await TestDataSourceHelper.findMemberWallet(userId);
            expect(memberWallet).toBeDefined();

            // walletが作られた直後は、mv_current_pointsが作成されていない
            const memberCurrentPointActual = (await TestDataSourceHelper.findMemberWallet(userId))?.currentPointView?.currentPoint;
            expect(memberCurrentPointActual).not.toBeDefined;
        });

        it("should not create a member wallet if existed", async () => {
            //////////////////////////////////////////////////
            // insert seed data
            //////////////////////////////////////////////////
            const name = "John Doe"
            const slug = "user-1-slug"
            const createUserInput = {
                name: name,
                slug: slug,
                image: undefined
            }
            const userInserted = await TestDataSourceHelper.create(createUserInput);
            const userId = userInserted.id;

            const ctx = { currentUser: { id: userId } } as unknown as IContext;

            const communityName = "community-1";
            const pointName = "community-1-point";

            const createCommunityInput: GqlCommunityCreateInput = {
                name: communityName,
                pointName: pointName,
                image: undefined,
                bio: undefined,
                establishedAt: undefined,
                website: undefined
            };
            const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
            const communityId = communityInserted.id;

            const createOpportunityInput = {
                category: OpportunityCategory.EVENT,
                description: "opportunity",
                publishStatus: PublishStatus.PUBLIC,
                requireApproval: true,
                title: "opportunity",
                community: { connect: { id: communityId } },
                createdByUser: { connect: { id: userId } },
            };
            const opportunityInserted = await TestDataSourceHelper.createOpportunity(createOpportunityInput);
            const opportunityId = opportunityInserted.id;

            const createParticipationInput = {
                status: ParticipationStatus.INVITED,
                community: { connect: { id: communityId } },
                user: { connect: { id: userId } },
                opportunity: { connect: { id: opportunityId } }
            }
            const participationInserted = await TestDataSourceHelper.createParticipation(createParticipationInput);
            const participationId = participationInserted.id;

            const createMemberWalletInput = {
                type: WalletType.MEMBER,
                community: { connect: { id: communityId } },
                user: { connect: { id: userId } },
            };
            const memberWalletInserted = await TestDataSourceHelper.createWallet(createMemberWalletInput);
            const memberWalletId = memberWalletInserted.id;

            //////////////////////////////////////////////////
            // construct request
            //////////////////////////////////////////////////
            const input: GqlParticipationSetStatusInput = {
                communityId: communityId
            };

            //////////////////////////////////////////////////
            // execute
            //////////////////////////////////////////////////
            await participationResolver.Mutation.participationAcceptApplication(
                {},
                {
                    id: participationId,
                    input: input
                },
                ctx
            );

            //////////////////////////////////////////////////
            // assert result
            //////////////////////////////////////////////////
            const participationActual = await TestDataSourceHelper.findParticipationById(participationId);

            // 参加申請のステータスが ACCEPTED に変更されていること
            expect(participationActual?.status).toEqual(ParticipationStatus.PARTICIPATING);
            // member walletのIDが、事前に作成されたものと一致すること
            const memberWallet = await TestDataSourceHelper.findMemberWallet(userId);
            expect(memberWallet?.id).toEqual(memberWalletId);
        });
    })

    describe("accept participation invitation", () => {
        it("should create a member wallet if not existed", async () => {
            //////////////////////////////////////////////////
            // insert seed data
            //////////////////////////////////////////////////
            const name = "Jane Doe"
            const slug = "user-2-slug"
            const createUserInput = {
                name: name,
                slug: slug,
                image: undefined
            }
            const userInserted = await TestDataSourceHelper.create(createUserInput);
            const userId = userInserted.id;

            const ctx = { currentUser: { id: userId } } as unknown as IContext;

            const communityName = "community-2";
            const pointName = "community-2-point";

            const createCommunityInput = {
                name: communityName,
                pointName: pointName,
                image: undefined,
                bio: undefined,
                establishedAt: undefined,
                website: undefined
            };
            const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
            const communityId = communityInserted.id;

            const createOpportunityInput = {
                category: OpportunityCategory.EVENT,
                description: "new opportunity",
                publishStatus: PublishStatus.PUBLIC,
                requireApproval: true,
                title: "new opportunity",
                community: { connect: { id: communityId } },
                createdByUser: { connect: { id: userId } },
            };
            const opportunityInserted = await TestDataSourceHelper.createOpportunity(createOpportunityInput);
            const opportunityId = opportunityInserted.id;

            const createParticipationInput = {
                status: ParticipationStatus.INVITED,
                community: { connect: { id: communityId } },
                user: { connect: { id: userId } },
                opportunity: { connect: { id: opportunityId } }
            }
            const participationInserted = await TestDataSourceHelper.createParticipation(createParticipationInput);
            const participationId = participationInserted.id;

            //////////////////////////////////////////////////
            // construct request
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // execute
            //////////////////////////////////////////////////
            await participationResolver.Mutation.participationAcceptMyInvitation(
                {},
                {
                    id: participationId,
                },
                ctx
            );

            //////////////////////////////////////////////////
            // assert result
            //////////////////////////////////////////////////
            const participationActual = await TestDataSourceHelper.findParticipationById(participationId);

            // 参加ステータスが INVITED から PARTICIPATING に変更されていること
            expect(participationActual?.status).toEqual(ParticipationStatus.PARTICIPATING);

            // member walletが作成されていること
            const memberWallet = await TestDataSourceHelper.findMemberWallet(userId);
            expect(memberWallet).toBeDefined();

            // walletが作られた直後は、mv_current_pointsが作成されていない
            const memberCurrentPointActual = (await TestDataSourceHelper.findMemberWallet(userId))?.currentPointView?.currentPoint;
            expect(memberCurrentPointActual).not.toBeDefined;
        });
        it("should not create a member wallet if existed", async () => {
            //////////////////////////////////////////////////
            // insert seed data
            //////////////////////////////////////////////////
            const name = "Jane Doe"
            const slug = "user-2-slug"
            const createUserInput = {
                name: name,
                slug: slug,
                image: undefined
            }
            const userInserted = await TestDataSourceHelper.create(createUserInput);
            const userId = userInserted.id;

            const ctx = { currentUser: { id: userId } } as unknown as IContext;

            const communityName = "community-2";
            const pointName = "community-2-point";

            const createCommunityInput = {
                name: communityName,
                pointName: pointName,
                image: undefined,
                bio: undefined,
                establishedAt: undefined,
                website: undefined
            };
            const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
            const communityId = communityInserted.id;

            const createOpportunityInput = {
                category: OpportunityCategory.EVENT,
                description: "new opportunity",
                publishStatus: PublishStatus.PUBLIC,
                requireApproval: true,
                title: "new opportunity",
                community: { connect: { id: communityId } },
                createdByUser: { connect: { id: userId } },
            };
            const opportunityInserted = await TestDataSourceHelper.createOpportunity(createOpportunityInput);
            const opportunityId = opportunityInserted.id;

            const createParticipationInput = {
                status: ParticipationStatus.INVITED,
                community: { connect: { id: communityId } },
                user: { connect: { id: userId } },
                opportunity: { connect: { id: opportunityId } }
            }
            const participationInserted = await TestDataSourceHelper.createParticipation(createParticipationInput);
            const participationId = participationInserted.id;

            const createMemberWalletInput = {
                type: WalletType.MEMBER,
                community: { connect: { id: communityId } },
                user: { connect: { id: userId } },
            };
            const memberWalletInserted = await TestDataSourceHelper.createWallet(createMemberWalletInput);
            const memberWalletId = memberWalletInserted.id;

            //////////////////////////////////////////////////
            // construct request
            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // execute
            //////////////////////////////////////////////////
            await participationResolver.Mutation.participationAcceptMyInvitation(
                {},
                {
                    id: participationId,
                },
                ctx
            );

            //////////////////////////////////////////////////
            // assert result
            //////////////////////////////////////////////////
            const participationActual = await TestDataSourceHelper.findParticipationById(participationId);

            // 参加ステータスが INVITED から PARTICIPATING に変更されていること
            expect(participationActual?.status).toEqual(ParticipationStatus.PARTICIPATING);

            // member walletのIDが、事前に作成されたものと一致すること
            const memberWallet = await TestDataSourceHelper.findMemberWallet(userId);
            expect(memberWallet?.id).toEqual(memberWalletId);
        });
    })

    describe("apply for opportunity", () => {
        it("should create a member wallet if not existed", async () => {
            //////////////////////////////////////////////////
            // insert seed data
            //////////////////////////////////////////////////
            const name = "John Doe"
            const slug = "user-1-slug"
            const createUserInput = {
                name: name,
                slug: slug,
                image: undefined
            }
            const userInserted = await TestDataSourceHelper.create(createUserInput);
            const userId = userInserted.id;

            const ctx = { currentUser: { id: userId } } as unknown as IContext;

            const communityName = "community-1";
            const pointName = "community-1-point";

            const createCommunityInput: GqlCommunityCreateInput = {
                name: communityName,
                pointName: pointName,
                image: undefined,
                bio: undefined,
                establishedAt: undefined,
                website: undefined
            };
            const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
            const communityId = communityInserted.id;

            const createOpportunityInput = {
                category: OpportunityCategory.EVENT,
                description: "opportunity",
                publishStatus: PublishStatus.PUBLIC,
                requireApproval: true,
                title: "opportunity",
                community: { connect: { id: communityId } },
                createdByUser: { connect: { id: userId } },
            };
            const opportunityInserted = await TestDataSourceHelper.createOpportunity(createOpportunityInput);
            const opportunityId = opportunityInserted.id;

            //////////////////////////////////////////////////
            // construct request
            //////////////////////////////////////////////////
            const input = {
                opportunityId: opportunityId
            };

            //////////////////////////////////////////////////
            // execute
            //////////////////////////////////////////////////
            await participationResolver.Mutation.participationApply(
                {},
                {
                    input: input
                },
                ctx
            );

            //////////////////////////////////////////////////
            // assert result
            //////////////////////////////////////////////////
            const participationsActual = await TestDataSourceHelper.findAllParticipation();

            // participationが作成されていること
            expect(participationsActual).toHaveLength(1)

            // member walletが作成されていること
            const memberWallet = await TestDataSourceHelper.findMemberWallet(userId);
            expect(memberWallet).toBeDefined();

            // walletが作られた直後は、mv_current_pointsが作成されていない
            const memberCurrentPointActual = (await TestDataSourceHelper.findMemberWallet(userId))?.currentPointView?.currentPoint;
            expect(memberCurrentPointActual).not.toBeDefined;
        });
    })
    it("should not create a member wallet if existed", async () => {
        //////////////////////////////////////////////////
        // insert seed data
        //////////////////////////////////////////////////
        const name = "John Doe"
        const slug = "user-1-slug"
        const createUserInput = {
            name: name,
            slug: slug,
            image: undefined
        }
        const userInserted = await TestDataSourceHelper.create(createUserInput);
        const userId = userInserted.id;

        const ctx = { currentUser: { id: userId } } as unknown as IContext;

        const communityName = "community-1";
        const pointName = "community-1-point";

        const createCommunityInput: GqlCommunityCreateInput = {
            name: communityName,
            pointName: pointName,
            image: undefined,
            bio: undefined,
            establishedAt: undefined,
            website: undefined
        };
        const communityInserted = await TestDataSourceHelper.createCommunity(createCommunityInput);
        const communityId = communityInserted.id;

        const createOpportunityInput = {
            category: OpportunityCategory.EVENT,
            description: "opportunity",
            publishStatus: PublishStatus.PUBLIC,
            requireApproval: true,
            title: "opportunity",
            community: { connect: { id: communityId } },
            createdByUser: { connect: { id: userId } },
        };
        const opportunityInserted = await TestDataSourceHelper.createOpportunity(createOpportunityInput);
        const opportunityId = opportunityInserted.id;

        const createMemberWalletInput = {
            type: WalletType.MEMBER,
            community: { connect: { id: communityId } },
            user: { connect: { id: userId } },
        };
        const memberWalletInserted = await TestDataSourceHelper.createWallet(createMemberWalletInput);
        const memberWalletId = memberWalletInserted.id;

        //////////////////////////////////////////////////
        // construct request
        //////////////////////////////////////////////////
        const input = {
            opportunityId: opportunityId
        };

        //////////////////////////////////////////////////
        // execute
        //////////////////////////////////////////////////
        await participationResolver.Mutation.participationApply(
            {},
            {
                input: input
            },
            ctx
        );

        //////////////////////////////////////////////////
        // assert result
        //////////////////////////////////////////////////
        const participationsActual = await TestDataSourceHelper.findAllParticipation();

        // participationが作成されていること
        expect(participationsActual).toHaveLength(1)

        // member walletのIDが、事前に作成されたものと一致すること
        const memberWallet = await TestDataSourceHelper.findMemberWallet(userId);
        expect(memberWallet?.id).toEqual(memberWalletId);
    });
});
