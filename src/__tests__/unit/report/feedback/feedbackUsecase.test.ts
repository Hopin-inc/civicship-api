import "reflect-metadata";
import { Prisma, ReportTemplateKind } from "@prisma/client";
import { container } from "tsyringe";
import ReportFeedbackUseCase from "@/application/domain/report/feedback/usecase";
import type { IContext } from "@/types/server";
import { GqlReportFeedbackType, GqlReportVariant } from "@/types/graphql";

/**
 * `submitReportFeedback` sits at the top of a short pipeline:
 * validate → lookup report → check duplicate → insert. These tests
 * exercise each gate and the success path; the repository is stubbed so
 * no Prisma / DB is involved.
 */
describe("ReportFeedbackUseCase.submitReportFeedback", () => {
  const communityId = "kibotcha";
  const reportId = "report-1";
  const userId = "user-1";

  const fakeCtx = {
    currentUser: { id: userId, sysRole: "USER" },
    issuer: {
      // Pass-through both variants: the usecase wraps the whole
      // check-then-write in `issuer.public`, while other call sites in
      // the domain still reach for `onlyBelongingCommunity`.
      public: (_ctx: IContext, fn: (tx: unknown) => Promise<unknown>) => fn({} as never),
      onlyBelongingCommunity: (_ctx: IContext, fn: (tx: unknown) => Promise<unknown>) =>
        fn({} as never),
    },
  } as unknown as IContext;

  let feedbackService: {
    createFeedback: jest.Mock;
    getExistingFeedback: jest.Mock;
    listFeedbacksByReport: jest.Mock;
    listFeedbacksByReportIds: jest.Mock;
    getTemplateStats: jest.Mock;
  };
  let reportService: { getReportById: jest.Mock };
  let usecase: ReportFeedbackUseCase;

  beforeEach(() => {
    container.reset();
    feedbackService = {
      createFeedback: jest.fn(),
      getExistingFeedback: jest.fn().mockResolvedValue(null),
      listFeedbacksByReport: jest.fn(),
      listFeedbacksByReportIds: jest.fn(),
      getTemplateStats: jest.fn(),
    };
    reportService = {
      getReportById: jest
        .fn()
        .mockResolvedValue({ id: reportId, communityId, variant: "WEEKLY_SUMMARY" }),
    };

    container.register("ReportFeedbackService", { useValue: feedbackService });
    container.register("ReportService", { useValue: reportService });
    usecase = container.resolve(ReportFeedbackUseCase);
  });

  function defaultInput() {
    return {
      input: {
        reportId,
        rating: 4,
        feedbackType: GqlReportFeedbackType.Quality,
        comment: "great summary",
      },
      permission: { communityId },
    };
  }

  it("inserts a feedback row on the happy path", async () => {
    feedbackService.createFeedback.mockResolvedValue({
      id: "feedback-1",
      reportId,
      userId,
      rating: 4,
      feedbackType: "QUALITY",
      sectionKey: null,
      comment: "great summary",
      createdAt: new Date(),
    });

    const result = await usecase.submitReportFeedback(defaultInput(), fakeCtx);

    expect(feedbackService.createFeedback).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ reportId, userId, rating: 4 }),
      expect.anything(), // tx propagated through the atomic wrapper
    );
    expect(result.__typename).toBe("SubmitReportFeedbackSuccess");
  });

  it.each([0, 6, 3.5, Number.NaN, -1])(
    "rejects rating=%s with ValidationError (out of 1..5 or not an integer)",
    async (rating) => {
      const args = defaultInput();
      args.input.rating = rating as number;
      await expect(usecase.submitReportFeedback(args, fakeCtx)).rejects.toThrow(/rating/);
      expect(feedbackService.createFeedback).not.toHaveBeenCalled();
    },
  );

  it("throws when the report does not exist", async () => {
    reportService.getReportById.mockResolvedValue(null);
    await expect(usecase.submitReportFeedback(defaultInput(), fakeCtx)).rejects.toThrow(
      /Report not found/,
    );
    expect(feedbackService.createFeedback).not.toHaveBeenCalled();
  });

  it("throws when the report belongs to a different community (cross-community probe)", async () => {
    reportService.getReportById.mockResolvedValue({
      id: reportId,
      communityId: "other-community",
      variant: "WEEKLY_SUMMARY",
    });
    // NotFoundError — not an AuthorizationError — to avoid leaking the
    // existence of the report to non-members.
    await expect(usecase.submitReportFeedback(defaultInput(), fakeCtx)).rejects.toThrow(
      /Report not found/,
    );
    expect(feedbackService.createFeedback).not.toHaveBeenCalled();
  });

  it("throws when the user has already submitted for this report", async () => {
    feedbackService.getExistingFeedback.mockResolvedValue({
      id: "feedback-0",
      reportId,
      userId,
      rating: 5,
    });
    await expect(usecase.submitReportFeedback(defaultInput(), fakeCtx)).rejects.toThrow(
      /already submitted/,
    );
    expect(feedbackService.createFeedback).not.toHaveBeenCalled();
  });

  it("rejects an over-long comment", async () => {
    const args = defaultInput();
    args.input.comment = "x".repeat(3000);
    await expect(usecase.submitReportFeedback(args, fakeCtx)).rejects.toThrow(/comment/);
    expect(feedbackService.createFeedback).not.toHaveBeenCalled();
  });

  it("throws AuthenticationError when there is no current user", async () => {
    const anonCtx = {
      ...fakeCtx,
      currentUser: null,
    } as unknown as IContext;
    await expect(usecase.submitReportFeedback(defaultInput(), anonCtx)).rejects.toThrow(
      /logged in/,
    );
  });

  it("translates a racing P2002 into the same ValidationError as the pre-check", async () => {
    // Simulate a second writer landing between our duplicate check and
    // the insert: pre-check sees no row, but Prisma raises P2002 on
    // write. The usecase must surface the same error code as the
    // pre-check path so clients get a consistent message.
    feedbackService.createFeedback.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      }),
    );
    await expect(usecase.submitReportFeedback(defaultInput(), fakeCtx)).rejects.toThrow(
      /already submitted/,
    );
  });
});

/**
 * Phase 1.5 admin: review-style individual feedback list. The usecase
 * is the input-validation seam (page bounds, rating bounds, version
 * sanity) and a thin service pass-through; these tests pin the
 * validation contract and the argument shape that flows into the
 * service so a future repository refactor cannot silently drop a
 * filter (variant / version / kind / feedbackType / maxRating). The
 * service layer is stubbed — no Prisma is involved.
 */
describe("ReportFeedbackUseCase.viewAdminTemplateFeedbacks", () => {
  const fakeCtx = {} as IContext;

  let feedbackService: { listAdminTemplateFeedbacks: jest.Mock };
  let reportService: { getReportById: jest.Mock };
  let usecase: ReportFeedbackUseCase;

  beforeEach(() => {
    container.reset();
    feedbackService = {
      listAdminTemplateFeedbacks: jest
        .fn()
        .mockResolvedValue({ items: [], totalCount: 0 }),
    };
    reportService = { getReportById: jest.fn() };
    container.register("ReportFeedbackService", { useValue: feedbackService });
    container.register("ReportService", { useValue: reportService });
    usecase = container.resolve(ReportFeedbackUseCase);
  });

  // The codegen `InputMaybe<T>` type is `T | undefined` (no `null`), so
  // the default fixture omits optional fields rather than zeroing them.
  // Variant is required.
  function defaultArgs(): Parameters<ReportFeedbackUseCase["viewAdminTemplateFeedbacks"]>[0] {
    return { variant: GqlReportVariant.WeeklySummary };
  }

  it("forwards every filter through to the service unchanged (happy path)", async () => {
    await usecase.viewAdminTemplateFeedbacks(
      {
        variant: GqlReportVariant.WeeklySummary,
        version: 2,
        kind: ReportTemplateKind.GENERATION,
        feedbackType: GqlReportFeedbackType.Quality,
        maxRating: 3,
        cursor: "feedback-cursor",
        first: 50,
      },
      fakeCtx,
    );

    expect(feedbackService.listAdminTemplateFeedbacks).toHaveBeenCalledWith(fakeCtx, {
      variant: "WEEKLY_SUMMARY",
      version: 2,
      kind: ReportTemplateKind.GENERATION,
      feedbackType: "QUALITY",
      maxRating: 3,
      cursor: "feedback-cursor",
      first: 50,
    });
  });

  it("defaults kind to GENERATION when the caller omits it", async () => {
    // Codegen treats every argument as nullable so a no-default GraphQL
    // call surfaces here as `kind: null`. Mirror the equivalent
    // behaviour in `viewReportTemplateStatsBreakdown` — coerce to
    // GENERATION at the usecase boundary.
    await usecase.viewAdminTemplateFeedbacks(defaultArgs(), fakeCtx);
    expect(feedbackService.listAdminTemplateFeedbacks).toHaveBeenCalledWith(
      fakeCtx,
      expect.objectContaining({ kind: ReportTemplateKind.GENERATION }),
    );
  });

  it.each([0, 6, 3.5])(
    "rejects maxRating=%s with ValidationError (not in 1..5 or non-integer)",
    async (maxRating) => {
      await expect(
        usecase.viewAdminTemplateFeedbacks(
          { ...defaultArgs(), maxRating: maxRating as number },
          fakeCtx,
        ),
      ).rejects.toThrow(/maxRating/);
      expect(feedbackService.listAdminTemplateFeedbacks).not.toHaveBeenCalled();
    },
  );

  it.each([0, -1, 1.5])(
    "rejects version=%s with ValidationError (not a positive integer)",
    async (version) => {
      await expect(
        usecase.viewAdminTemplateFeedbacks(
          { ...defaultArgs(), version: version as number },
          fakeCtx,
        ),
      ).rejects.toThrow(/version/);
      expect(feedbackService.listAdminTemplateFeedbacks).not.toHaveBeenCalled();
    },
  );

  it("rejects out-of-range first with ValidationError", async () => {
    await expect(
      usecase.viewAdminTemplateFeedbacks({ ...defaultArgs(), first: 1000 }, fakeCtx),
    ).rejects.toThrow(/first/);
    expect(feedbackService.listAdminTemplateFeedbacks).not.toHaveBeenCalled();
  });

  it("returns a connection shape with edges / pageInfo / totalCount", async () => {
    feedbackService.listAdminTemplateFeedbacks.mockResolvedValue({
      items: [
        {
          id: "feedback-1",
          reportId: "report-1",
          userId: "user-1",
          rating: 2,
          feedbackType: "QUALITY",
          sectionKey: null,
          comment: "missing recent activity",
          createdAt: new Date(),
        },
      ],
      totalCount: 1,
    });

    const result = await usecase.viewAdminTemplateFeedbacks(defaultArgs(), fakeCtx);
    expect(result.totalCount).toBe(1);
    expect(result.edges).toHaveLength(1);
    expect(result.edges?.[0]?.cursor).toBe("feedback-1");
    expect(result.pageInfo.hasNextPage).toBe(false);
  });
});
