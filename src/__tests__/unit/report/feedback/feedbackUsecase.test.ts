import "reflect-metadata";
import { Prisma } from "@prisma/client";
import { container } from "tsyringe";
import ReportFeedbackUseCase from "@/application/domain/report/feedback/usecase";
import type { IContext } from "@/types/server";
import { GqlReportFeedbackType } from "@/types/graphql";

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
