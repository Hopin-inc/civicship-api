import "reflect-metadata";
import { Prisma } from "@prisma/client";
import WalletRepository from "@/application/domain/account/wallet/data/repository";

describe("WalletRepository.calculateCurrentBalance", () => {
  let repository: WalletRepository;
  let mockTx: Prisma.TransactionClient;

  beforeEach(() => {
    repository = new WalletRepository();
    mockTx = {
      transaction: {
        aggregate: jest.fn(),
      },
    } as unknown as Prisma.TransactionClient;
  });

  it("should calculate balance with both incoming and outgoing transactions", async () => {
    const walletId = "wallet-123";

    // Mock outgoing (from) transactions: 300pt sent
    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { fromPointChange: 300 },
    });

    // Mock incoming (to) transactions: 500pt received
    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { toPointChange: 500 },
    });

    const balance = await repository.calculateCurrentBalance(walletId, mockTx);

    expect(balance).toBe(BigInt(200)); // 500 - 300 = 200
    expect(mockTx.transaction.aggregate).toHaveBeenCalledTimes(2);
    expect(mockTx.transaction.aggregate).toHaveBeenNthCalledWith(1, {
      where: { from: walletId },
      _sum: { fromPointChange: true },
    });
    expect(mockTx.transaction.aggregate).toHaveBeenNthCalledWith(2, {
      where: { to: walletId },
      _sum: { toPointChange: true },
    });
  });

  it("should calculate balance with only incoming transactions", async () => {
    const walletId = "wallet-456";

    // No outgoing transactions
    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { fromPointChange: null },
    });

    // Mock incoming transactions: 1000pt received
    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { toPointChange: 1000 },
    });

    const balance = await repository.calculateCurrentBalance(walletId, mockTx);

    expect(balance).toBe(BigInt(1000)); // 1000 - 0 = 1000
  });

  it("should calculate balance with only outgoing transactions", async () => {
    const walletId = "wallet-789";

    // Mock outgoing transactions: 500pt sent
    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { fromPointChange: 500 },
    });

    // No incoming transactions
    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { toPointChange: null },
    });

    const balance = await repository.calculateCurrentBalance(walletId, mockTx);

    expect(balance).toBe(BigInt(-500)); // 0 - 500 = -500
  });

  it("should return zero when there are no transactions", async () => {
    const walletId = "wallet-empty";

    // No outgoing transactions
    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { fromPointChange: null },
    });

    // No incoming transactions
    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { toPointChange: null },
    });

    const balance = await repository.calculateCurrentBalance(walletId, mockTx);

    expect(balance).toBe(BigInt(0));
  });

  it("should handle large BigInt values correctly", async () => {
    const walletId = "wallet-large";

    // Large outgoing: 9007199254740990
    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { fromPointChange: 9007199254740990 },
    });

    // Large incoming: 9007199254740991 (Number.MAX_SAFE_INTEGER)
    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { toPointChange: Number.MAX_SAFE_INTEGER },
    });

    const balance = await repository.calculateCurrentBalance(walletId, mockTx);

    // 9007199254740991 - 9007199254740990 = 1
    expect(balance).toBe(BigInt(1));
  });

  it("should handle exact balance (incoming equals outgoing)", async () => {
    const walletId = "wallet-balanced";

    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { fromPointChange: 5000 },
    });

    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { toPointChange: 5000 },
    });

    const balance = await repository.calculateCurrentBalance(walletId, mockTx);

    expect(balance).toBe(BigInt(0));
  });

  it("should aggregate queries in parallel", async () => {
    const walletId = "wallet-parallel";

    // Track when each aggregate call is made
    const callOrder: string[] = [];

    (mockTx.transaction.aggregate as jest.Mock).mockImplementation(async (params) => {
      if (params.where.from) {
        callOrder.push("outgoing");
        return { _sum: { fromPointChange: 100 } };
      } else {
        callOrder.push("incoming");
        return { _sum: { toPointChange: 200 } };
      }
    });

    await repository.calculateCurrentBalance(walletId, mockTx);

    // Both queries should be initiated (order may vary due to Promise.all)
    expect(callOrder).toHaveLength(2);
    expect(callOrder).toContain("outgoing");
    expect(callOrder).toContain("incoming");
  });

  it("should handle zero values explicitly (not null)", async () => {
    const walletId = "wallet-zero";

    // Explicitly 0, not null
    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { fromPointChange: 0 },
    });

    (mockTx.transaction.aggregate as jest.Mock).mockResolvedValueOnce({
      _sum: { toPointChange: 0 },
    });

    const balance = await repository.calculateCurrentBalance(walletId, mockTx);

    expect(balance).toBe(BigInt(0));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
