import participationResolver from "@/presentation/graphql/resolvers/opportunity/participation";
import TestDataSourceHelper from "../../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { GqlCommunityCreateInput, GqlParticipationSetStatusInput } from "@/types/graphql";
import { OpportunityCategory, ParticipationStatus, PublishStatus } from "@prisma/client";

describe("Participation Integration Tests", () => {
    beforeEach(async () => {
        await TestDataSourceHelper.deleteAll();
        TestDataSourceHelper.disconnect();
    });

    afterAll(async () => {
        TestDataSourceHelper.disconnect();
    });

    it("should accept participation application", async () => {
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
        const memberWallet = await TestDataSourceHelper.findMemberWallet;
        expect(memberWallet).toBeDefined();

        // walletが作られた直後は、mv_current_pointsが作成されていない
        const memberCurrentPointActual = (await TestDataSourceHelper.findMemberWallet(userId))?.currentPointView?.currentPoint;
        expect(memberCurrentPointActual).not.toBeDefined;
    });
});
