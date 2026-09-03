/**
 * Dev login is an authentication bypass, so the two things holding it in place
 * are what these tests pin down: the ENV gate that keeps it off production, and
 * the uid namespace bound that keeps a forged token from naming a real user.
 *
 * That second one carries the weight a signature used to. The token is
 * deliberately unsigned — see the note in config/devAuth.ts — so if the prefix
 * check ever regresses, anyone could authenticate as any LINE identity on a dev
 * deployment. These tests exist to make that regression loud.
 */

import * as devAuth from "@/config/devAuth";

const ORIGINAL_ENV = process.env;

const DEV_UID = "dev-anon-0123456789abcdef";

function withEnv(overrides: Record<string, string | undefined>): typeof devAuth {
  process.env = { ...ORIGINAL_ENV, ...overrides };
  return devAuth;
}

/** Builds a token for an arbitrary uid, the way an attacker would. */
function forgeToken(uid: string, communityId: string, exp = Date.now() + 60_000): string {
  const body = Buffer.from(JSON.stringify({ uid, communityId, exp }), "utf-8").toString(
    "base64url",
  );
  return `dev.${body}`;
}

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe("devAuth gating", () => {
  it.each(["LOCAL", "local", "dev", "development", "staging"])(
    "is enabled on ENV=%s",
    (env) => {
      expect(withEnv({ ENV: env }).isDevLoginEnabled()).toBe(true);
    },
  );

  it("is disabled when ENV is unset, which is what production looks like", () => {
    expect(withEnv({ ENV: undefined }).isDevLoginEnabled()).toBe(false);
  });

  it.each(["production", "prd", "PRODUCTION", ""])("is disabled on ENV=%s", (env) => {
    expect(withEnv({ ENV: env }).isDevLoginEnabled()).toBe(false);
  });

  it("needs no other configuration to be enabled", () => {
    // Explicitly asserts the feature does not depend on a flag or a shared secret:
    // clearing both must not turn it off.
    const mod = withEnv({
      ENV: "dev",
      DEV_LOGIN_ENABLED: undefined,
      DEV_LOGIN_SECRET: undefined,
    });
    expect(mod.isDevLoginEnabled()).toBe(true);
  });
});

describe("devAuth tokens", () => {
  it("round-trips uid and communityId", () => {
    const mod = withEnv({ ENV: "dev" });
    const { token } = mod.issueDevToken(DEV_UID, "community-1");

    expect(mod.verifyDevToken(token)).toMatchObject({
      uid: DEV_UID,
      communityId: "community-1",
    });
  });

  it("issues uids inside the dev namespace only", () => {
    expect(DEV_UID.startsWith(devAuth.DEV_UID_PREFIX)).toBe(true);
  });

  it("rejects a forged token naming a LINE identity", () => {
    // The core guarantee: the token is unsigned, so forging one is trivial — it
    // must still be useless for becoming a real user.
    const mod = withEnv({ ENV: "dev" });
    expect(mod.verifyDevToken(forgeToken("U1234567890abcdef", "community-1"))).toBeNull();
  });

  it("rejects a forged token naming a uid that merely contains the prefix", () => {
    const mod = withEnv({ ENV: "dev" });
    expect(mod.verifyDevToken(forgeToken(`U123-${devAuth.DEV_UID_PREFIX}x`, "c1"))).toBeNull();
  });

  it("rejects an expired token", () => {
    const mod = withEnv({ ENV: "dev" });
    expect(mod.verifyDevToken(forgeToken(DEV_UID, "community-1", Date.now() - 1))).toBeNull();
  });

  it("rejects a valid token once dev login is switched off", () => {
    const { token } = withEnv({ ENV: "dev" }).issueDevToken(DEV_UID, "community-1");
    expect(withEnv({ ENV: undefined }).verifyDevToken(token)).toBeNull();
  });

  it("rejects malformed input and a Firebase-shaped JWT", () => {
    const mod = withEnv({ ENV: "dev" });

    expect(mod.verifyDevToken(undefined)).toBeNull();
    expect(mod.verifyDevToken("")).toBeNull();
    expect(mod.verifyDevToken("header.payload.signature")).toBeNull();
    expect(mod.verifyDevToken("dev.not-base64url!!")).toBeNull();
    expect(mod.verifyDevToken("notdev.eyJ1aWQiOiJ4In0")).toBeNull();
  });

  it("rejects a token missing required fields", () => {
    const mod = withEnv({ ENV: "dev" });
    const body = Buffer.from(JSON.stringify({ uid: DEV_UID }), "utf-8").toString("base64url");
    expect(mod.verifyDevToken(`dev.${body}`)).toBeNull();
  });

  it("expires within the advertised TTL", () => {
    const mod = withEnv({ ENV: "dev" });
    const before = Date.now();
    const { expiresAt } = mod.issueDevToken(DEV_UID, "community-1");

    expect(expiresAt).toBeGreaterThan(before);
    expect(expiresAt).toBeLessThanOrEqual(before + mod.DEV_TOKEN_TTL_MS + 1000);
  });
});
