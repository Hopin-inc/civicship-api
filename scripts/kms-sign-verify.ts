#!/usr/bin/env -S node --experimental-strip-types
/**
 * KMS Ed25519 sign-and-verify round-trip against the live DID Document.
 *
 * Proves that:
 *
 *   1. The Cloud KMS key version referenced by `t_issuer_did_keys` on dev
 *      can sign over a caller-supplied payload from a local workstation
 *      via `KmsSigner.signEd25519` (i.e. the runtime IAM grant is wired
 *      and the resource name resolves).
 *   2. The 64-byte Ed25519 signature it returns base64url-encodes cleanly
 *      (same code path `KmsJwtSigner.sign()` uses to emit the JWT
 *      third segment).
 *   3. The signature verifies against the public key the dev API
 *      publishes at `/.well-known/did.json` — i.e. KMS, the
 *      `t_issuer_did_keys` row, and the issued DID Document all agree
 *      on the same key material.
 *
 * Together those three checks exercise the **post-Step-D production
 * signing path** end-to-end without needing a Firebase ID token, a
 * dev-DB user/evaluation pair, or the GraphQL `issueVc` mutation.
 *
 * No DI container / no Prisma. Just `KmsSigner` + `@emurgo/cardano-serialization-lib-nodejs`
 * (for Ed25519 verify) + the live DID Document JSON.
 *
 * Required:
 *   gcloud ADC with `roles/cloudkms.signerVerifier` on the target KMS
 *   key (the Cloud Run SA already has this — run `gcloud auth
 *   application-default login` locally with the same scope, or rely on
 *   `GOOGLE_APPLICATION_CREDENTIALS` pointing at a key file).
 *
 * Flags (all optional — sensible dev defaults):
 *   --resource=<kms resource name>   defaults to dev's cryptoKeyVersions/1
 *   --did-url=<https://...>          defaults to dev API's well-known URL
 *   --payload=<string>               defaults to "civicship-kms-sign-poc"
 *
 * Exit codes: 0 = PASS, 1 = FAIL.
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §5.1.1 (KMS resource naming)
 *   docs/report/did-vc-internalization.md §5.4.3 (Issuer DID + KMS sign)
 *   docs/report/did-vc-internalization.md §16    (Phase 2 carryover)
 */

import "reflect-metadata";

import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";

import { KmsSigner } from "../src/infrastructure/libs/kms/kmsSigner.ts";
import { runStep } from "./lib/cardanoScriptHelpers.ts";

const DEFAULT_RESOURCE =
  "projects/kyoso-dev-453010/locations/asia-northeast1/keyRings/civicship/cryptoKeys/civicship-issuer-vc/cryptoKeyVersions/1";
const DEFAULT_DID_URL =
  "https://kyoso-dev-civicship-api-erfss3pm6a-uc.a.run.app/.well-known/did.json";
const DEFAULT_PAYLOAD = "civicship-kms-sign-poc";

interface Flags {
  resource: string;
  didUrl: string;
  payload: string;
}

function parseFlags(argv: string[]): Flags {
  const flags: Flags = {
    resource: DEFAULT_RESOURCE,
    didUrl: DEFAULT_DID_URL,
    payload: DEFAULT_PAYLOAD,
  };
  for (const arg of argv) {
    const match = /^--([\w-]+)=(.+)$/.exec(arg);
    if (!match) continue;
    const [, key, value] = match;
    if (key === "resource") flags.resource = value;
    else if (key === "did-url") flags.didUrl = value;
    else if (key === "payload") flags.payload = value;
    else throw new Error(`Unknown flag --${key}`);
  }
  return flags;
}

interface DidDocumentJwk {
  publicKeyJwk?: { kty: string; crv: string; x: string };
}

interface DidDocumentMultikey {
  publicKeyMultibase?: string;
}

interface DidDocument {
  verificationMethod: ReadonlyArray<
    {
      id: string;
      type: string;
      controller: string;
    } & DidDocumentJwk &
      DidDocumentMultikey
  >;
}

function base64UrlDecodeToBytes(b64u: string): Uint8Array {
  // Node ≥18: `Buffer.from(s, "base64url")` is built-in.
  return new Uint8Array(Buffer.from(b64u, "base64url"));
}

function pickEd25519PublicKey(doc: DidDocument): {
  kid: string;
  publicKey: Uint8Array;
} {
  for (const vm of doc.verificationMethod) {
    if (vm.publicKeyJwk?.kty === "OKP" && vm.publicKeyJwk.crv === "Ed25519") {
      const bytes = base64UrlDecodeToBytes(vm.publicKeyJwk.x);
      if (bytes.length !== 32) {
        throw new Error(
          `verificationMethod ${vm.id} JWK x is ${bytes.length} bytes, expected 32 (Ed25519)`,
        );
      }
      return { kid: vm.id, publicKey: bytes };
    }
  }
  throw new Error(
    "no JsonWebKey2020 / Ed25519 verificationMethod found in DID Document. " +
      "If only `publicKeyMultibase` is published, extend this script with a " +
      "base58btc + multicodec decoder.",
  );
}

async function main(): Promise<number> {
  const flags = parseFlags(process.argv.slice(2));
  process.stdout.write(
    "KMS Ed25519 sign + verify round-trip against the live DID Document\n\n",
  );

  // Step 1 — KMS sign
  const payloadBytes = new TextEncoder().encode(flags.payload);
  const signer = new KmsSigner();
  const sigStep = await runStep<Uint8Array>("kms: signEd25519", async () => {
    const sig = await signer.signEd25519(flags.resource, payloadBytes);
    if (sig.length !== 64) {
      throw new Error(
        `KMS returned ${sig.length}-byte signature, expected 64 (raw Ed25519)`,
      );
    }
    return { value: sig, detail: `resource=${flags.resource.split("/").slice(-3).join("/")}` };
  });
  if (!sigStep.ok) return 1;
  const sigBytes = sigStep.value;

  // Step 2 — base64url (same path KmsJwtSigner uses)
  const sigB64u = Buffer.from(sigBytes).toString("base64url");
  const encStep = await runStep("encode: base64url", async () => ({
    value: undefined,
    detail: `signature (${sigB64u.length} chars): ${sigB64u}`,
  }));
  if (!encStep.ok) return 1;
  if (/[+/=]/.test(sigB64u)) {
    process.stdout.write("   FAIL: base64url contains forbidden chars\n");
    return 1;
  }

  // Step 3 — fetch DID Document
  const fetchStep = await runStep<{ kid: string; publicKey: Uint8Array }>(
    `fetch: ${flags.didUrl}`,
    async () => {
      const resp = await fetch(flags.didUrl);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      }
      const doc = (await resp.json()) as DidDocument;
      const picked = pickEd25519PublicKey(doc);
      return {
        value: picked,
        detail: `kid=${picked.kid}, pubkey(hex)=${Buffer.from(picked.publicKey).toString("hex")}`,
      };
    },
  );
  if (!fetchStep.ok) return 1;
  const { kid, publicKey } = fetchStep.value;

  // Step 4 — verify
  const verifyStep = await runStep("verify: Ed25519 sig over payload", async () => {
    const pub = CSL.PublicKey.from_bytes(publicKey);
    const sig = CSL.Ed25519Signature.from_bytes(sigBytes);
    const ok = pub.verify(payloadBytes, sig);
    if (!ok) {
      throw new Error(
        "signature does NOT verify against DID Document public key — " +
          "either the KMS key referenced does not match `t_issuer_did_keys.kmsKeyResourceName`, " +
          "or the active row published in `/.well-known/did.json` is stale.",
      );
    }
    return { value: undefined, detail: `payload="${flags.payload}", kid=${kid}` };
  });
  if (!verifyStep.ok) return 1;

  process.stdout.write("\nALL STEPS PASSED.\n");
  process.stdout.write("KMS → KmsJwtSigner → published DID Document path is healthy.\n");
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    process.stderr.write(`ERROR: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  });
