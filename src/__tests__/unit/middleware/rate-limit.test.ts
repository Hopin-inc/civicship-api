import { Request } from 'express';
import { skipRateLimitForAdminApiKey } from '../../../presentation/middleware/rate-limit';

describe('Rate Limit Skip Logic', () => {
  let mockReq: Partial<Request>;

  beforeEach(() => {
    mockReq = {
      headers: {},
      ip: '127.0.0.1',
    };
    
    delete process.env.CIVICSHIP_ADMIN_API_KEY;
  });

  describe('skip function behavior', () => {
    it('should apply rate limiting for requests without API key', () => {
      mockReq.headers = {};
      
      const skipResult = skipRateLimitForAdminApiKey(mockReq as Request);
      
      expect(skipResult).toBe(false);
    });

    it('should apply rate limiting for requests with invalid API key', () => {
      process.env.CIVICSHIP_ADMIN_API_KEY = 'valid-admin-key';
      mockReq.headers = {
        'x-api-key': 'invalid-key',
      };
      
      const skipResult = skipRateLimitForAdminApiKey(mockReq as Request);
      
      expect(skipResult).toBe(false);
    });

    it('should skip rate limiting for requests with valid admin API key', () => {
      process.env.CIVICSHIP_ADMIN_API_KEY = 'valid-admin-key';
      mockReq.headers = {
        'x-api-key': 'valid-admin-key',
      };
      
      const skipResult = skipRateLimitForAdminApiKey(mockReq as Request);
      
      expect(skipResult).toBe(true);
    });

    it('should apply rate limiting when admin API key is not configured', () => {
      mockReq.headers = {
        'x-api-key': 'some-key',
      };
      
      const skipResult = skipRateLimitForAdminApiKey(mockReq as Request);
      
      expect(skipResult).toBe(false);
    });
  });
});
