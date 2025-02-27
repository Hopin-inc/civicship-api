// import { OpportunityCategory } from "@prisma/client";
import { IContext } from "@/types/server";
import OpportunityService from "@/app/opportunity/service";
import OpportunityRepository from "@/infra/repositories/opportunity";

jest.mock("@/infra/repositories/opportunity");

describe("OpportunityService", () => {
    let ctx: IContext;

    beforeEach(() => {
        ctx = { currentUser: { id: "test-user" } } as unknown as IContext;
        jest.clearAllMocks();
    });

    describe("createOpportunity", () => {
        // it("should throw error if user is not logged in", async () => {
        //     ctx.currentUser = null;

        //     const input = {
        //         title: "New Opportunity",
        //         category: OpportunityCategory.EVENT,
        //         cityCode: "NYC",
        //         communityId: "community-id",
        //         pointsPerParticipation: 10
        //     };

        //     const expectedError = "Unauthorized: User must be logged in";

        //     await expect(OpportunityService.createOpportunity(ctx, input))
        //         .rejects
        //         .toThrow(expectedError);
        // });

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

        describe("editOpportunityContent", () => {
            // it("should throw error if opportunity is not found", async () => {
            //     const opportunityId = "non-existent-id";
            //     const input = { title: "Updated Opportunity" };
            //     const expectedError = `OpportunityNotFound: ID=${opportunityId}`;

            //     (OpportunityRepository.find as jest.Mock).mockResolvedValue(null); // 見つからない場合

            //     await expect(OpportunityService.editOpportunityContent(ctx, opportunityId, input))
            //         .rejects
            //         .toThrow(expectedError);
            // });

            // it("should update opportunity content", async () => {
            //     const opportunityId = "1";
            //     const input = { title: "Updated Opportunity" };
            //     const mockOpportunity = { id: opportunityId, title: "Original Opportunity" };
            //     const mockUpdatedOpportunity = { ...mockOpportunity, ...input };

            //     (OpportunityRepository.find as jest.Mock).mockResolvedValue(mockOpportunity);  // 見つかった場合
            //     (OpportunityRepository.update as jest.Mock).mockResolvedValue(mockUpdatedOpportunity);

            //     const result = await OpportunityService.editOpportunityContent(ctx, opportunityId, input);

            //     expect(OpportunityRepository.find).toHaveBeenCalledWith(ctx, opportunityId);
            //     expect(OpportunityRepository.update).toHaveBeenCalledWith(ctx, opportunityId, expect.any(Object));  // 入力データを含んだオブジェクト
            //     expect(result).toEqual(mockUpdatedOpportunity);
            // });
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
    });
});