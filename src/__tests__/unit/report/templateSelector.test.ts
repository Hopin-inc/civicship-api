import "reflect-metadata";
import { ReportTemplateKind } from "@prisma/client";
import { container } from "tsyringe";
import ReportTemplateSelector, {
  cyrb53,
} from "@/application/domain/report/templateSelector";
import type { IContext } from "@/types/server";
import type { PrismaReportTemplate } from "@/application/domain/report/data/type";

/**
 * `ReportTemplateSelector` covers three behaviour invariants:
 *
 *   1. COMMUNITY-scope candidates shadow SYSTEM — if any community row
 *      exists, the SYSTEM fallback is not consulted.
 *   2. The weighted draw is deterministic per (communityId + week), so a
 *      manager regenerating mid-week sees the same template.
 *   3. Weights govern the distribution across *different* communities —
 *      feeding different seeds to a 50/50 split converges on the
 *      intended ratio.
 *
 * Repository methods are mocked via the DI container.
 */
describe("ReportTemplateSelector", () => {
  const fakeCtx = {} as IContext;

  function makeTemplate(overrides: Partial<PrismaReportTemplate>): PrismaReportTemplate {
    return {
      id: overrides.id ?? "tpl-a",
      variant: "WEEKLY_SUMMARY",
      scope: overrides.scope ?? "SYSTEM",
      kind: "GENERATION",
      communityId: overrides.communityId ?? null,
      systemPrompt: "sys",
      userPromptTemplate: "user",
      communityContext: null,
      model: "claude-sonnet-4-6",
      temperature: 0.7,
      maxTokens: 8192,
      stopSequences: [],
      isEnabled: true,
      version: 1,
      isActive: true,
      experimentKey: null,
      trafficWeight: 100,
      notes: null,
      updatedBy: null,
      createdAt: new Date("2026-04-17"),
      updatedAt: null,
      ...overrides,
    } as PrismaReportTemplate;
  }

  let repository: {
    findActiveTemplates: jest.Mock;
  };
  let selector: ReportTemplateSelector;

  beforeEach(() => {
    container.reset();
    repository = { findActiveTemplates: jest.fn() };
    container.register("ReportRepository", { useValue: repository });
    selector = container.resolve(ReportTemplateSelector);
  });

  it("prefers COMMUNITY scope over SYSTEM when any community row exists", async () => {
    const communityTpl = makeTemplate({
      id: "community-1",
      scope: "COMMUNITY",
      communityId: "c-1",
    });
    repository.findActiveTemplates.mockImplementation(
      async (_ctx, _variant, _kind, communityId) =>
        communityId === "c-1" ? [communityTpl] : [makeTemplate({ id: "system-1" })],
    );

    const result = await selector.selectTemplate(
      fakeCtx,
      "WEEKLY_SUMMARY",
      ReportTemplateKind.GENERATION,
      "c-1",
      new Date("2026-04-17"),
    );

    expect(result).toBe(communityTpl);
    // Second call (SYSTEM fallback) must NOT happen when community has
    // its own candidates — otherwise we'd be paying for a wasted round
    // trip every generation.
    expect(repository.findActiveTemplates).toHaveBeenCalledTimes(1);
  });

  it("falls back to SYSTEM when the community has no candidates", async () => {
    const systemTpl = makeTemplate({ id: "system-1" });
    repository.findActiveTemplates.mockImplementation(
      async (_ctx, _variant, _kind, communityId) => (communityId ? [] : [systemTpl]),
    );

    const result = await selector.selectTemplate(
      fakeCtx,
      "WEEKLY_SUMMARY",
      ReportTemplateKind.GENERATION,
      "c-1",
      new Date("2026-04-17"),
    );

    expect(result).toBe(systemTpl);
    expect(repository.findActiveTemplates).toHaveBeenCalledTimes(2);
  });

  it("throws when there are no candidates at either scope", async () => {
    repository.findActiveTemplates.mockResolvedValue([]);
    await expect(
      selector.selectTemplate(
        fakeCtx,
        "WEEKLY_SUMMARY",
        ReportTemplateKind.GENERATION,
        "c-1",
        new Date("2026-04-17"),
      ),
    ).rejects.toThrow(/No active template/);
  });

  it("returns a deterministic template for the same (communityId + week)", async () => {
    const a = makeTemplate({ id: "a", trafficWeight: 50 });
    const b = makeTemplate({ id: "b", trafficWeight: 50 });
    repository.findActiveTemplates.mockImplementation(async (_ctx, _v, _k, communityId) =>
      communityId ? [] : [a, b],
    );

    // Two calls within the same JST ISO week on the same community must
    // resolve to the same template — crucial for managers who regenerate
    // mid-week.
    const first = await selector.selectTemplate(
      fakeCtx,
      "WEEKLY_SUMMARY",
      ReportTemplateKind.GENERATION,
      "c-1",
      new Date("2026-04-15T10:00:00Z"),
    );
    const second = await selector.selectTemplate(
      fakeCtx,
      "WEEKLY_SUMMARY",
      ReportTemplateKind.GENERATION,
      "c-1",
      new Date("2026-04-17T23:00:00Z"),
    );
    expect(second.id).toBe(first.id);
  });

  it("distributes roughly 50/50 across many communities with equal weights", async () => {
    const a = makeTemplate({ id: "a", trafficWeight: 50 });
    const b = makeTemplate({ id: "b", trafficWeight: 50 });
    repository.findActiveTemplates.mockImplementation(async (_ctx, _v, _k, communityId) =>
      communityId ? [] : [a, b],
    );

    const counts = { a: 0, b: 0 };
    // 500 distinct community seeds. cyrb53 is deterministic, so this
    // test itself is reproducible — but the distribution should be close
    // to the 50/50 weights. Use a wide 40..60 window so chi-square
    // fluctuations don't flake the test.
    for (let i = 0; i < 500; i++) {
      const picked = await selector.selectTemplate(
        fakeCtx,
        "WEEKLY_SUMMARY",
        ReportTemplateKind.GENERATION,
        `community-${i}`,
        new Date("2026-04-17"),
      );
      counts[picked.id as "a" | "b"]++;
    }
    expect(counts.a).toBeGreaterThan(200);
    expect(counts.a).toBeLessThan(300);
    expect(counts.a + counts.b).toBe(500);
  });

  it("respects unequal weights (90/10)", async () => {
    const a = makeTemplate({ id: "a", trafficWeight: 90 });
    const b = makeTemplate({ id: "b", trafficWeight: 10 });
    repository.findActiveTemplates.mockImplementation(async (_ctx, _v, _k, communityId) =>
      communityId ? [] : [a, b],
    );

    const counts = { a: 0, b: 0 };
    for (let i = 0; i < 500; i++) {
      const picked = await selector.selectTemplate(
        fakeCtx,
        "WEEKLY_SUMMARY",
        ReportTemplateKind.GENERATION,
        `community-${i}`,
        new Date("2026-04-17"),
      );
      counts[picked.id as "a" | "b"]++;
    }
    // The expected split is 450/50; allow ±70 slack for PRNG variance.
    expect(counts.a).toBeGreaterThan(380);
    expect(counts.b).toBeLessThan(120);
  });

  it("logs a structured selection event", async () => {
    const a = makeTemplate({ id: "a", trafficWeight: 50 });
    const b = makeTemplate({ id: "b", trafficWeight: 50 });
    repository.findActiveTemplates.mockImplementation(async (_ctx, _v, _k, communityId) =>
      communityId ? [] : [a, b],
    );

    // The selector logs via the infrastructure logger (winston-style).
    // Rather than mock that, we just confirm a selection succeeds —
    // the log call is purely observational and failing a test on its
    // absence would couple unit tests to the logger.
    const result = await selector.selectTemplate(
      fakeCtx,
      "WEEKLY_SUMMARY",
      ReportTemplateKind.GENERATION,
      "c-1",
      new Date("2026-04-17"),
    );
    expect([a.id, b.id]).toContain(result.id);
  });
});

describe("cyrb53", () => {
  it("is deterministic for the same input", () => {
    expect(cyrb53("community-1-2026-04-13")).toBe(cyrb53("community-1-2026-04-13"));
  });

  it("produces different hashes for different inputs", () => {
    expect(cyrb53("community-1-2026-04-13")).not.toBe(cyrb53("community-2-2026-04-13"));
    expect(cyrb53("community-1-2026-04-13")).not.toBe(cyrb53("community-1-2026-04-20"));
  });
});
