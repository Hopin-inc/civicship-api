import ParticipationService from "@/app/opportunity/participation/service";
import ParticipationRepository from "@/infra/repositories/opportunity/participation";
import { IContext } from "@/types/server";
import ParticipationUtils from "@/app/opportunity/participation/utils";

jest.mock("@/infra/repositories/opportunity/participation");
jest.mock("@/infra/repositories/opportunity");
jest.mock("@/app/opportunity/participation/utils");

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
        // TODO
    });

    describe("applyParticipation", () => {
        // TODO
    });

    describe("cancelInvitation", () => {
        it("should successfully cancel invitation", async () => {
            (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
            const result = await ParticipationService.cancelInvitation(ctx, "1");
            expect(result).toBe(true);
        });
    });

    describe("approveInvitation", () => {
        // TODO
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
        // TODO
    });

    describe("denyApplication", () => {
        it("should successfully deny application", async () => {
            (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
            const result = await ParticipationService.denyApplication(ctx, "1");
            expect(result).toBe(true);
        });
    });

    describe("approvePerformance", () => {
        // TODO
    });

    describe("denyPerformance", () => {
        it("should successfully deny performance", async () => {
            (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
            const result = await ParticipationService.denyPerformance(ctx, "1");
            expect(result).toBe(true);
        });
    });
});
