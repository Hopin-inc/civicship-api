import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, PublishStatus } from "@prisma/client";
import ArticleUseCase from "@/application/domain/content/article/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Article UseCase Error Handling Tests", () => {
  let useCase: ArticleUseCase;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    useCase = container.resolve(ArticleUseCase);
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should fail to create article with non-existent community", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    await expect(
      useCase.managerCreateArticle({
        input: {
          title: "Test Article",
          introduction: "Test introduction",
          authorIds: [user.id],
          category: "ACTIVITY_REPORT" as any,
          publishStatus: PublishStatus.PUBLIC,
        },
        permission: { communityId: "non-existent-community-id" }
      }, ctx)
    ).rejects.toThrow(/not found|community.*not.*found/i);
  });

  it("should fail to create article with empty title", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    await expect(
      useCase.managerCreateArticle({
        input: {
          title: "",
          introduction: "Test introduction",
          authorIds: [user.id],
          category: "ACTIVITY_REPORT" as any,
          publishStatus: PublishStatus.PUBLIC,
        },
        permission: { communityId: community.id }
      }, ctx)
    ).rejects.toThrow(/title.*required|empty.*title/i);
  });

  it("should fail to update non-existent article", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    await expect(
      useCase.managerUpdateArticleContent(
        {
          id: "non-existent-article-id",
          input: {
            title: "Updated Title",
            introduction: "Updated introduction",
            authorIds: [user.id],
            category: "ACTIVITY_REPORT" as any,
            publishStatus: PublishStatus.PUBLIC,
          },
          permission: { communityId: "some-community-id" }
        },
        ctx
      )
    ).rejects.toThrow(/not found|article.*not.*found/i);
  });
});
