import WalletService from "@/app/membership/wallet/service";
import WalletRepository from "@/infra/repositories/membership/wallet";
import WalletUtils from "@/app/membership/wallet/utils";
import { Prisma, WalletType } from "@prisma/client";
import { IContext } from "@/types/server";

jest.mock("@/infra/repositories/membership/wallet");
jest.mock("@/app/membership/wallet/utils");

describe("WalletService", () => {
    let ctx: IContext;

    beforeEach(() => {
        ctx = { user: { id: "test-user" } } as unknown as IContext;
        jest.clearAllMocks();
    });

    describe("fetchWallets", () => {
        it("should fetch wallets with the correct parameters", async () => {
            const mockWallets = [{ id: "1", type: WalletType.MEMBER, communityId: "community-1" }];
            (WalletRepository.query as jest.Mock).mockResolvedValue(mockWallets);

            const result = await WalletService.fetchWallets(ctx, { filter: {}, sort: {}, cursor: "" }, 10);

            expect(WalletRepository.query).toHaveBeenCalledWith(
                ctx,
                expect.any(Object),
                expect.any(Array),
                10,
                ""
            );
            expect(result).toEqual(mockWallets);
        });
    });

    describe("findWallet", () => {
        it("should find a wallet by id", async () => {
            const mockWallet = { id: "1", type: WalletType.MEMBER };
            (WalletRepository.find as jest.Mock).mockResolvedValue(mockWallet);

            const result = await WalletService.findWallet(ctx, "1");

            expect(WalletRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(result).toEqual(mockWallet);
        });
    });

    describe("findCommunityWalletOrThrow", () => {
        it("should return a wallet for the community", async () => {
            const mockWallet = { id: "community-wallet", type: WalletType.COMMUNITY, communityId: "community-1" };
            (WalletRepository.findCommunityWallet as jest.Mock).mockResolvedValue(mockWallet);

            const result = await WalletService.findCommunityWalletOrThrow(ctx, "community-1");

            expect(WalletRepository.findCommunityWallet).toHaveBeenCalledWith(ctx, "community-1");
            expect(result).toEqual(mockWallet);
        });

        it("should throw an error if no community wallet is found", async () => {
            (WalletRepository.findCommunityWallet as jest.Mock).mockResolvedValue(null);

            await expect(WalletService.findCommunityWalletOrThrow(ctx, "community-1")).rejects.toThrow(
                "Wallet information is missing for points transfer"
            );
        });
    });

    describe("findWalletsForRedeemedUtility", () => {
        it("should return wallet ids for points transfer", async () => {
            const mockMemberWallet = { id: "member-wallet", type: WalletType.MEMBER };
            const mockCommunityWallet = { id: "community-wallet", type: WalletType.COMMUNITY };
            const requiredPoints = 100;

            (WalletRepository.find as jest.Mock).mockResolvedValueOnce(mockMemberWallet);
            (WalletRepository.findCommunityWallet as jest.Mock).mockResolvedValueOnce(mockCommunityWallet);
            (WalletUtils.validateTransfer as jest.Mock).mockResolvedValue(true);

            const result = await WalletService.findWalletsForRedeemedUtility(
                ctx,
                "member-wallet-id",
                "community-id",
                requiredPoints
            );

            expect(WalletRepository.find).toHaveBeenCalledWith(ctx, "member-wallet-id");
            expect(WalletRepository.findCommunityWallet).toHaveBeenCalledWith(ctx, "community-id");
            expect(WalletUtils.validateTransfer).toHaveBeenCalledWith(requiredPoints, mockMemberWallet, mockCommunityWallet);
            expect(result).toEqual({ fromWalletId: mockMemberWallet.id, toWalletId: mockCommunityWallet.id });
        });

        it("should throw an error if member wallet is missing", async () => {
            (WalletRepository.find as jest.Mock).mockResolvedValueOnce(null);

            await expect(
                WalletService.findWalletsForRedeemedUtility(ctx, "invalid-member-wallet", "community-id", 100)
            ).rejects.toThrow("MemberWallet information is missing for points transfer");
        });

        it("should throw an error if community wallet is missing", async () => {
            const mockMemberWallet = { id: "member-wallet", type: WalletType.MEMBER };
            (WalletRepository.find as jest.Mock).mockResolvedValueOnce(mockMemberWallet);
            (WalletRepository.findCommunityWallet as jest.Mock).mockResolvedValueOnce(null);

            await expect(
                WalletService.findWalletsForRedeemedUtility(ctx, "member-wallet-id", "invalid-community-id", 100)
            ).rejects.toThrow("No community wallet found for communityId: invalid-community-id");
        });
    });

    describe("createCommunityWallet", () => {
        it("should create a community wallet", async () => {
            const mockWallet = { id: "community-wallet", type: WalletType.COMMUNITY };
            const tx = {} as Prisma.TransactionClient;
            (WalletRepository.create as jest.Mock).mockResolvedValue(mockWallet);

            const result = await WalletService.createCommunityWallet(ctx, "community-id", tx);

            expect(WalletRepository.create).toHaveBeenCalledWith(
                ctx,
                expect.any(Object),
                tx
            );
            expect(result).toEqual(mockWallet);
        });
    });

    describe("createMemberWalletIfNeeded", () => {
        it("should create a member wallet if none exists", async () => {
            const mockWallet = { id: "member-wallet", type: WalletType.MEMBER };
            const tx = {} as Prisma.TransactionClient;
            (WalletRepository.checkIfExistingMemberWallet as jest.Mock).mockResolvedValue(null);
            (WalletRepository.create as jest.Mock).mockResolvedValue(mockWallet);

            const result = await WalletService.createMemberWalletIfNeeded(ctx, "user-id", "community-id", tx);

            expect(WalletRepository.checkIfExistingMemberWallet).toHaveBeenCalledWith(
                ctx, "community-id", "user-id", tx
            );
            expect(WalletRepository.create).toHaveBeenCalledWith(
                ctx, expect.any(Object), tx
            );
            expect(result).toEqual(mockWallet);
        });

        it("should return existing wallet if it exists", async () => {
            const mockWallet = { id: "member-wallet", type: WalletType.MEMBER };
            const tx = {} as Prisma.TransactionClient;
            (WalletRepository.checkIfExistingMemberWallet as jest.Mock).mockResolvedValue(mockWallet);

            const result = await WalletService.createMemberWalletIfNeeded(ctx, "user-id", "community-id", tx);

            expect(WalletRepository.checkIfExistingMemberWallet).toHaveBeenCalledWith(
                ctx, "community-id", "user-id", tx
            );
            expect(WalletRepository.create).not.toHaveBeenCalled();
            expect(result).toEqual(mockWallet);
        });
    });

    describe("deleteMemberWallet", () => {
        it("should delete an existing member wallet", async () => {
            const mockWallet = { id: "member-wallet", type: WalletType.MEMBER };
            const tx = {} as Prisma.TransactionClient;
            (WalletRepository.checkIfExistingMemberWallet as jest.Mock).mockResolvedValue(mockWallet);
            (WalletRepository.delete as jest.Mock).mockResolvedValue(mockWallet);

            const result = await WalletService.deleteMemberWallet(ctx, "user-id", "community-id", tx);

            expect(WalletRepository.checkIfExistingMemberWallet).toHaveBeenCalledWith(
                ctx, "community-id", "user-id", tx
            );
            expect(WalletRepository.delete).toHaveBeenCalledWith(ctx, mockWallet.id);
            expect(result).toEqual(mockWallet);
        });

        it("should throw an error if wallet is not found", async () => {
            (WalletRepository.checkIfExistingMemberWallet as jest.Mock).mockResolvedValue(null);

            await expect(
                WalletService.deleteMemberWallet(ctx, "user-id", "community-id", {} as Prisma.TransactionClient)
            ).rejects.toThrow("WalletNotFound: userId=user-id, communityId=community-id");
        });
    });
    // describe("findWalletsForGiveReward", () => {

    // });
});
