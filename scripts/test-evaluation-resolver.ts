import { PrismaClient } from "@prisma/client";

async function testEvaluationResolver() {
  const prisma = new PrismaClient();
  
  try {
    const participation = await prisma.participation.findFirst({
      where: {
        evaluation: {
          isNot: null
        }
      }
    });

    if (!participation) {
      console.log("評価データのある参加レコードが見つかりませんでした");
      return;
    }

    console.log(`ParticipationID: ${participation.id}`);
    console.log(`EvaluationID: ${participation.evaluationId || 'null'}`);
    
    const evaluation = await prisma.evaluation.findUnique({
      where: { participationId: participation.id }
    });
    
    console.log("Evaluation data:", evaluation ? JSON.stringify(evaluation, null, 2) : 'null');
    
    if (!participation.evaluationId && evaluation) {
      console.log('SUCCESS: evaluationId is null but evaluation was found using participationId');
    }
  } catch (error) {
    console.error("エラーが発生しました:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testEvaluationResolver()
  .catch(console.error);
