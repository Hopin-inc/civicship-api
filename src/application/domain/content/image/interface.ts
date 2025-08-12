import { GqlImageInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";

export interface IImageService {
  uploadPublicImage(image: GqlImageInput, folder: string): Promise<Prisma.ImageCreateWithoutParticipationsInput | null>;
}   