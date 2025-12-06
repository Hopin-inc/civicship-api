import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";

export const createVcIssuanceRequestByEvaluationLoader = (prisma: PrismaClient) => {
    return new DataLoader(async (evaluationIds: readonly string[]) => {
        const vcIssuanceRequests = await prisma.vcIssuanceRequest.findMany({
            where: {
                evaluationId: { in: evaluationIds as string[] }
            }
        });

        return evaluationIds.map(id =>
            vcIssuanceRequests.find(request => request.evaluationId === id) || null
        );
    });
};

export const createVcIssuanceRequestsByOpportunitySlotLoader = (prisma: PrismaClient) => {
    return new DataLoader(async (opportunitySlotIds: readonly string[]) => {
        const vcRequests = await prisma.vcIssuanceRequest.findMany({
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
        });

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