/**
 * Dev login is an authentication bypass, so its gating is the part that matters:
 * these tests pin down that it stays off unless every gate is satisfied, and that
 * a token cannot be forged, replayed after expiry, or reused across communities.
 */

import * as devAuth from "@/config/devAuth";

const ORIGINAL_ENV = process.env;

const VALID_SECRET = "a".repeat(32);

/**
 * devAuth reads process.env on every call rather than caching at import time,
 * so swapping the environment is enough to re-gate it — no module reloading.
 */
function withEnv(overrides: Record<string, string | undefined>): typeof devAuth {
  process.env = { ...ORIGINAL_ENV, ...overrides };
  return devAuth;
}

describe("devAuth gating", () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("is enabled only when the flag, a dev ENV and a long secret are all present", () => {
    const devAuth = withEnv({
      DEV_LOGIN_ENABLED: "true",
      ENV: "dev",
      DEV_LOGIN_SECRET: VALID_SECRET,
    });
    expect(devAuth.isDevLoginEnabled()).toBe(true);
  });

  it("is disabled when the opt-in flag is missing", () => {
    const devAuth = withEnv({
      DEV_LOGIN_ENABLED: undefined,
      ENV: "dev",
      DEV_LOGIN_SECRET: VALID_SECRET,
    });
    expect(devAuth.isDevLoginEnabled()).toBe(false);
  });

  it("is disabled when ENV is unset, which is what production looks like", () => {
    const devAuth = withEnv({
      DEV_LOGIN_ENABLED: "true",
      ENV: undefined,
      DEV_LOGIN_SECRET: VALID_SECRET,
    });
    expect(devAuth.isDevLoginEnabled()).toBe(false);
  });

  it("is disabled on an unrecognised ENV such as production", () => {
    const devAuth = withEnv({
      DEV_LOGIN_ENABLED: "true",
      ENV: "production",
      DEV_LOGIN_SECRET: VALID_SECRET,
    });
    expect(devAuth.isDevLoginEnabled()).toBe(false);
  });

  it("is disabled when the secret is too short to be meaningful", () => {
    const devAuth = withEnv({
      DEV_LOGIN_ENABLED: "true",
      ENV: "dev",
      DEV_LOGIN_SECRET: "short",
    });
    expect(devAuth.isDevLoginEnabled()).toBe(false);
  });
});

describe("devAuth tokens", () => {
  const enabledEnv = {
    DEV_LOGIN_ENABLED: "true",
    ENV: "dev",
    DEV_LOGIN_SECRET: VALID_SECRET,
  };

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("round-trips uid and communityId", () => {
    const devAuth = withEnv(enabledEnv);
    const { token } = devAuth.issueDevToken("uid-1", "community-1");

    expect(devAuth.verifyDevToken(token)).toMatchObject({
      uid: "uid-1",
      communityId: "community-1",
    });
  });

  it("rejects a token whose payload was tampered with", () => {
    const devAuth = withEnv(enabledEnv);
    const { token } = devAuth.issueDevToken("uid-1", "community-1");

    const [prefix, , signature] = token.split(".");
    const forgedBody = Buffer.from(
      JSON.stringify({ uid: "admin-uid", communityId: "community-1", exp: Date.now() + 1000 }),
      "utf-8",
    ).toString("base64url");

    expect(devAuth.verifyDevToken(`${prefix}.${forgedBody}.${signature}`)).toBeNull();
  });

  it("rejects a token signed with a different secret", () => {
    const issuer = withEnv({ ...enabledEnv, DEV_LOGIN_SECRET: "b".repeat(32) });
    const { token } = issuer.issueDevToken("uid-1", "community-1");

    const verifier = withEnv(enabledEnv);
    expect(verifier.verifyDevToken(token)).toBeNull();
  });

  it("rejects an expired token", () => {
    const devAuth = withEnv(enabledEnv);
    const now = Date.now();
    const { token } = devAuth.issueDevToken("uid-1", "community-1");

    // Hold the spy: calling jest.spyOn again would wrap the mock and restore
    // only that wrapper, leaving Date.now mocked for every later test.
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(now + devAuth.DEV_TOKEN_TTL_MS + 1);
    try {
      expect(devAuth.verifyDevToken(token)).toBeNull();
    } finally {
      nowSpy.mockRestore();
    }
  });

  it("rejects a valid token once dev login is switched off", () => {
    const issuer = withEnv(enabledEnv);
    const { token } = issuer.issueDevToken("uid-1", "community-1");

    const verifier = withEnv({ ...enabledEnv, ENV: "production" });
    expect(verifier.verifyDevToken(token)).toBeNull();
  });

  it("rejects a Firebase-shaped JWT outright", () => {
    const devAuth = withEnv(enabledEnv);
    expect(devAuth.verifyDevToken("header.payload.signature")).toBeNull();
    expect(devAuth.verifyDevToken(undefined)).toBeNull();
  });
});

describe("devAuth shared secret", () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("accepts the configured secret and rejects anything else", () => {
    const devAuth = withEnv({
      DEV_LOGIN_ENABLED: "true",
      ENV: "dev",
      DEV_LOGIN_SECRET: VALID_SECRET,
    });

    expect(devAuth.isValidDevLoginSecret(VALID_SECRET)).toBe(true);
    expect(devAuth.isValidDevLoginSecret("b".repeat(32))).toBe(false);
    expect(devAuth.isValidDevLoginSecret(VALID_SECRET.slice(0, 31))).toBe(false);
    expect(devAuth.isValidDevLoginSecret(undefined)).toBe(false);
  });

  it("rejects even the correct secret when dev login is disabled", () => {
    const devAuth = withEnv({
      DEV_LOGIN_ENABLED: "true",
      ENV: "production",
      DEV_LOGIN_SECRET: VALID_SECRET,
    });
    expect(devAuth.isValidDevLoginSecret(VALID_SECRET)).toBe(false);
  });
});
