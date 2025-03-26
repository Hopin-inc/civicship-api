// import ParticipationService from "@/app/opportunity/participation/service";
// import ParticipationRepository from "@/infra/repositories/opportunity/participation";
// import { IContext } from "@/types/server";
// import ParticipationUtils from "@/app/opportunity/participation/utils";
// import ParticipationStatusHistoryService from "@/app/opportunity/participation/statusHistory/service";
// import { ParticipationStatus } from "@prisma/client";
//
// jest.mock("@/infra/repositories/opportunity/participation");
// jest.mock("@/infra/repositories/opportunity");
// jest.mock("@/app/opportunity/participation/statusHistory/service");
// jest.mock("@/app/opportunity/participation/utils");
//
// describe("ParticipationService", () => {
//     let ctx: IContext;
//     const userId = "test-user"
//
//     beforeEach(() => {
//         ctx = { user: { id: "test-user" }, currentUser: { id: "test-user" } } as unknown as IContext;
//         jest.clearAllMocks();
//     });
//
//     describe("fetchParticipations", () => {
//         it("should return all participations", async () => {
//             const mockParticipations = [{ id: "1", userId: "test-user", status: "APPLIED" }];
//             (ParticipationRepository.query as jest.Mock).mockResolvedValue(mockParticipations);
//
//             const result = await ParticipationService.fetchParticipations(ctx, {}, 10);
//             expect(ParticipationRepository.query).toHaveBeenCalledWith(
//                 ctx,
//                 expect.objectContaining({}),
//                 expect.any(Array),
//                 10,
//                 undefined
//             );
//             expect(result).toEqual(mockParticipations);
//         });
//     });
//
//     describe("findParticipation", () => {
//         it("should return participation by id", async () => {
//             const mockParticipation = { id: "1", userId: "test-user", status: "APPLIED" };
//             (ParticipationRepository.find as jest.Mock).mockResolvedValue(mockParticipation);
//
//             const result = await ParticipationService.findParticipation(ctx, "1");
//             expect(ParticipationRepository.find).toHaveBeenCalledWith(ctx, "1");
//             expect(result).toEqual(mockParticipation);
//         });
//     });
//
//     describe("inviteParticipation", () => {
//         it("should successfully invite participation", async () => {
//             const mockParticipation = { id: "1", userId: userId, status: ParticipationStatus.INVITED };
//             const input = { communityId: "community-1", invitedUserId: userId, opportunityId: "opportunity-1" };
//
//             (ParticipationRepository.create as jest.Mock).mockResolvedValue(mockParticipation);
//             (ParticipationStatusHistoryService.recordParticipationHistory as jest.Mock).mockResolvedValue({});
//
//             const result = await ParticipationService.inviteParticipation(ctx, input);
//             expect(result).toEqual(mockParticipation);
//             expect(ParticipationRepository.create).toHaveBeenCalledWith(
//                 ctx,
//                 expect.objectContaining({ status: ParticipationStatus.INVITED }),
//                 expect.anything()
//             );
//         });
//     });
//
//     describe("cancelInvitation", () => {
//         it("should successfully cancel invitation", async () => {
//             (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
//             const result = await ParticipationService.cancelInvitation(ctx, "1");
//             expect(result).toBe(true);
//         });
//     });
//
//     describe("denyInvitation", () => {
//         it("should successfully deny invitation", async () => {
//             (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
//             const result = await ParticipationService.denyInvitation(ctx, "1");
//             expect(result).toBe(true);
//         });
//     });
//
//     describe("cancelApplication", () => {
//         it("should successfully cancel application", async () => {
//             (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
//             const result = await ParticipationService.cancelApplication(ctx, "1");
//             expect(result).toBe(true);
//         });
//     });
//
//     describe("denyApplication", () => {
//         it("should successfully deny application", async () => {
//             (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
//             const result = await ParticipationService.denyApplication(ctx, "1");
//             expect(result).toBe(true);
//         });
//     });
//
//     describe("denyPerformance", () => {
//         it("should successfully deny performance", async () => {
//             (ParticipationUtils.setParticipationStatus as jest.Mock).mockResolvedValue(true);
//             const result = await ParticipationService.denyPerformance(ctx, "1");
//             expect(result).toBe(true);
//         });
//     });
// });
