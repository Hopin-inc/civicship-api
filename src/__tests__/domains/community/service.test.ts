import CommunityService from "@/app/community/service";
import CommunityRepository from "@/infra/repositories/community";
import { IContext } from "@/types/server";

jest.mock("@/infra/repositories/community");
jest.mock("@/infra/repositories/transaction");

describe("CommunityService", () => {
    let ctx: IContext;

    beforeEach(() => {
        ctx = { currentUser: { id: "test-user" } } as unknown as IContext;
        jest.clearAllMocks();
    });

    describe("getCommunityById", () => {
        it("should return community by id", async () => {
            const mockCommunity = {
                id: "community-1",
                name: "Test Community",
                pointName: "Test Points",
            };
            (CommunityRepository.find as jest.Mock).mockResolvedValue(mockCommunity);

            const result = await CommunityService.findCommunity(ctx, "community-1");
            expect(CommunityRepository.find).toHaveBeenCalledWith(ctx, "community-1");
            expect(result).toEqual(mockCommunity);
        });
    });

    describe("createCommunity", () => {
        //     it("should throw error if user is not logged in", async () => {
        //         ctx.currentUser = null;

        //         const input = {
        //             bio: undefined,
        //             cityCode: "CITY_1",
        //             establishedAt: undefined,
        //             image: undefined,
        //             name: "community-1",
        //             pointName: "point-1",
        //             stateCode: "STATE_1",
        //             website: undefined
        //         };

        //         const mockCommunity = { id: "community-1", ...input };
        //         (CommunityRepository.create as jest.Mock).mockResolvedValue(mockCommunity);

        //         const expectedError = "Unauthorized: User must be logged in";
        //         await expect(CommunityService.createCommunity(ctx, input))
        //             .rejects
        //             .toThrow(expectedError);
        //     });
    });

    describe("updateCommunityProfile", () => {
        // it("should throw error if community is not found", async () => {
        //     const updateInput = {
        //         name: "Updated Community",
        //         pointName: "Updated Points",
        //     };

        //     const communityId = "community-1";

        //     (CommunityRepository.find as jest.Mock).mockResolvedValue(null);

        //     const expectedError = `CommunityNotFound: ID=${communityId}`;
        //     await expect(CommunityService.updateCommunityProfile(ctx, communityId, updateInput))
        //         .rejects
        //         .toThrow(expectedError);
        // });

        // it("should update an existing community", async () => {
        //     const updateInput = {
        //         name: "Updated Community",
        //         pointName: "Updated Points",
        //     };

        //     const communityId = "community-1";
        //     const mockCommunity = { id: communityId, ...updateInput };

        //     (CommunityRepository.find as jest.Mock).mockResolvedValue(mockCommunity);
        //     (CommunityRepository.update as jest.Mock).mockResolvedValue(mockCommunity);

        //     const result = await CommunityService.updateCommunityProfile(ctx, communityId, updateInput);

        //     expect(CommunityRepository.find).toHaveBeenCalledWith(ctx, communityId);
        //     expect(CommunityRepository.update).toHaveBeenCalledWith(ctx, communityId, expect.objectContaining(updateInput));
        //     expect(result).toEqual(mockCommunity);
        // });
    });


    describe("deleteCommunity", () => {
        // it("should throw error if user is not logged in", async () => {
        //     ctx.currentUser = null;

        //     const communityId = "community-1";

        //     const expectedError = "Unauthorized: User must be logged in";
        //     await expect(CommunityService.deleteCommunity(ctx, communityId))
        //         .rejects
        //         .toThrow(expectedError);
        // });

        it("should throw error if community is not found", async () => {
            const communityId = "community-1";

            (CommunityRepository.find as jest.Mock).mockResolvedValue(null);

            const expectedError = `CommunityNotFound: ID=${communityId}`;
            await expect(CommunityService.deleteCommunity(ctx, communityId))
                .rejects
                .toThrow(expectedError);
        });

        it("should delete a community", async () => {
            const communityId = "community-1";

            const mockCommunity = { id: communityId, name: "Test Community", pointName: "Test Points" };
            (CommunityRepository.find as jest.Mock).mockResolvedValue(mockCommunity);
            (CommunityRepository.delete as jest.Mock).mockResolvedValue(mockCommunity);

            await CommunityService.deleteCommunity(ctx, communityId);

            expect(CommunityRepository.delete).toHaveBeenCalledWith(ctx, communityId);
        });
    });
});
