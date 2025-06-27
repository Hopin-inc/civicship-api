import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export const createVcIssuanceRequestByEvaluationLoader = (issuer: PrismaClientIssuer) => {
    return new DataLoader(async (evaluationIds: readonly string[]) => {
        const vcIssuanceRequests = await issuer.internal((tx) =>
            tx.vcIssuanceRequest.findMany({
                where: {
                    evaluationId: { in: evaluationIds as string[] }
                }
            })
        );

        return evaluationIds.map(id =>
            vcIssuanceRequests.find(request => request.evaluationId === id) || null
        );
    });
};

export const createVcIssuanceRequestsByOpportunitySlotLoader = (issuer: PrismaClientIssuer) => {
    return new DataLoader(async (opportunitySlotIds: readonly string[]) => {
        const vcRequests = await issuer.internal((tx) =>
            tx.vcIssuanceRequest.findMany({
                where: {
                    evaluation: {
                        participation: {
                            opportunitySlotId: { in: opportunitySlotIds as string[] }
                        }
                    }
                },
                include: {
                    evaluation: {
                        include: {
                            participation: true
                        }
                    }
                }
            })
        );

        // opportunitySlotIdごとにグループ化
        const grouped = vcRequests.reduce((acc, request) => {
            const slotId = request.evaluation.participation.opportunitySlotId;
            if (slotId) {
                (acc[slotId] = acc[slotId] || []).push(request);
            }
            return acc;
        }, {} as Record<string, typeof vcRequests>);

        return opportunitySlotIds.map(id => grouped[id] || []);
    });
}; 