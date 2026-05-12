#!/usr/bin/env -S node --experimental-strip-types
/**
 * Derive the Cardano enterprise address for the platform anchoring key.
 *
 * Used by Phase 0/1 operations to:
 *   - Confirm the bech32 address corresponding to a seed already stored in
 *     Secret Manager (so the operator can feed it to the preprod faucet).
 *   - Generate a fresh 32-byte Ed25519 seed when bootstrapping a new env.
 *
 * Standalone (no DI / Prisma) so it can run from a local machine with only
 * the env vars below set.
 *
 * Required env (one of):
 *   CARDANO_PLATFORM_PRIVATE_KEY_HEX   32-byte Ed25519 seed (64 hex chars).
 *                                      In production sourced from Secret
 *                                      Manager. NEVER commit / log.
 *
 * Optional env:
 *   CARDANO_NETWORK                    "preprod" (default) | "mainnet"
 *   CARDANO_PLATFORM_ADDRESS           If set, compared to the derived
 *                                      address and a mismatch fails the run.
 *
 * Flags:
 *   --generate                         Generate a fresh seed instead of
 *                                      reading from env. Prints the seed
 *                                      hex to stdout — write it straight to
 *                                      Secret Manager, do NOT paste it
 *                                      anywhere else.
 *   --network=preprod|mainnet          Overrides CARDANO_NETWORK.
 *
 * Exit codes: 0 = OK, 1 = error (missing env / mismatch / invalid seed).
 *
 * Design references:
 *   docs/report/did-vc-internalization.md §I/Phase-0 0-2 (platform key bootstrap)
 *   src/infrastructure/libs/cardano/keygen.ts          (derivation primitives)
 */

import {
  type CardanoNetwork,
  deriveCardanoKeypair,
  generateCardanoKeypair,
} from "../src/infrastructure/libs/cardano/keygen.ts";
import {
  bytesToHex,
  parseFixedLengthHex,
} from "./lib/cardanoScriptHelpers.ts";

function parseFlags(argv: string[]): {
  generate: boolean;
  network?: CardanoNetwork;
} {
  const flags = { generate: false, network: undefined as CardanoNetwork | undefined };
  for (const arg of argv) {
    if (arg === "--generate") {
      flags.generate = true;
      continue;
    }
    const match = /^--network=(.+)$/.exec(arg);
    if (match) {
      const value = match[1];
      if (value !== "preprod" && value !== "mainnet") {
        throw new Error(`--network must be "preprod" or "mainnet", got "${value}"`);
      }
      flags.network = value;
    }
  }
  return flags;
}

function resolveNetwork(flagNetwork?: CardanoNetwork): CardanoNetwork {
  if (flagNetwork) return flagNetwork;
  const raw = process.env.CARDANO_NETWORK;
  if (!raw || raw === "preprod") return "preprod";
  if (raw === "mainnet") return "mainnet";
  throw new Error(`CARDANO_NETWORK must be "preprod" or "mainnet", got "${raw}"`);
}

function printKeypair(opts: {
  network: CardanoNetwork;
  addressBech32: string;
  publicKeyHex: string;
  paymentKeyHashHex: string;
}): void {
  process.stdout.write(`network              ${opts.network}\n`);
  process.stdout.write(`address (bech32)     ${opts.addressBech32}\n`);
  process.stdout.write(`public key hex       ${opts.publicKeyHex}\n`);
  process.stdout.write(`payment key hash hex ${opts.paymentKeyHashHex}\n`);
}

async function main(): Promise<number> {
  const flags = parseFlags(process.argv.slice(2));
  const network = resolveNetwork(flags.network);

  if (flags.generate) {
    process.stderr.write(
      "WARNING: generating a fresh seed. Write the printed `seed hex` line " +
        "directly to Secret Manager and discard the terminal scrollback. " +
        "Do NOT commit or share.\n\n",
    );
    const kp = await generateCardanoKeypair(network);
    process.stdout.write(`seed hex             ${bytesToHex(kp.privateKeySeed)}\n`);
    printKeypair({
      network: kp.network,
      addressBech32: kp.addressBech32,
      publicKeyHex: bytesToHex(kp.publicKey),
      paymentKeyHashHex: kp.paymentKeyHashHex,
    });
    return 0;
  }

  const seedHex = process.env.CARDANO_PLATFORM_PRIVATE_KEY_HEX;
  if (!seedHex) {
    process.stderr.write(
      "CARDANO_PLATFORM_PRIVATE_KEY_HEX is not set. Either pass --generate to " +
        "create a fresh seed, or export the seed from Secret Manager before " +
        "running this script.\n",
    );
    return 1;
  }

  const seed = parseFixedLengthHex(seedHex, 32, "CARDANO_PLATFORM_PRIVATE_KEY_HEX");
  const kp = deriveCardanoKeypair(seed, network);

  printKeypair({
    network: kp.network,
    addressBech32: kp.addressBech32,
    publicKeyHex: bytesToHex(kp.publicKey),
    paymentKeyHashHex: kp.paymentKeyHashHex,
  });

  const expected = process.env.CARDANO_PLATFORM_ADDRESS;
  if (expected && expected !== kp.addressBech32) {
    process.stderr.write(
      `\nMISMATCH: derived address does not match CARDANO_PLATFORM_ADDRESS env.\n` +
        `  derived  ${kp.addressBech32}\n` +
        `  env      ${expected}\n` +
        "Either the seed or the address env is wrong for this network.\n",
    );
    return 1;
  }
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    process.stderr.write(`ERROR: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  });
