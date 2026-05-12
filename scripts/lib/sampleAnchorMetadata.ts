/**
 * Shared sample anchor metadata builder for Cardano operator scripts.
 *
 * Both `scripts/cardano-canary.ts` (dry-run) and `scripts/preprod-e2e-submit.ts`
 * (real submit) need to construct a representative anchor-batch
 * `AuxiliaryData`. Keeping a single parametrized builder here prevents the
 * two scripts from drifting and removes the cross-file duplication
 * SonarCloud was flagging.
 *
 * Pure function: hashes a deterministic-ish input via blake2b, builds one
 * `c` op (and optionally a `u` op), and returns the `CSL.AuxiliaryData` for
 * label 1985. No network, no DI.
 */

import { blake2b } from "@noble/hashes/blake2b";

import {
  buildAuxiliaryData,
  type DidOp,
} from "../../src/infrastructure/libs/cardano/txBuilder.ts";

import { bytesToHex } from "./cardanoScriptHelpers.ts";

export interface SampleAnchorMetadataOptions {
  /**
   * Stable name woven into the DID `did:web:api.civicship.app:users:<prefix>-create`
   * and into the blake2b leaf inputs so different scripts can produce
   * distinguishable on-chain artifacts.
   */
  prefix: string;
  /**
   * Override the `bid` prefix. Falls back to `prefix` when omitted (the
   * canary uses `canary_<ts>` even though its DID prefix is `canary`).
   */
  bidPrefix?: string;
  /** Append a second `u` (UPDATE) op (canary's dry-run uses 2 ops). */
  includeUpdate?: boolean;
}

export function buildSampleAuxiliaryData(opts: SampleAnchorMetadataOptions) {
  const { prefix, bidPrefix = prefix, includeUpdate = false } = opts;
  const encoder = new TextEncoder();
  const txRoot = blake2b(encoder.encode(`${prefix}-tx`), { dkLen: 32 });
  const vcRoot = blake2b(encoder.encode(`${prefix}-vc`), { dkLen: 32 });
  const docHash = blake2b(encoder.encode(`${prefix}-doc`), { dkLen: 32 });

  const createDid = `did:web:api.civicship.app:users:${prefix}-create`;
  const ops: DidOp[] = [
    {
      k: "c",
      did: createDid,
      h: bytesToHex(docHash),
      doc: {
        "@context": ["https://www.w3.org/ns/did/v1"],
        id: createDid,
        verificationMethod: [
          {
            id: `${createDid}#key-1`,
            type: "Ed25519VerificationKey2020",
            controller: createDid,
            publicKeyMultibase: "z6Mk" + "x".repeat(44),
          },
        ],
      },
      prev: null,
    },
  ];

  if (includeUpdate) {
    const updateDid = `did:web:api.civicship.app:users:${prefix}-update`;
    ops.push({
      k: "u",
      did: updateDid,
      h: bytesToHex(docHash),
      doc: {
        "@context": ["https://www.w3.org/ns/did/v1"],
        id: updateDid,
      },
      prev: bytesToHex(txRoot),
    });
  }

  return buildAuxiliaryData({
    bid: `${bidPrefix}_${Date.now().toString(36)}`,
    ts: Math.floor(Date.now() / 1000),
    tx: { root: txRoot, count: 1 },
    vc: { root: vcRoot, count: 1 },
    ops,
  });
}
