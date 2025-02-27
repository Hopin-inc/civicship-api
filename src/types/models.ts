// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type ImageInfo = {
      src: string;
      caption?: string;
      alt?: string;
    };
    type ArrayOfIds = string[];
    type ArrayOfImageInfo = ImageInfo[];
  }
}
