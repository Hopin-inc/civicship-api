import ArticleConverter from "@/application/domain/content/article/data/converter";
import { Prisma, PublishStatus } from "@prisma/client";
import { ValidationError, NotFoundError } from "@/errors/graphql";
import { IArticleRepository } from "@/application/domain/content/article/data/interface";
import { IContext } from "@/types/server";
import { 
  GqlArticleFilterInput, 
  GqlQueryArticlesArgs,
  GqlArticleCreateInput,
  GqlArticleUpdateContentInput
} from "@/types/graphql";
import { injectable, inject } from "tsyringe";
import ImageService from "@/application/domain/content/image/service";

@injectable()
export default class ArticleService {
  constructor(
    @inject("ArticleRepository") private readonly repository: IArticleRepository,
    @inject("ArticleConverter") private readonly converter: ArticleConverter,
    @inject("ImageService") private readonly imageService: ImageService,
  ) {}

  async fetchArticles<T extends Prisma.ArticleInclude>(
    ctx: IContext,
    { filter, sort, cursor }: GqlQueryArticlesArgs,
    take: number,
    include?: T,
  ): Promise<Prisma.ArticleGetPayload<{ include: T }>[]> {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});

    return this.repository.query(ctx, where, orderBy, take, cursor, include);
  }

  async findArticle(ctx: IContext, id: string) {
    return await this.repository.find(ctx, id);
  }

  async validatePublishStatus(allowedStatuses: PublishStatus[], filter?: GqlArticleFilterInput) {
    if (
      filter?.publishStatus &&
      !filter.publishStatus.every((status) => allowedStatuses.includes(status))
    ) {
      throw new ValidationError(
        `Validation error: publishStatus must be one of ${allowedStatuses.join(", ")}`,
        [JSON.stringify(filter?.publishStatus)],
      );
    }
  }

  async createArticle(
    ctx: IContext,
    input: GqlArticleCreateInput,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const { data, thumbnail } = this.converter.create(input, communityId);

    let thumbnailData: Prisma.ImageCreateWithoutArticlesInput | undefined;
    if (thumbnail) {
      const result = await this.imageService.uploadPublicImage(thumbnail, "articles");
      if (result) {
        thumbnailData = result;
      }
    }

    const createInput: Prisma.ArticleCreateInput = {
      ...data,
      ...(thumbnailData && {
        thumbnail: {
          create: thumbnailData,
        },
      }),
    };

    return await this.repository.create(ctx, createInput, tx);
  }

  async updateArticleContent(
    ctx: IContext,
    id: string,
    input: GqlArticleUpdateContentInput,
    tx: Prisma.TransactionClient,
  ) {
    await this.findArticleOrThrow(ctx, id);

    const { data, thumbnail } = this.converter.update(input);

    let thumbnailData: Prisma.ImageCreateWithoutArticlesInput | undefined;
    if (thumbnail) {
      const result = await this.imageService.uploadPublicImage(thumbnail, "articles");
      if (result) {
        thumbnailData = result;
      }
    }

    const updateInput: Prisma.ArticleUpdateInput = {
      ...data,
      ...(thumbnailData && {
        thumbnail: {
          create: thumbnailData,
        },
      }),
    };

    return await this.repository.update(ctx, id, updateInput, tx);
  }

  async deleteArticle(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    await this.findArticleOrThrow(ctx, id);
    return await this.repository.delete(ctx, id, tx);
  }

  async findArticleOrThrow(ctx: IContext, articleId: string) {
    const article = await this.repository.find(ctx, articleId);
    if (!article) {
      throw new NotFoundError("Article", { articleId });
    }
    return article;
  }
}
