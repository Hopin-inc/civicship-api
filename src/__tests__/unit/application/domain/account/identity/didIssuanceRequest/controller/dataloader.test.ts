import { DidMethod, type PrismaClient } from "@prisma/client";
import { createDidIssuanceRequestsByUserIdLoader } from "@/application/domain/account/identity/didIssuanceRequest/controller/dataloader";

/**
 * `User.didIssuanceRequests` の dataloader は、IDENTUS 時代の did:prism 行を
 * API に露出させず、自前発行の did:web (INTERNAL) のみを返さねばならない。
 * その担保が Prisma クエリの `where` に入っていることを確認する。
 */
describe("createDidIssuanceRequestsByUserIdLoader", () => {
  it("queries only didMethod=INTERNAL — legacy IDENTUS did:prism rows are never exposed", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = { didIssuanceRequest: { findMany } } as unknown as PrismaClient;

    const loader = createDidIssuanceRequestsByUserIdLoader(prisma);
    await loader.load("u_alice");

    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany.mock.calls[0][0].where).toEqual({
      userId: { in: ["u_alice"] },
      didMethod: DidMethod.INTERNAL,
    });
  });
});
