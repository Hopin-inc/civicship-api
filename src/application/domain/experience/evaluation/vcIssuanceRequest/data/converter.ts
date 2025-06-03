import { VCIssuanceRequestInput } from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/type";
import { PrismaEvaluation } from "@/application/domain/experience/evaluation/data/type";

export const toVCIssuanceRequestInput = (evaluation: PrismaEvaluation): VCIssuanceRequestInput => {
  const { status, evaluator, participation } = evaluation;
  const user = participation.user;
  const reservation = participation.reservation;
  const opportunitySlot = reservation?.opportunitySlot;
  const opportunity = opportunitySlot?.opportunity;
  const startAt = opportunitySlot?.startsAt;

  return {
    claims: {
      type: "EvaluationCredential",
      score: status,
      evaluator: {
        id: evaluator?.id ?? "",
        name: evaluator?.name ?? evaluator?.id ?? "",
      },
      participant: {
        id: user?.id ?? "",
        name: user?.name ?? "",
      },
      reservation: {
        id: reservation?.id ?? "",
        opportunity: {
          id: opportunity?.id ?? "",
          title: opportunity?.title ?? "",
          startsAt: startAt?.toISOString() ?? "",
        },
      },
    },
    credentialFormat: "JWT",
  };
};
