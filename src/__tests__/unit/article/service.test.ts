import ArticleService from "@/app/article/service";
import ArticleRepository from "@/infra/repositories/article";
import { IContext } from "@/types/server";

jest.mock("@/infra/repositories/article");

describe("ArticleService", () => {
    let ctx: IContext;

    beforeEach(() => {
        ctx = { user: { id: "test-user" } } as unknown as IContext;
        jest.clearAllMocks();
    });

    describe("fetchArticles", () => {
        it("should return a list of articles", async () => {
            const mockArticles = [{ id: "1", title: "Test Article" }];
            (ArticleRepository.query as jest.Mock).mockResolvedValue(mockArticles);

            const result = await ArticleService.fetchArticles(ctx, {}, 10);

            expect(ArticleRepository.query).toHaveBeenCalledWith(
                ctx,
                expect.any(Object),
                expect.any(Object),
                10,
                undefined
            );
            expect(result).toEqual(mockArticles);
        });
    });

    describe("findArticle", () => {
        it("should return an article by id", async () => {
            const mockArticle = { id: "1", title: "Test Article" };
            (ArticleRepository.find as jest.Mock).mockResolvedValue(mockArticle);

            const result = await ArticleService.findArticle(ctx, "1");
            expect(ArticleRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(result).toEqual(mockArticle);
        });
    });
});
