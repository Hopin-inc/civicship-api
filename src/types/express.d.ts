import { Request } from 'express';
import { IContext } from './server';

declare global {
  namespace Express {
    interface Request {
      context?: IContext;
    }
  }
}
