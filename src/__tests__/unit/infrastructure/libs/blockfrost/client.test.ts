/**
 * Unit tests for `src/infrastructure/libs/blockfrost/client.ts`.
 *
 * Covers:
 *   - Each public method delegates to the matching Blockfrost SDK call
 *   - Constructor enforces network ↔ project_id consistency (early throw)
 *   - Constructor surfaces missing `BLOCKFROST_PROJECT_ID` immediately
 *   - `awaitConfirmation` honours its timeout and rejects when the tx
 *     never lands inside the window
 *   - Retries are applied to transient errors but not to caller errors
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.5
 */

import "reflect-metadata";

const mockEpochsLatestParameters = jest.fn();
const mockAddressesUtxosAll = jest.fn();
const mockTxSubmit = jest.fn();
const mockTxsMetadata = jest.fn();
const mockTxs = jest.fn();
const mockBlockFrostAPIConstructor = jest.fn();

jest.mock("@blockfrost/blockfrost-js", () => {
  const MockBlockFrostAPI = jest.fn().mockImplementation((opts: unknown) => {
    mockBlockFrostAPIConstructor(opts);
    return {
      epochsLatestParameters: mockEpochsLatestParameters,
      addressesUtxosAll: mockAddressesUtxosAll,
      txSubmit: mockTxSubmit,
      txsMetadata: mockTxsMetadata,
      txs: mockTxs,
    };
  });
  return { BlockFrostAPI: MockBlockFrostAPI };
});

import {
  BlockfrostClient,
  assertProjectIdMatchesNetwork,
} from "@/infrastructure/libs/blockfrost/client";

describe("BlockfrostClient", () => {
  const originalProjectId = process.env.BLOCKFROST_PROJECT_ID;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BLOCKFROST_PROJECT_ID = "preprodTESTKEY";
  });

  afterAll(() => {
    if (originalProjectId === undefined) {
      delete process.env.BLOCKFROST_PROJECT_ID;
    } else {
      process.env.BLOCKFROST_PROJECT_ID = originalProjectId;
    }
  });

  describe("constructor", () => {
    it("throws when BLOCKFROST_PROJECT_ID is missing and no override is given", () => {
      delete process.env.BLOCKFROST_PROJECT_ID;
      expect(() => new BlockfrostClient()).toThrow(/BLOCKFROST_PROJECT_ID/);
    });

    it("instantiates BlockFrostAPI with the resolved project_id and network token", () => {
      // S1848: side-effect is constructor → mocked SDK; mark explicit void so
      // Sonar doesn't flag the result as discarded.
      void new BlockfrostClient({ network: "CARDANO_PREPROD" });
      expect(mockBlockFrostAPIConstructor).toHaveBeenCalledWith({
        projectId: "preprodTESTKEY",
        network: "preprod",
      });
    });

    it("maps CARDANO_MAINNET to the mainnet network token", () => {
      void new BlockfrostClient({
        network: "CARDANO_MAINNET",
        projectId: "mainnetXYZ",
      });
      expect(mockBlockFrostAPIConstructor).toHaveBeenCalledWith({
        projectId: "mainnetXYZ",
        network: "mainnet",
      });
    });

    it("rejects a preprod project_id when configured for mainnet", () => {
      expect(
        () =>
          new BlockfrostClient({
            network: "CARDANO_MAINNET",
            projectId: "preprodOOPS",
          }),
      ).toThrow(/does not match.*CARDANO_MAINNET/);
    });

    it("rejects a mainnet project_id when configured for preprod", () => {
      expect(
        () =>
          new BlockfrostClient({
            network: "CARDANO_PREPROD",
            projectId: "mainnetWRONG",
          }),
      ).toThrow(/does not match.*CARDANO_PREPROD/);
    });

    it("accepts an unprefixed project_id (test fixture compatibility)", () => {
      expect(
        () =>
          new BlockfrostClient({
            network: "CARDANO_PREPROD",
            projectId: "raw-test-key-no-prefix",
          }),
      ).not.toThrow();
    });
  });

  describe("assertProjectIdMatchesNetwork (exported helper)", () => {
    it("does not throw for matching mainnet pair", () => {
      expect(() => assertProjectIdMatchesNetwork("CARDANO_MAINNET", "mainnetABC")).not.toThrow();
    });

    it("does not throw for matching preprod pair", () => {
      expect(() => assertProjectIdMatchesNetwork("CARDANO_PREPROD", "preprodABC")).not.toThrow();
    });

    it("throws on mismatched preview prefix vs preprod network", () => {
      expect(() => assertProjectIdMatchesNetwork("CARDANO_PREPROD", "previewABC")).toThrow(
        /does not match/,
      );
    });
  });

  describe("API method delegation", () => {
    it("getProtocolParams() delegates to epochsLatestParameters()", async () => {
      const expected = { min_fee_a: 44, min_fee_b: 155381 };
      mockEpochsLatestParameters.mockResolvedValueOnce(expected);

      const client = new BlockfrostClient({ network: "CARDANO_PREPROD" });
      await expect(client.getProtocolParams()).resolves.toBe(expected);
      expect(mockEpochsLatestParameters).toHaveBeenCalledTimes(1);
    });

    it("getUtxos(address) delegates to addressesUtxosAll(address)", async () => {
      const utxos = [{ tx_hash: "0".repeat(64), output_index: 0, amount: [] }];
      mockAddressesUtxosAll.mockResolvedValueOnce(utxos);

      const client = new BlockfrostClient({ network: "CARDANO_PREPROD" });
      await expect(client.getUtxos("addr_test1xyz")).resolves.toBe(utxos);
      expect(mockAddressesUtxosAll).toHaveBeenCalledWith("addr_test1xyz");
    });

    it("submitTx(bytes) delegates to txSubmit(bytes) and returns the hash", async () => {
      mockTxSubmit.mockResolvedValueOnce("a".repeat(64));

      const client = new BlockfrostClient({ network: "CARDANO_PREPROD" });
      const cbor = new Uint8Array([1, 2, 3, 4]);
      await expect(client.submitTx(cbor)).resolves.toBe("a".repeat(64));
      expect(mockTxSubmit).toHaveBeenCalledWith(cbor);
    });

    it("getTxMetadata(hash) delegates to txsMetadata(hash)", async () => {
      const meta = [{ label: "1985", json_metadata: { v: 1 } }];
      mockTxsMetadata.mockResolvedValueOnce(meta);

      const client = new BlockfrostClient({ network: "CARDANO_PREPROD" });
      await expect(client.getTxMetadata("abc")).resolves.toBe(meta);
      expect(mockTxsMetadata).toHaveBeenCalledWith("abc");
    });
  });

  describe("retry policy", () => {
    it("retries on a transient 5xx response and eventually succeeds", async () => {
      const transientErr = { status_code: 502, message: "bad gateway" };
      mockEpochsLatestParameters
        .mockRejectedValueOnce(transientErr)
        .mockResolvedValueOnce({ ok: true });

      const client = new BlockfrostClient({
        network: "CARDANO_PREPROD",
        initialBackoffMs: 1,
      });
      await expect(client.getProtocolParams()).resolves.toEqual({ ok: true });
      expect(mockEpochsLatestParameters).toHaveBeenCalledTimes(2);
    });

    it("does not retry on a 4xx caller error", async () => {
      const callerErr = { status_code: 400, message: "bad request" };
      mockEpochsLatestParameters.mockRejectedValueOnce(callerErr);

      const client = new BlockfrostClient({
        network: "CARDANO_PREPROD",
        initialBackoffMs: 1,
      });
      await expect(client.getProtocolParams()).rejects.toBe(callerErr);
      expect(mockEpochsLatestParameters).toHaveBeenCalledTimes(1);
    });

    it("gives up after maxRetries transient failures", async () => {
      const transientErr = { status_code: 503, message: "unavailable" };
      mockEpochsLatestParameters.mockRejectedValue(transientErr);

      const client = new BlockfrostClient({
        network: "CARDANO_PREPROD",
        initialBackoffMs: 1,
        maxRetries: 3,
      });
      await expect(client.getProtocolParams()).rejects.toBe(transientErr);
      expect(mockEpochsLatestParameters).toHaveBeenCalledTimes(3);
    });
  });

  describe("awaitConfirmation", () => {
    it("returns the tx record once block_height is non-null", async () => {
      mockTxs
        .mockResolvedValueOnce({ hash: "h", block_height: null, block_time: null })
        .mockResolvedValueOnce({ hash: "h", block_height: 12345, block_time: 1700000000 });

      const client = new BlockfrostClient({
        network: "CARDANO_PREPROD",
        initialBackoffMs: 1,
      });
      const result = await client.awaitConfirmation("h", 5_000, 1);
      expect(result.block_height).toBe(12345);
      expect(mockTxs).toHaveBeenCalledTimes(2);
    });

    it("tolerates 404 polls while the tx propagates", async () => {
      mockTxs
        .mockRejectedValueOnce({ status_code: 404, message: "not found" })
        .mockResolvedValueOnce({ hash: "h", block_height: 1, block_time: 1 });

      const client = new BlockfrostClient({
        network: "CARDANO_PREPROD",
        initialBackoffMs: 1,
      });
      const result = await client.awaitConfirmation("h", 5_000, 1);
      expect(result.hash).toBe("h");
    });

    it("rejects when the deadline elapses without confirmation", async () => {
      mockTxs.mockResolvedValue({ hash: "h", block_height: null, block_time: null });

      const client = new BlockfrostClient({
        network: "CARDANO_PREPROD",
        initialBackoffMs: 1,
      });
      await expect(client.awaitConfirmation("h", 30, 5)).rejects.toThrow(/timed out/);
    });

    it("propagates non-404 caller errors immediately", async () => {
      const fatal = { status_code: 401, message: "unauthorized" };
      mockTxs.mockRejectedValueOnce(fatal);

      const client = new BlockfrostClient({
        network: "CARDANO_PREPROD",
        initialBackoffMs: 1,
      });
      await expect(client.awaitConfirmation("h", 1_000, 1)).rejects.toBe(fatal);
    });
  });
});
