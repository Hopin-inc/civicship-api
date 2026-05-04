import { ApiKey, User } from '@prisma/client';
import { IContext } from './server';

declare global {
  namespace Express {
    interface Request {
      context?: IContext;
    }
    interface Locals {
      user?: User;
      uid?: string;
      apiKey?: ApiKey;
    }
  }
}
