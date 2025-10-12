import { Response, NextFunction } from 'express';
import { tierBasedRateLimiter } from '../src/middleware/advancedRateLimiter';
import { AuthRequest } from '../src/middleware/auth';

// Mock the dependencies
jest.mock('../src/utils/prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

jest.mock('ioredis', () => {
  const Redis = jest.requireActual('ioredis');
  return jest.fn().mockImplementation(() => new Redis());
});

describe('Tier-Based Rate Limiter', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      ip: '127.0.0.1',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should allow requests for tier 1 users under the limit', async () => {
    mockRequest.user = { id: 'user1', tier: 1, phoneNumber: '123', firstName: 'a', lastName: 'b', role: 'user' };
    const limiter = tierBasedRateLimiter(5, 10, 20, 3600);

    for (let i = 0; i < 5; i++) {
      await limiter(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
    }
    expect(nextFunction).toHaveBeenCalledTimes(5);
  });

  it('should block requests for tier 1 users over the limit', async () => {
    mockRequest.user = { id: 'user1', tier: 1, phoneNumber: '123', firstName: 'a', lastName: 'b', role: 'user' };
    const limiter = tierBasedRateLimiter(5, 10, 20, 3600);

    for (let i = 0; i < 6; i++) {
        await limiter(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
    }

    expect(nextFunction).toHaveBeenCalledTimes(5);
    expect(mockResponse.status).toHaveBeenCalledWith(429);
  });


  it('should allow requests for tier 3 users under the limit', async () => {
    mockRequest.user = { id: 'user3', tier: 3, phoneNumber: '123', firstName: 'a', lastName: 'b', role: 'user' };
    const limiter = tierBasedRateLimiter(5, 10, 20, 3600);

    for (let i = 0; i < 20; i++) {
        await limiter(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
    }

    expect(nextFunction).toHaveBeenCalledTimes(20);
  });

    it('should block requests for tier 3 users over the limit', async () => {
    mockRequest.user = { id: 'user3', tier: 3, phoneNumber: '123', firstName: 'a', lastName: 'b', role: 'user' };
    const limiter = tierBasedRateLimiter(5, 10, 20, 3600);

    for (let i = 0; i < 21; i++) {
        await limiter(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
    }

    expect(nextFunction).toHaveBeenCalledTimes(20);
    expect(mockResponse.status).toHaveBeenCalledWith(429);
  });
});
