import "reflect-metadata";
import { container } from "tsyringe";
import ReportJudgeService from "@/application/domain/report/judgeService";
import type { LlmCompleteResult } from "@/infrastructure/libs/llm/types";
import type { IContext } from "@/types/server";

/**
 * `ReportJudgeService` unit tests cover the two pieces the usecase
 * relies on: template selection (with the SYSTEM-only safety net) and
 * JSON parsing of the judge response (including the lenient
 * fence-stripping). The LLM client is mocked end-to-end — these tests
 * never hit the network.
 */
describe("ReportJudgeService", () => {
  // test-only: the service only reaches into ctx.issuer for repository
  // calls we have already mocked at the IReportRepository boundary, so
  // a placeholder cast is sufficient.
  const fakeCtx = {} as IContext;

  let repository: {
    findJudgeTemplate: jest.Mock;
  };
  let llmClient: { complete: jest.Mock };
  let service: ReportJudgeService;

  beforeEach(() => {
    container.reset();
    repository = { findJudgeTemplate: jest.fn() };
    llmClient = { complete: jest.fn() };

    container.register("ReportRepository", { useValue: repository });
    container.register("LlmClient", { useValue: llmClient });
    service = container.resolve(ReportJudgeService);
  });

  describe("selectJudgeTemplate", () => {
    it("returns null when no judge template exists", async () => {
      repository.findJudgeTemplate.mockResolvedValue(null);
      const result = await service.selectJudgeTemplate(fakeCtx, "WEEKLY_SUMMARY");
      expect(result).toBeNull();
    });

    it("returns the template when SYSTEM-scope", async () => {
      const template = { id: "judge-1", scope: "SYSTEM" };
      repository.findJudgeTemplate.mockResolvedValue(template);
      const result = await service.selectJudgeTemplate(fakeCtx, "WEEKLY_SUMMARY");
      expect(result).toBe(template);
    });

    it("throws when the template is COMMUNITY-scope (defence in depth)", async () => {
      // The repository filter already rejects COMMUNITY judge rows, but
      // a future seed leak should not silently change which prompt
      // grades reports — surface as a hard error instead.
      repository.findJudgeTemplate.mockResolvedValue({ id: "judge-2", scope: "COMMUNITY" });
      await expect(
        service.selectJudgeTemplate(fakeCtx, "WEEKLY_SUMMARY"),
      ).rejects.toThrow(/SYSTEM scope/);
    });
  });

  describe("executeJudge", () => {
    const baseTemplate = {
      id: "judge-1",
      systemPrompt: "judge-sys",
      userPromptTemplate:
        "out=${output_markdown};payload=${input_payload};criteria=${judge_criteria}",
      model: "claude-haiku-4-5-20251001",
      maxTokens: 1000,
      temperature: 0,
      stopSequences: [],
    };

    function makeLlmResult(text: string): LlmCompleteResult {
      return {
        text,
        model: "claude-haiku-4-5-20251001",
        usage: {
          inputTokens: 100,
          outputTokens: 50,
          cacheReadTokens: 0,
          cacheCreationTokens: 0,
        },
        stopReason: "end_turn",
      };
    }

    it("renders the user prompt with all three placeholders", async () => {
      llmClient.complete.mockResolvedValue(
        makeLlmResult('{"score": 80, "breakdown": {}, "issues": [], "strengths": []}'),
      );

      await service.executeJudge(fakeCtx, baseTemplate as never, {
        outputMarkdown: "MARKDOWN",
        inputPayload: { foo: 1 },
        judgeCriteria: { items: ["criterion-A"] },
      });

      const args = llmClient.complete.mock.calls[0][0];
      expect(args.messages[0].content).toContain("out=MARKDOWN");
      expect(args.messages[0].content).toContain('payload={"foo":1}');
      expect(args.messages[0].content).toContain('criteria={"items":["criterion-A"]}');
      expect(args.system[0].text).toBe(baseTemplate.systemPrompt);
      expect(args.system[0].cache).toBe(true);
    });

    it("parses a plain JSON response", async () => {
      llmClient.complete.mockResolvedValue(
        makeLlmResult(
          '{"score": 85, "breakdown": {"data_accuracy": 90}, "issues": ["minor"], "strengths": ["clear"]}',
        ),
      );

      const result = await service.executeJudge(fakeCtx, baseTemplate as never, {
        outputMarkdown: "x",
        inputPayload: {},
      });
      expect(result.score).toBe(85);
      expect(result.breakdown).toEqual({ data_accuracy: 90 });
      expect(result.issues).toEqual(["minor"]);
      expect(result.strengths).toEqual(["clear"]);
    });

    it("strips a ```json ... ``` fence before parsing", async () => {
      // Haiku is generally well-behaved, but the cost of a stray fence
      // breaking the entire judge step is high. The wrapper strips one
      // optional fence; the test pins that behaviour.
      llmClient.complete.mockResolvedValue(
        makeLlmResult('```json\n{"score": 70, "breakdown": {}, "issues": [], "strengths": []}\n```'),
      );

      const result = await service.executeJudge(fakeCtx, baseTemplate as never, {
        outputMarkdown: "x",
        inputPayload: {},
      });
      expect(result.score).toBe(70);
    });

    it("clamps an out-of-range score to [0, 100]", async () => {
      llmClient.complete.mockResolvedValue(
        makeLlmResult('{"score": 150, "breakdown": {}, "issues": [], "strengths": []}'),
      );
      const result = await service.executeJudge(fakeCtx, baseTemplate as never, {
        outputMarkdown: "x",
        inputPayload: {},
      });
      expect(result.score).toBe(100);
    });

    it("throws when the LLM returns invalid JSON", async () => {
      llmClient.complete.mockResolvedValue(makeLlmResult("not even close to json"));
      await expect(
        service.executeJudge(fakeCtx, baseTemplate as never, {
          outputMarkdown: "x",
          inputPayload: {},
        }),
      ).rejects.toThrow(/not valid JSON/);
    });

    it("throws when the response is missing the score field", async () => {
      llmClient.complete.mockResolvedValue(
        makeLlmResult('{"breakdown": {}, "issues": [], "strengths": []}'),
      );
      await expect(
        service.executeJudge(fakeCtx, baseTemplate as never, {
          outputMarkdown: "x",
          inputPayload: {},
        }),
      ).rejects.toThrow(/missing numeric "score"/);
    });
  });
});
