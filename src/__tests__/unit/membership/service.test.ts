import MembershipService from "@/app/membership/service";
import MembershipRepository from "@/infra/repositories/membership";
import MembershipUtils from "@/app/membership/utils";
import { MembershipStatus, Role } from "@prisma/client";
import { getCurrentUserId } from "@/utils";

jest.mock("@/infra/repositories/membership");
jest.mock("@/app/membership/utils");
jest.mock("@/utils", () => ({
    getCurrentUserId: jest.fn(),
}));

describe("MembershipService", () => {
    const mockCtx = {} as any;
    const mockTx = {} as any;
    const userId = "user123";
    const communityId = "community123";


    // describe("fetchMemberships", () => {
    //     it("should call MembershipRepository.query", async () => {
    //     });
    //   });


    describe("findMembership", () => {
        it("should return a membership if found", async () => {
            const mockMembership = { userId, communityId, status: MembershipStatus.JOINED };
            (MembershipRepository.find as jest.Mock).mockResolvedValue(mockMembership);

            const result = await MembershipService.findMembership(mockCtx, userId, communityId);

            expect(result).toEqual(mockMembership);
            expect(MembershipRepository.find).toHaveBeenCalledWith(mockCtx, { userId_communityId: { userId, communityId } });
        });
    });

    describe("inviteMember", () => {
        it("should create a new membership", async () => {
            const mockInput = { userId, communityId };
            const mockData = { userId, communityId, status: MembershipStatus.INVITED };
            (MembershipRepository.create as jest.Mock).mockResolvedValue(mockData);

            const result = await MembershipService.inviteMember(mockCtx, mockInput);

            expect(result).toEqual(mockData);
            expect(MembershipRepository.create).toHaveBeenCalled();
        });
    });

    describe("cancelInvitation", () => {
        it("should update membership status to CANCELED", async () => {
            (MembershipUtils.setMembershipStatus as jest.Mock).mockResolvedValue(true);

            const result = await MembershipService.cancelInvitation(mockCtx, { userId, communityId });

            expect(result).toBe(true);
            expect(MembershipUtils.setMembershipStatus).toHaveBeenCalledWith(mockCtx, userId, communityId, MembershipStatus.CANCELED);
        });
    });

    describe("denyInvitation", () => {
        it("should update membership status to CANCELED", async () => {
            (getCurrentUserId as jest.Mock).mockReturnValue(userId);
            (MembershipUtils.setMembershipStatus as jest.Mock).mockResolvedValue(true);

            const input = { userId, communityId };

            const result = await MembershipService.denyInvitation(mockCtx, input);

            expect(result).toBe(true);
            expect(MembershipUtils.setMembershipStatus).toHaveBeenCalledWith(
                mockCtx,
                userId,
                communityId,
                MembershipStatus.CANCELED
            );
        });
    });


    describe("joinIfNeeded", () => {
        it("should create membership if not found", async () => {
            (MembershipRepository.find as jest.Mock).mockResolvedValue(null);
            const mockNewMembership = { userId, communityId, status: MembershipStatus.JOINED };
            (MembershipRepository.create as jest.Mock).mockResolvedValue(mockNewMembership);

            const result = await MembershipService.joinIfNeeded(mockCtx, userId, communityId, mockTx);

            expect(result).toEqual(mockNewMembership);
            expect(MembershipRepository.create).toHaveBeenCalled();
        });

        it("should update status if membership exists but not joined", async () => {
            const mockMembership = { userId, communityId, status: MembershipStatus.INVITED };
            (MembershipRepository.find as jest.Mock).mockResolvedValue(mockMembership);
            const updatedMembership = { ...mockMembership, status: MembershipStatus.JOINED };
            (MembershipRepository.setStatus as jest.Mock).mockResolvedValue(updatedMembership);

            const result = await MembershipService.joinIfNeeded(mockCtx, userId, communityId, mockTx);

            expect(result).toEqual(updatedMembership);
            expect(MembershipRepository.setStatus).toHaveBeenCalled();
        });
    });

    describe("assignRole", () => {
        it("should update the role if membership exists", async () => {
            const mockMembership = { userId, communityId, role: Role.MEMBER };
            (MembershipRepository.find as jest.Mock).mockResolvedValue(mockMembership);
            (MembershipRepository.setRole as jest.Mock).mockResolvedValue({ ...mockMembership, role: Role.MANAGER });

            const result = await MembershipService.assignRole(mockCtx, userId, communityId, Role.MANAGER);

            expect(result.role).toBe(Role.MANAGER);
            expect(MembershipRepository.setRole).toHaveBeenCalled();
        });

        it("should throw an error if membership is not found", async () => {
            (MembershipRepository.find as jest.Mock).mockResolvedValue(null);

            await expect(MembershipService.assignRole(mockCtx, userId, communityId, Role.MANAGER)).rejects.toThrow(
                `MembershipNotFound: userId=${userId}, communityId=${communityId}`
            );
        });
    });

    describe("deleteMembership", () => {
        it("should delete membership if found", async () => {
            const mockMembership = { userId, communityId, status: MembershipStatus.JOINED };
            (MembershipRepository.find as jest.Mock).mockResolvedValue(mockMembership);
            (MembershipRepository.delete as jest.Mock).mockResolvedValue(mockMembership);

            const result = await MembershipService.deleteMembership(mockCtx, mockTx, userId, communityId);

            expect(result).toEqual(mockMembership);
            expect(MembershipRepository.delete).toHaveBeenCalled();
        });

        it("should throw an error if membership does not exist", async () => {
            (MembershipRepository.find as jest.Mock).mockResolvedValue(null);

            await expect(MembershipService.deleteMembership(mockCtx, mockTx, userId, communityId)).rejects.toThrow(
                `MembershipNotFound: userId=${userId}, communityId=${communityId}`
            );
        });
    });
});
