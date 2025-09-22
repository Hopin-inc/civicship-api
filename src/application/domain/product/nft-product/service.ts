import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import { INftProductRepository } from './data/interface';

@injectable()
export default class NftProductService {
  constructor(
    @inject("NftProductRepository") private readonly nftProductRepository: INftProductRepository,
  ) {}

  async findByProductId(ctx: IContext, productId: string) {
    return this.nftProductRepository.findByProductId(ctx, productId);
  }

  async findByExternalRef(ctx: IContext, externalRef: string) {
    return this.nftProductRepository.findByExternalRef(ctx, externalRef);
  }
}
