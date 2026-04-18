import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import { FeedbackType } from "@prisma/client";
import { AuthenticationError, NotFoundError, ValidationError } from "@/errors/graphql";
import ReportService from "@/application/domain/report/service";
import ReportFeedbackService from "@/application/domain/report/feedback/service";
import ReportFeedbackPresenter from "@/application/domain/report/feedback/presenter";
import {
  GqlMutationSubmitReportFeedbackArgs,
  GqlSubmitReportFeedbackPayload,
  GqlQueryReportTemplateStatsArgs,
  GqlReportTemplateStats,
} from "@/types/graphql";

const MAX_FEEDBACKS_PER_PAGE = 100;
const DEFAULT_FEEDBACKS_PER_PAGE = 20;
const MAX_COMMENT_LENGTH = 2000;
const MAX_SECTION_KEY_LENGTH = 128;

@injectable()
export default class ReportFeedbackUseCase {
  constructor(
    @inject("ReportFeedbackService") private readonly feedbackService: ReportFeedbackService,
    @inject("ReportService") private readonly reportService: ReportService,
  ) {}

  /**
   * Submit a feedback row for a report. Validation is layered:
   *   1. `rating` fits 1..5 (DB has the same CHECK but we want a
   *      structured ValidationError rather than a PrismaClientKnownRequestError).
   *   2. Optional `comment` / `sectionKey` respect length caps so a
   *      misbehaving client can't push multi-MB rows.
   *   3. The target `Report` exists and belongs to the community the
   *      caller already passed authz for — the `@authz IsCommunityMember`
   *      rule checks `permission.communityId`, but we still need to
   *      confirm the `reportId` is actually from that community; otherwise
   *      a member of community A could rate a report of community B by
   *      forging the report id.
   *   4. One submit per (report, user). Pre-checked here so the client
   *      gets a ConflictError *before* the DB raises P2002 — friendlier
   *      message, same invariant. The @@unique([reportId, userId]) index
   *      is still the authoritative tiebreaker under concurrent submits.
   */
  async submitReportFeedback(
    { input, permission }: GqlMutationSubmitReportFeedbackArgs,
    ctx: IContext,
  ): Promise<GqlSubmitReportFeedbackPayload> {
    const userId = ctx.currentUser?.id;
    if (!userId) {
      throw new AuthenticationError("User must be logged in to submit feedback");
    }

    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      throw new ValidationError("rating must be an integer between 1 and 5", ["rating"]);
    }
    if (input.comment && input.comment.length > MAX_COMMENT_LENGTH) {
      throw new ValidationError(
        `comment cannot exceed ${MAX_COMMENT_LENGTH} characters`,
        ["comment"],
      );
    }
    if (input.sectionKey && input.sectionKey.length > MAX_SECTION_KEY_LENGTH) {
      throw new ValidationError(
        `sectionKey cannot exceed ${MAX_SECTION_KEY_LENGTH} characters`,
        ["sectionKey"],
      );
    }

    const report = await this.reportService.getReportById(ctx, input.reportId);
    if (!report) {
      throw new NotFoundError("Report", { id: input.reportId });
    }
    if (report.communityId !== permission.communityId) {
      // We return a NotFoundError rather than AuthorizationError here
      // so a non-member can't probe existence of other communities'
      // reports by watching the error code. The authz rule already
      // verified membership of `permission.communityId`.
      throw new NotFoundError("Report", { id: input.reportId });
    }

    const existing = await this.feedbackService.getExistingFeedback(
      ctx,
      input.reportId,
      userId,
    );
    if (existing) {
      throw new ValidationError(
        "Feedback already submitted for this report",
        ["reportId"],
      );
    }

    const feedback = await this.feedbackService.createFeedback(ctx, {
      reportId: input.reportId,
      userId,
      rating: input.rating,
      feedbackType: input.feedbackType
        ? (input.feedbackType as unknown as FeedbackType)
        : null,
      sectionKey: input.sectionKey ?? null,
      comment: input.comment ?? null,
    });

    return {
      __typename: "SubmitReportFeedbackSuccess",
      feedback: ReportFeedbackPresenter.feedback(feedback),
    };
  }

  /**
   * Aggregates over a single (variant, version) pair for the platform
   * admin dashboard. Authorization is enforced upstream by the
   * `@authz IsAdmin` rule on the GraphQL query — the usecase trusts the
   * directive and does not re-check.
   */
  async viewReportTemplateStats(
    { variant, version }: GqlQueryReportTemplateStatsArgs,
    ctx: IContext,
  ): Promise<GqlReportTemplateStats> {
    const row = await this.feedbackService.getTemplateStats(
      ctx,
      variant,
      version ?? undefined,
    );
    return ReportFeedbackPresenter.templateStats(row);
  }

  // Field-resolver helpers used by `Report.feedbacks` / `Report.myFeedback`.

  async listFeedbacksForReport(
    ctx: IContext,
    reportId: string,
    params: { first?: number | null; after?: string | null },
  ) {
    const first = clampInt(
      params.first ?? DEFAULT_FEEDBACKS_PER_PAGE,
      1,
      MAX_FEEDBACKS_PER_PAGE,
      "first",
    );
    const result = await this.feedbackService.listFeedbacksByReport(ctx, reportId, {
      first,
      cursor: params.after ?? null,
    });
    return ReportFeedbackPresenter.connection(result.items, result.totalCount, first);
  }

  async getMyFeedback(ctx: IContext, reportId: string) {
    const userId = ctx.currentUser?.id;
    if (!userId) return null;
    const feedback = await this.feedbackService.getExistingFeedback(ctx, reportId, userId);
    return feedback ? ReportFeedbackPresenter.feedback(feedback) : null;
  }
}

function clampInt(value: number, min: number, max: number, name: string): number {
  if (!Number.isInteger(value)) {
    throw new RangeError(`${name} must be an integer, got ${value}`);
  }
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
