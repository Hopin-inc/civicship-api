/**
 * Thin, provider-neutral LLM client interface consumed by the Report
 * AI-generation usecase (PR-D onwards). Kept intentionally small for
 * Phase 1 — blocking `complete()` only, no streaming, no tool use.
 *
 * The concrete implementation (AnthropicLlmClient) lives in
 * `./anthropic/client.ts`; additional providers (Gemini, OpenAI) can
 * ship as sibling folders without touching the callers.
 */

/**
 * One block of the system prompt. Split into blocks so the caller can
 * mark only the stable preamble with `cache: true` (ephemeral prompt
 * caching) while keeping volatile segments — date stamps, per-request
 * IDs — uncached in a trailing block.
 *
 * Minimum cacheable prefix at the provider layer: 4096 tokens on Opus
 * 4.6/4.7, 2048 on Sonnet 4.6. Shorter prefixes silently don't cache —
 * `cache: true` never errors, it just stops paying off.
 */
export interface LlmSystemBlock {
  text: string;
  cache?: boolean;
}

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LlmCompleteParams {
  /**
   * Render order at the provider is `tools` → `system` → `messages`.
   * Keep stable segments (frozen instructions, shared examples) first
   * and any per-request content last; any byte change in the prefix
   * invalidates everything after it in the cache.
   */
  system: LlmSystemBlock[];
  messages: LlmMessage[];

  /**
   * Provider-specific model identifier. The wrapper does not validate
   * or default — the caller (template row in the DB) decides. Known
   * good values at time of writing: `claude-opus-4-7`, `claude-opus-4-6`,
   * `claude-sonnet-4-6`, `claude-haiku-4-5`.
   */
  model: string;

  /**
   * Hard ceiling on the number of tokens the model may generate.
   *
   * Model maximums at time of writing (used as a hard cap by the API):
   *   - Opus 4.6 / Opus 4.7: 128K
   *   - Sonnet 4.6 / Haiku 4.5: 64K
   *
   * The wrapper is non-streaming (`complete()` only in Phase 1) and the
   * Anthropic SDK requires streaming for "very large" values to avoid
   * HTTP timeouts — in practice, anything beyond ~16K starts hitting
   * the default SDK timeout. Keep `maxTokens` well under the model
   * ceiling unless the caller also switches to a streaming entry
   * point. ~16000 is a safe non-streaming default for report
   * generation, well inside both model caps and SDK timeouts.
   */
  maxTokens: number;

  /**
   * Optional. On Opus 4.7 this parameter is removed (API returns 400);
   * on Opus 4.6 and Sonnet 4.6 it is accepted. The wrapper passes it
   * through verbatim when set, and omits the field entirely when
   * undefined — the model-aware decision stays in the caller.
   */
  temperature?: number;

  stopSequences?: string[];

  /**
   * Per-request abort hook. The Anthropic SDK handles retries
   * (max 2, exponential backoff) internally; wrap the whole call in an
   * `AbortController` if the caller wants a wall-clock timeout.
   */
  signal?: AbortSignal;
}

export interface LlmUsage {
  /** Prompt tokens processed at full price (not served from cache). */
  inputTokens: number;
  /** Generated tokens. */
  outputTokens: number;
  /** Prompt tokens served from cache (~0.1× input price). */
  cacheReadTokens: number;
  /** Prompt tokens written to cache this request (~1.25× input price). */
  cacheCreationTokens: number;
}

export interface LlmCompleteResult {
  /**
   * Concatenation of every text block in the response. Non-text blocks
   * (thinking, tool use) are ignored in Phase 1; if/when the wrapper
   * starts producing them, callers of this shape will break noisily
   * rather than silently drop reasoning.
   */
  text: string;
  /** Echoed back from the provider — may differ from the requested model alias. */
  model: string;
  usage: LlmUsage;
  stopReason: string | null;
}

export interface LlmClient {
  complete(params: LlmCompleteParams): Promise<LlmCompleteResult>;
}
