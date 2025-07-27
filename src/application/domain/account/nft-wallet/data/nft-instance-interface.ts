import { IContext } from "@/types/server";


export default interface INftInstanceRepository {
  findNftInstances(
    ctx: IContext,
    where: any,
    orderBy: any[],
    take: number,
    cursor?: string
  ): Promise<any[]>;

  findNftInstanceById(ctx: IContext, id: string): Promise<any | null>;
}
