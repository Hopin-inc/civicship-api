import ParticipationService from "@/domains/opportunity/subdomains/participation/service";
import ParticipationRepository from "@/domains/opportunity/subdomains/participation/repository";
import { IContext } from "@/types/server";

jest.mock("@/domains/opportunity/subdomains/participation/repository");

describe("ParticipationService", () => {
    let ctx: IContext;

    beforeEach(() => {
        ctx = { user: { id: "test-user" } } as unknown as IContext;
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

});