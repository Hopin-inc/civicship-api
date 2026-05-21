/**
 * Single source of truth for interpreting the `CARDANO_NETWORK` environment
 * variable.
 *
 * `CARDANO_NETWORK` is the one switch that decides whether civicship anchors
 * to Cardano mainnet or preprod. Anything other than the exact string
 * `mainnet` — including an unset variable — resolves to preprod, so no
 * deployment can anchor to mainnet implicitly / by accident.
 *
 * Read at call time (never memoised at module load) so every caller observes
 * a consistent value and tests can vary the env without `jest.resetModules`.
 *
 * Two encodings of the same decision are exposed because the codebase needs
 * both: the civicship-internal `ChainNetwork` enum form (DB rows, Blockfrost
 * client option) and the lowercase token form (`@blockfrost/blockfrost-js`
 * and CSL key derivation).
 */

import type { CardanoChainNetwork } from "@/infrastructure/libs/blockfrost/client";

/** Lowercase network token used by `@blockfrost/blockfrost-js` and CSL. */
export type CardanoNetworkToken = "mainnet" | "preprod";

/** `true` only when `CARDANO_NETWORK` is exactly `"mainnet"`. */
function isMainnet(): boolean {
  return process.env.CARDANO_NETWORK === "mainnet";
}

/**
 * `CARDANO_NETWORK` as the civicship-internal `ChainNetwork` enum value
 * (`CARDANO_MAINNET` / `CARDANO_PREPROD`).
 */
export function resolveCardanoChainNetwork(): CardanoChainNetwork {
  return isMainnet() ? "CARDANO_MAINNET" : "CARDANO_PREPROD";
}

/**
 * `CARDANO_NETWORK` as the lowercase token (`mainnet` / `preprod`) expected
 * by `@blockfrost/blockfrost-js` and `deriveCardanoKeypair`.
 */
export function resolveCardanoNetworkToken(): CardanoNetworkToken {
  return isMainnet() ? "mainnet" : "preprod";
}
