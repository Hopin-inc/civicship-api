import {
  resolveCardanoChainNetwork,
  resolveCardanoNetworkToken,
} from "@/infrastructure/libs/cardano/network";

describe("cardano network resolution from CARDANO_NETWORK", () => {
  const original = process.env.CARDANO_NETWORK;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.CARDANO_NETWORK;
    } else {
      process.env.CARDANO_NETWORK = original;
    }
  });

  it("resolves CARDANO_NETWORK=mainnet to the mainnet forms", () => {
    process.env.CARDANO_NETWORK = "mainnet";
    expect(resolveCardanoChainNetwork()).toBe("CARDANO_MAINNET");
    expect(resolveCardanoNetworkToken()).toBe("mainnet");
  });

  it("resolves CARDANO_NETWORK=preprod to the preprod forms", () => {
    process.env.CARDANO_NETWORK = "preprod";
    expect(resolveCardanoChainNetwork()).toBe("CARDANO_PREPROD");
    expect(resolveCardanoNetworkToken()).toBe("preprod");
  });

  it("falls back to preprod when CARDANO_NETWORK is unset", () => {
    delete process.env.CARDANO_NETWORK;
    expect(resolveCardanoChainNetwork()).toBe("CARDANO_PREPROD");
    expect(resolveCardanoNetworkToken()).toBe("preprod");
  });

  it("falls back to preprod for any non-mainnet value", () => {
    process.env.CARDANO_NETWORK = "preview";
    expect(resolveCardanoChainNetwork()).toBe("CARDANO_PREPROD");
    expect(resolveCardanoNetworkToken()).toBe("preprod");
  });
});
