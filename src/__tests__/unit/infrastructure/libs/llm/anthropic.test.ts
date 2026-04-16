import "reflect-metadata";

/**
 * Mock the Anthropic SDK before importing the wrapper. `jest.mock`
 * with the default-export-as-a-class shape so that
 * `new Anthropic({...})` in the wrapper constructor picks up our stub
 * and `client.messages.create(...)` is fully observable from tests.
 */
const mockMessagesCreate = jest.fn();
const mockAnthropicConstructor = jest.fn();

jest.mock("@anthropic-ai/sdk", () => {
  const MockAnthropic = jest.fn().mockImplementation((opts: unknown) => {
    mockAnthropicConstructor(opts);
    return { messages: { create: mockMessagesCreate } };
  });
  return { __esModule: true, default: MockAnthropic };
});

import { AnthropicLlmClient } from "@/infrastructure/libs/llm/anthropic/client";

describe("AnthropicLlmClient", () => {
  const originalApiKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "test-api-key";
  });

  afterAll(() => {
    if (originalApiKey === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = originalApiKey;
    }
  });

  describe("constructor", () => {
    it("throws when ANTHROPIC_API_KEY is missing", () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(() => new AnthropicLlmClient()).toThrow(/ANTHROPIC_API_KEY is not set/);
    });

    it("constructs the SDK with maxRetries=2 and the resolved key", () => {
      new AnthropicLlmClient();
      expect(mockAnthropicConstructor).toHaveBeenCalledWith({
        apiKey: "test-api-key",
        maxRetries: 2,
      });
    });
  });

  describe("complete", () => {
    const defaultResponse = {
      content: [{ type: "text", text: "hello" }],
      model: "claude-sonnet-4-6",
      stop_reason: "end_turn",
      usage: {
        input_tokens: 100,
        output_tokens: 30,
        cache_read_input_tokens: 80,
        cache_creation_input_tokens: 0,
      },
    };

    it("maps { cache: true } onto a cache_control ephemeral text block and leaves uncached blocks bare", async () => {
      mockMessagesCreate.mockResolvedValueOnce(defaultResponse);
      const sut = new AnthropicLlmClient();

      await sut.complete({
        system: [{ text: "stable preamble", cache: true }, { text: "volatile tail" }],
        messages: [{ role: "user", content: "hi" }],
        model: "claude-sonnet-4-6",
        maxTokens: 1024,
      });

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          system: [
            {
              type: "text",
              text: "stable preamble",
              cache_control: { type: "ephemeral" },
            },
            { type: "text", text: "volatile tail" },
          ],
        }),
        expect.any(Object),
      );
    });

    it("maps snake_case usage fields to camelCase and defaults cache metrics to 0 when absent", async () => {
      mockMessagesCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "ok" }],
        model: "claude-sonnet-4-6",
        stop_reason: "end_turn",
        usage: {
          input_tokens: 10,
          output_tokens: 5,
          // cache_* fields omitted — wrapper should default both to 0
        },
      });
      const sut = new AnthropicLlmClient();

      const result = await sut.complete({
        system: [{ text: "p" }],
        messages: [{ role: "user", content: "q" }],
        model: "claude-sonnet-4-6",
        maxTokens: 256,
      });

      expect(result.usage).toEqual({
        inputTokens: 10,
        outputTokens: 5,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
      });
    });

    it("concatenates multiple text blocks into a single string and ignores non-text blocks", async () => {
      mockMessagesCreate.mockResolvedValueOnce({
        content: [
          { type: "thinking", thinking: "internal" },
          { type: "text", text: "part 1 " },
          { type: "tool_use", id: "toolu_1", name: "x", input: {} },
          { type: "text", text: "part 2" },
        ],
        model: "claude-opus-4-6",
        stop_reason: "end_turn",
        usage: { input_tokens: 1, output_tokens: 1 },
      });
      const sut = new AnthropicLlmClient();

      const result = await sut.complete({
        system: [{ text: "p" }],
        messages: [{ role: "user", content: "q" }],
        model: "claude-opus-4-6",
        maxTokens: 256,
      });

      expect(result.text).toBe("part 1 part 2");
      expect(result.stopReason).toBe("end_turn");
      expect(result.model).toBe("claude-opus-4-6");
    });

    it("omits temperature from the SDK payload when the caller did not supply it (Opus 4.7 would otherwise 400)", async () => {
      mockMessagesCreate.mockResolvedValueOnce(defaultResponse);
      const sut = new AnthropicLlmClient();

      await sut.complete({
        system: [{ text: "p" }],
        messages: [{ role: "user", content: "q" }],
        model: "claude-opus-4-7",
        maxTokens: 256,
      });

      const payload = mockMessagesCreate.mock.calls[0][0];
      expect(payload).not.toHaveProperty("temperature");
    });

    it("passes temperature through when provided", async () => {
      mockMessagesCreate.mockResolvedValueOnce(defaultResponse);
      const sut = new AnthropicLlmClient();

      await sut.complete({
        system: [{ text: "p" }],
        messages: [{ role: "user", content: "q" }],
        model: "claude-sonnet-4-6",
        maxTokens: 256,
        temperature: 0.7,
      });

      expect(mockMessagesCreate.mock.calls[0][0]).toMatchObject({ temperature: 0.7 });
    });

    it("forwards AbortSignal to the SDK request options", async () => {
      mockMessagesCreate.mockResolvedValueOnce(defaultResponse);
      const sut = new AnthropicLlmClient();
      const controller = new AbortController();

      await sut.complete({
        system: [{ text: "p" }],
        messages: [{ role: "user", content: "q" }],
        model: "claude-sonnet-4-6",
        maxTokens: 256,
        signal: controller.signal,
      });

      expect(mockMessagesCreate).toHaveBeenCalledWith(expect.any(Object), {
        signal: controller.signal,
      });
    });

    it("omits stop_sequences from the SDK payload when the caller passes an empty list", async () => {
      mockMessagesCreate.mockResolvedValueOnce(defaultResponse);
      const sut = new AnthropicLlmClient();

      await sut.complete({
        system: [{ text: "p" }],
        messages: [{ role: "user", content: "q" }],
        model: "claude-sonnet-4-6",
        maxTokens: 256,
        stopSequences: [],
      });

      expect(mockMessagesCreate.mock.calls[0][0]).not.toHaveProperty("stop_sequences");
    });
  });
});
