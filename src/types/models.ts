// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    type ArrayOfIds = string[];
  }
}
