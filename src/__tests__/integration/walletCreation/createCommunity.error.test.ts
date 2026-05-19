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
import { ValidationError } from "@/errors/graphql";
import { CurrentPrefecture } from "@prisma/client";

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
        input: { originalId: "test-community", name: "Test Community", pointName: "test-points" }
      }, ctx)
    ).rejects.toThrow(/foreign key constraint|user_id_fkey/i);
  });

  it("should fail when user is not authenticated", async () => {
    const ctx = { issuer } as IContext; // No currentUser

    await expect(
      useCase.userCreateCommunityAndJoin({
        input: { originalId: "test-community", name: "Test Community", pointName: "test-points" }
      }, ctx)
    ).rejects.toThrow(/authentication|logged.*in/i);
  });

  it.each([
    ["empty", ""],
    ["too short", "abc"],
    ["leading digit", "1bad"],
    ["invalid char", "foo_bar"],
    ["too long", "a".repeat(21)],
  ])("should fail with ValidationError when originalId is %s", async (_label, originalId) => {
    const user = await TestDataSourceHelper.createUser({
      name: "Validation Tester",
      slug: `validation-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const promise = useCase.userCreateCommunityAndJoin({
      input: { originalId, name: "Test Community", pointName: "test-points" }
    }, ctx);

    await expect(promise).rejects.toThrow(ValidationError);
    await expect(promise).rejects.toThrow(/originalId/i);
  });
});
