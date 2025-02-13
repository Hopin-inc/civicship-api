import ParticipationService from "@/domains/opportunity/subdomains/participation/service";
import ParticipationRepository from "@/domains/opportunity/subdomains/participation/repository";
import { IContext } from "@/types/server";
import { ParticipationUtils } from "@/domains/opportunity/subdomains/participation/utils";

jest.mock("@/domains/opportunity/subdomains/participation/repository");
jest.mock("@/prisma/client");
jest.mock("@/domains/opportunity/repository");
jest.mock("@/domains/opportunity/subdomains/participation/utils");

describe("ParticipationService", () => {
    let ctx: IContext;

    beforeEach(() => {
        ctx = { user: { id: "test-user" }, currentUser: { id: "test-user" } } as unknown as IContext;
        jest.clearAllMocks();
    });

    describe("fetchParticipations", () => {
        it("should return all participations", async () => {
            const mockParticipations = [{ id: "1", userId: "test-user", status: "APPLIED" }];
            (ParticipationRepository.query as jest.Mock).mockResolvedValue(mockParticipations);

            const result = await ParticipationService.fetchParticipations(ctx, {}, 10);
            expect(ParticipationRepository.query).toHaveBeenCalledWith(
                ctx,
                expect.objectContaining({}),
                expect.any(Array),
                10,
                undefined
            );
            expect(result).toEqual(mockParticipations);
        });
    });

    describe("findParticipation", () => {
        it("should return participation by id", async () => {
            const mockParticipation = { id: "1", userId: "test-user", status: "APPLIED" };
            (ParticipationRepository.find as jest.Mock).mockResolvedValue(mockParticipation);

            const result = await ParticipationService.findParticipation(ctx, "1");
            expect(ParticipationRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(result).toEqual(mockParticipation);
        });
    });

    describe("inviteParticipation", () => {
        it("should throw error if user is not logged in", async () => {
            ctx.currentUser = null;

            const expectedError = "Unauthorized: User must be logged in"
            await expect(ParticipationService.inviteParticipation(ctx, { opportunityId: "1", invitedUserId: "test-invitee" }))
                .rejects
                .toThrow(expectedError);
        });

        // TODO: mock prismaClient
        //     it("should throw error if opportunity not found", async () => {
        //         (OpportunityRepository.findWithTransaction as jest.Mock).mockResolvedValue(null);
        //         await expect(ParticipationService.inviteParticipation(ctx, { opportunityId: "1", invitedUserId: "test-invitee" }))
        //             .rejects
        //             .toThrow("OpportunityNotFound: ID=1");
        //     });

        //     it("should throw error if community not found", async () => {
        //         const mockOpportunity = { community: null };
        //         (OpportunityRepository.findWithTransaction as jest.Mock).mockResolvedValue(mockOpportunity);
        //         await expect(ParticipationService.inviteParticipation(ctx, { opportunityId: "1", invitedUserId: "test-invitee" }))
        //             .rejects
        //             .toThrow("CommunityNotFound: ID=null");
        //     });

        //     it("should successfully invite participation", async () => {
        //         const mockOpportunity = { community: { id: "community-id" } };
        //         (OpportunityRepository.findWithTransaction as jest.Mock).mockResolvedValue(mockOpportunity);
        //         (ParticipationRepository.createWithTransaction as jest.Mock).mockResolvedValue({ id: "1", status: "INVITED" });

        //         const result = await ParticipationService.inviteParticipation(ctx, { opportunityId: "1", invitedUserId: "test-invitee" });
        //         expect(result.status).toEqual("INVITED");
        //     });
    });

    describe("applyParticipation", () => {
        it("should throw error if user is not logged in", async () => {
            ctx.currentUser = null;

            const expectedError = "Unauthorized: User must be logged in"
            await expect(ParticipationService.applyParticipation(ctx, { opportunityId: "1" }))
                .rejects
                .toThrow(expectedError);
        });

        // it("should throw error if opportunity not found", async () => {
        //     (OpportunityRepository.findWithTransaction as jest.Mock).mockResolvedValue(null);
        //     await expect(ParticipationService.applyParticipation(ctx, { opportunityId: "1" }))
        //         .rejects
        //         .toThrow("OpportunityNotFound: ID=1");
        // });

        // it("should throw error if community not found", async () => {
        //     const mockOpportunity = { community: null };
        //     (OpportunityRepository.findWithTransaction as jest.Mock).mockResolvedValue(mockOpportunity);
        //     await expect(ParticipationService.applyParticipation(ctx, { opportunityId: "1" }))
        //         .rejects
        //         .toThrow("CommunityNotFound: ID=null");
        // });

        // it("should successfully apply for participation", async () => {
        //     const mockOpportunity = { community: { id: "community-id" }, requireApproval: false };
        //     (OpportunityRepository.findWithTransaction as jest.Mock).mockResolvedValue(mockOpportunity);
        //     (ParticipationRepository.createWithTransaction as jest.Mock).mockResolvedValue({ id: "1", status: "PARTICIPATING" });

        //     const result = await ParticipationService.applyParticipation(ctx, { opportunityId: "1" });
        //     expect(result.status).toEqual("PARTICIPATING");
        // });
    });

    describe("cancelInvitation", () => {
        it("should successfully cancel invitation", async () => {
            (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
            const result = await ParticipationService.cancelInvitation(ctx, "1");
            expect(result).toBe(true);
        });
    });

    describe("approveInvitation", () => {
        it("should successfully approve invitation", async () => {
            (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
            const result = await ParticipationService.approveInvitation(ctx, "1");
            expect(result).toBe(true);
        });
    });

    describe("denyInvitation", () => {
        it("should successfully deny invitation", async () => {
            (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
            const result = await ParticipationService.denyInvitation(ctx, "1");
            expect(result).toBe(true);
        });
    });

    describe("cancelApplication", () => {
        it("should successfully cancel application", async () => {
            (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
            const result = await ParticipationService.cancelApplication(ctx, "1");
            expect(result).toBe(true);
        });
    });

    describe("approveApplication", () => {
        it("should successfully approve application", async () => {
            (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
            const result = await ParticipationService.approveApplication(ctx, "1");
            expect(result).toBe(true);
        });
    });

    describe("denyApplication", () => {
        it("should successfully deny application", async () => {
            (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
            const result = await ParticipationService.denyApplication(ctx, "1");
            expect(result).toBe(true);
        });
    });

    describe("approvePerformance", () => {
        it("should successfully approve performance", async () => {
            (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
            const result = await ParticipationService.approvePerformance(ctx, "1");
            expect(result).toBe(true);
        });
    });

    describe("denyPerformance", () => {
        it("should successfully deny performance", async () => {
            (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
            const result = await ParticipationService.denyPerformance(ctx, "1");
            expect(result).toBe(true);
        });
    });
});
