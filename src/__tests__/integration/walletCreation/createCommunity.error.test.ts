import "reflect-metadata";

jest.mock("@/infrastructure/libs/firebase", () => ({
  auth: {
    tenantManager: jest.fn(() => ({
      createTenant: jest.fn().mockResolvedValue({ tenantId: "mock-tenant-id" }),
      deleteTenant: jest.fn().mockResolvedValue(undefined),
    })),
  },
  __esModule: true,
}));

import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import CommunityUseCase from "@/application/domain/account/community/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Community Creation Error Handling Tests", () => {
  let useCase: CommunityUseCase;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    useCase = container.resolve(CommunityUseCase);
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should fail when user does not exist", async () => {
    const ctx = { currentUser: { id: "non-existent-user-id" }, issuer } as IContext;

    await expect(
      useCase.userCreateCommunityAndJoin({
        input: { name: "Test Community", pointName: "test-points" }
      }, ctx)
    ).rejects.toThrow(/foreign key constraint|user_id_fkey/i);
  });

  it("should fail when user is not authenticated", async () => {
    const ctx = { issuer } as IContext; // No currentUser

    await expect(
      useCase.userCreateCommunityAndJoin({
        input: { name: "Test Community", pointName: "test-points" }
      }, ctx)
    ).rejects.toThrow(/authentication|logged.*in/i);
  });
});
