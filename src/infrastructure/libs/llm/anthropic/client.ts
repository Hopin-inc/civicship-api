import Anthropic from "@anthropic-ai/sdk";
import { injectable } from "tsyringe";
import {
  LlmClient,
  LlmCompleteParams,
  LlmCompleteResult,
  LlmSystemBlock,
} from "@/infrastructure/libs/llm/types";

const DEFAULT_MAX_RETRIES = 2;

/**
 * Thin Anthropic SDK wrapper implementing the provider-neutral
 * `LlmClient` interface. Reads the API key from `ANTHROPIC_API_KEY`
 * at construction time (matching the existing `NmkrClient` convention
 * in this codebase) and fails fast if it is missing so that missing
 * configuration surfaces at boot, not at the first inference call.
 *
 * The SDK retries 429 and 5xx errors automatically with exponential
 * backoff (`maxRetries: 2` here). A wall-clock timeout on the whole
 * operation belongs in the caller — pass an `AbortController.signal`
 * through `params.signal`.
 */
@injectable()
export class AnthropicLlmClient implements LlmClient {
  private readonly client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set; AnthropicLlmClient cannot be constructed.");
    }
    this.client = new Anthropic({ apiKey, maxRetries: DEFAULT_MAX_RETRIES });
  }

  async complete(params: LlmCompleteParams): Promise<LlmCompleteResult> {
    const system = params.system.map(toAnthropicSystemBlock);

    const response = await this.client.messages.create(
      {
        model: params.model,
        max_tokens: params.maxTokens,
        system,
        messages: params.messages,
        ...(params.temperature !== undefined && { temperature: params.temperature }),
        ...(params.stopSequences &&
          params.stopSequences.length > 0 && { stop_sequences: params.stopSequences }),
      },
      { signal: params.signal },
    );

    // `response.content` is a discriminated union; narrow to text blocks
    // before reading `.text`. Phase 1 never requests thinking or tools,
    // so these blocks cannot appear in the response under the current
    // call shape — any that do slip in are dropped silently from the
    // returned `text`.
    //
    // `usage.outputTokens` still counts every generated block (thinking
    // included), so a future caller that turns on thinking or tool use
    // without first extending `LlmCompleteResult` will see a confusing
    // short `text` paired with a large `outputTokens`. When that day
    // comes, add `thinking?: string` / `toolUse?: ...` fields to
    // `LlmCompleteResult` and collect them here rather than trying to
    // reuse the `text` field.
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return {
      text,
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
        cacheCreationTokens: response.usage.cache_creation_input_tokens ?? 0,
      },
      stopReason: response.stop_reason,
    };
  }
}

/**
 * Map our `{text, cache?}` shape onto the Anthropic SDK's text block
 * with ephemeral `cache_control`. The wrapper always emits array-form
 * system prompts (never the bare-string shortcut) so adding a cached
 * block on a subsequent call does not change the prefix shape and
 * invalidate earlier cache reads.
 */
function toAnthropicSystemBlock(block: LlmSystemBlock): Anthropic.TextBlockParam {
  if (block.cache) {
    return {
      type: "text",
      text: block.text,
      cache_control: { type: "ephemeral" },
    };
  }
  return { type: "text", text: block.text };
}
