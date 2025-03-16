import WalletUtils from "@/app/membership/wallet/utils";
import { GqlWallet } from "@/types/graphql";


/*
 * Test for validateTransfer logic
 */
describe("WalletUtils.validateTransfer", () => {
    const basePoints = 100.0
    const largerPoints = 100.1
    const smallerPoints = 99.9

    it("should throw an error if fromWallet is null", async () => {
        const expectedError = "Wallet information is missing for points transfer";
        await expect(WalletUtils.validateTransfer(basePoints, null, {} as GqlWallet)).rejects.toThrow(
            expectedError
        );
    });

    it("should throw an error if toWallet is null", async () => {
        const expectedError = "Wallet information is missing for points transfer";
        await expect(WalletUtils.validateTransfer(basePoints, {} as GqlWallet, null)).rejects.toThrow(
            expectedError
        );
    });

    it("should throw an error if currentPoint is undefined", async () => {
        const fromWallet = { currentPointView: {} } as GqlWallet;
        const toWallet = {} as GqlWallet;

        const expectedError = `Insufficient points in community wallet. Required: ${basePoints}, Available: 0`;
        await expect(WalletUtils.validateTransfer(basePoints, fromWallet, toWallet)).rejects.toThrow(
            expectedError
        );
    });

    it("should throw an error if currentPoint < requiredPoints", async () => {
        const fromWallet = { currentPointView: { currentPoint: basePoints } } as GqlWallet;
        const toWallet = {} as GqlWallet;

        const expectedError = `Insufficient points in community wallet. Required: ${largerPoints}, Available: ${basePoints}`;

        await expect(WalletUtils.validateTransfer(largerPoints, fromWallet, toWallet)).rejects.toThrow(
            expectedError
        );
    });

    it("should not throw an error if currentPoint == requiredPoints", async () => {
        const fromWallet = { currentPointView: { currentPoint: basePoints } } as GqlWallet;
        const toWallet = {} as GqlWallet;

        await expect(WalletUtils.validateTransfer(basePoints, fromWallet, toWallet)).resolves.toBeUndefined();
    });

    it("should not throw an error if currentPoint > requiredPoints", async () => {
        const fromWallet = { currentPointView: { currentPoint: basePoints } } as GqlWallet;
        const toWallet = {} as GqlWallet;

        await expect(WalletUtils.validateTransfer(smallerPoints, fromWallet, toWallet)).resolves.toBeUndefined();
    });
});
