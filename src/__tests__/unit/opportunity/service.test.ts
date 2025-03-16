// import { OpportunityCategory } from "@prisma/client";
import { IContext } from "@/types/server";
import OpportunityService from "@/app/opportunity/service";
import OpportunityRepository from "@/infra/repositories/opportunity";
import { GqlOpportunityUpdateContentInput } from "@/types/graphql";

jest.mock("@/infra/repositories/opportunity");

describe("OpportunityService", () => {
    let ctx: IContext;

    beforeEach(() => {
        ctx = { currentUser: { id: "test-user" } } as unknown as IContext;
        jest.clearAllMocks();
    });


    describe("deleteOpportunity", () => {
        it("should throw error if user is not logged in", async () => {
            ctx.currentUser = null;

            const opportunityId = "opportunity-id";
            const expectedError = "Unauthorized: User must be logged in";

            await expect(OpportunityService.deleteOpportunity(ctx, opportunityId))
                .rejects
                .toThrow(expectedError);
        });

        it("should delete an opportunity", async () => {
            const opportunityId = "1";
            const mockDeletedOpportunity = { id: "1", title: "Opportunity 1" };
            (OpportunityRepository.find as jest.Mock).mockResolvedValue(mockDeletedOpportunity);
            (OpportunityRepository.delete as jest.Mock).mockResolvedValue(mockDeletedOpportunity);

            const result = await OpportunityService.deleteOpportunity(ctx, opportunityId);

            expect(OpportunityRepository.find).toHaveBeenCalledWith(ctx, opportunityId);
            expect(OpportunityRepository.delete).toHaveBeenCalledWith(ctx, opportunityId);
            expect(result).toEqual(mockDeletedOpportunity);
        });
    });


    describe("setOpportunityStatus", () => {
        it("should throw error if opportunity is not found", async () => {
            const opportunityId = "non-existent-id";
            const status = "PUBLIC";
            const expectedError = `OpportunityNotFound: ID=${opportunityId}`;

            (OpportunityRepository.find as jest.Mock).mockResolvedValue(null); // 見つからない場合

            await expect(OpportunityService.setOpportunityStatus(ctx, opportunityId, status))
                .rejects
                .toThrow(expectedError);
        });

        it("should set opportunity status", async () => {
            const opportunityId = "1";
            const status = "PUBLIC";
            const mockOpportunity = { id: opportunityId, publishStatus: "DRAFT" };
            const mockUpdatedOpportunity = { ...mockOpportunity, publishStatus: status };

            (OpportunityRepository.find as jest.Mock).mockResolvedValue(mockOpportunity);  // 見つかった場合
            (OpportunityRepository.setStatus as jest.Mock).mockResolvedValue(mockUpdatedOpportunity);

            const result = await OpportunityService.setOpportunityStatus(ctx, opportunityId, status);

            expect(OpportunityRepository.find).toHaveBeenCalledWith(ctx, opportunityId);
            expect(OpportunityRepository.setStatus).toHaveBeenCalledWith(ctx, opportunityId, status);
            expect(result).toEqual(mockUpdatedOpportunity);
        });
    });

    describe("fetchPublicOpportunities", () => {
        it("should handle cursor pagination", async () => {
            const mockResult = [{ id: "2", title: "Opportunity 2" }];

            const result = await OpportunityService.fetchPublicOpportunities(ctx, {}, 10);

            expect(result).toEqual(mockResult);
        });
    });

    describe("findOpportunity", () => {
        it("should throw error if opportunity not found", async () => {
            const id = "non-existing-id";
            (OpportunityRepository.find as jest.Mock).mockResolvedValue(null);

            await expect(OpportunityService.findOpportunity(ctx, id)).rejects.toThrow("OpportunityNotFound: ID=non-existing-id");
        });
    });

    describe("updateOpportunityContent", () => {
        it("should throw error if opportunity not found", async () => {
            const id = "non-existing-id";
            const input: GqlOpportunityUpdateContentInput = {
                title: "Updated Opportunity",
                category: "QUEST",
                communityId: "",
                description: "",
                publishStatus: "PUBLIC",
                requireApproval: false
            };

            (OpportunityRepository.find as jest.Mock).mockResolvedValue(null);

            await expect(OpportunityService.updateOpportunityContent(ctx, id, input)).rejects.toThrow(`OpportunityNotFound: ID=${id}`);
        });
    });
});