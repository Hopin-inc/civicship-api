
import { PrismaClientIssuer } from './src/infrastructure/prisma/client';
import { IContext } from './src/types/server';

async function verifyRlsBypass() {
  const issuer = new PrismaClientIssuer();
  
  console.log('=== RLS Bypass Verification ===');
  
  try {
    const internalResult = await issuer.internal(async (tx) => {
      const [bypassSetting] = await tx.$queryRawUnsafe<[{value: string}]>(
        `SELECT current_setting('app.rls_bypass') as value`
      );
      const [userIdSetting] = await tx.$queryRawUnsafe<[{value: string}]>(
        `SELECT current_setting('app.rls_config.user_id') as value`
      );
      
      const [transactionCount] = await tx.$queryRawUnsafe<[{count: bigint}]>(
        `SELECT COUNT(*) as count FROM "t_transactions"`
      );
      
      return {
        method: 'internal',
        bypassSetting: bypassSetting.value,
        userIdSetting: userIdSetting.value,
        transactionCount: Number(transactionCount.count)
      };
    });
    
    console.log('Internal method result:', internalResult);
  } catch (error) {
    console.error('Internal method error:', error);
  }
  
  try {
    const mockContext: IContext = {} as IContext; // Minimal mock for testing
    
    const publicResult = await issuer.public(mockContext, async (tx) => {
      const [bypassSetting] = await tx.$queryRawUnsafe<[{value: string}]>(
        `SELECT current_setting('app.rls_bypass') as value`
      );
      const [userIdSetting] = await tx.$queryRawUnsafe<[{value: string}]>(
        `SELECT current_setting('app.rls_config.user_id') as value`
      );
      
      const [transactionCount] = await tx.$queryRawUnsafe<[{count: bigint}]>(
        `SELECT COUNT(*) as count FROM "t_transactions"`
      );
      
      return {
        method: 'public',
        bypassSetting: bypassSetting.value,
        userIdSetting: userIdSetting.value,
        transactionCount: Number(transactionCount.count)
      };
    });
    
    console.log('Public method result:', publicResult);
  } catch (error) {
    console.error('Public method error:', error);
  }
  
  try {
    const refreshResult = await issuer.internal(async (tx) => {
      const [beforeCount] = await tx.$queryRawUnsafe<[{count: bigint}]>(
        `SELECT COUNT(*) as count FROM "mv_current_points"`
      );
      
      await tx.$queryRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY "mv_current_points"`);
      
      const [afterCount] = await tx.$queryRawUnsafe<[{count: bigint}]>(
        `SELECT COUNT(*) as count FROM "mv_current_points"`
      );
      
      return {
        beforeRefresh: Number(beforeCount.count),
        afterRefresh: Number(afterCount.count)
      };
    });
    
    console.log('Materialized view refresh result:', refreshResult);
  } catch (error) {
    console.error('Materialized view refresh error:', error);
  }
}

verifyRlsBypass().catch(console.error);
