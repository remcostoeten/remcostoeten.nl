import { describe, it, expect, vi, beforeEach } from 'vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAuthFactory } from './auth-factory'; // Import the factory creator
import { adminUser, adminSessions } from '../schema';
import { eq } from 'drizzle-orm';

describe('authFactory', () => {
  let mockDb: any;
  let mockCrypto: any;
  let authFactory: ReturnType<typeof createAuthFactory>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    mockDb = {
      query: {
        adminUser: {
          findFirst: vi.fn(),
        },
        adminSessions: {
          findFirst: vi.fn(),
        },
      },
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          returning: vi.fn(),
        })),
      })),
      delete: vi.fn(() => ({
        where: vi.fn(() => ({
          execute: vi.fn(),
        })),
      })),
    };

    mockCrypto = {
      pbkdf2Sync: vi.fn((password, salt) => `hashed_${password}_${salt}`),
      randomBytes: vi.fn(() => Buffer.from('test_salt')),
    };

    authFactory = createAuthFactory(mockDb, mockCrypto);
  });

  describe('verifyUser', () => {
    it('should return success true and userId for valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'test_salt:hashed_password123_test_salt', // Hashed 'password123'
      };
      mockDb.query.adminUser.findFirst.mockResolvedValue(mockUser);

      const result = await authFactory.verifyUser('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.userId).toBe(mockUser.id);
      expect(mockDb.query.adminUser.findFirst).toHaveBeenCalledWith({
        where: eq(adminUser.email, 'test@example.com'),
      });
    });

    it('should return success false and error for invalid password', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'test_salt:hashed_password123_test_salt', // Hash of the correct password
      };
      mockDb.query.adminUser.findFirst.mockResolvedValue(mockUser);

      const result = await authFactory.verifyUser('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should return success false and error for non-existent user', async () => {
      mockDb.query.adminUser.findFirst.mockResolvedValue(undefined);

      const result = await authFactory.verifyUser('nonexistent@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('createSession', () => {
    it('should create a session and return a token', async () => {
      const userId = 'user-123';
      mockDb.insert().values().returning().mockResolvedValue([{ token: 'mock_token' }]);

      const result = await authFactory.createSession(userId);

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalledWith(adminSessions);
      expect(mockDb.insert().values).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: userId,
          token: expect.any(String),
          expiresAt: expect.any(Date),
        })
      );
    });

    it('should return success false and error if session creation fails', async () => {
      const userId = 'user-123';
      mockDb.insert().values().returning.mockRejectedValue(new Error('DB error'));

      const result = await authFactory.createSession(userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create session');
    });
  });

  describe('invalidateSession', () => {
    it('should invalidate a session', async () => {
      const token = 'mock_token';
      mockDb.delete().where().execute.mockResolvedValue(undefined);

      const result = await authFactory.invalidateSession(token);

      expect(result.success).toBe(true);
      expect(mockDb.delete).toHaveBeenCalledWith(adminSessions);
      expect(mockDb.delete().where).toHaveBeenCalledWith(eq(adminSessions.token, token));
    });

    it('should return success false and error if session invalidation fails', async () => {
      const token = 'mock_token';
      mockDb.delete().where().execute.mockRejectedValue(new Error('DB error'));

      const result = await authFactory.invalidateSession(token);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to invalidate session');
    });
  });

  describe('validateSession', () => {
    it('should return success true and userId for a valid session', async () => {
      const mockSession = {
        token: 'valid_token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
      };
      mockDb.query.adminSessions.findFirst.mockResolvedValue(mockSession);

      const result = await authFactory.validateSession('valid_token');

      expect(result.success).toBe(true);
      expect(result.userId).toBe(mockSession.userId);
      expect(mockDb.query.adminSessions.findFirst).toHaveBeenCalledWith({
        where: eq(adminSessions.token, 'valid_token'),
      });
    });

    it('should return success false and error for an expired session', async () => {
      const mockSession = {
        token: 'expired_token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() - 1000 * 60), // 1 minute ago
      };
      mockDb.query.adminSessions.findFirst.mockResolvedValue(mockSession);

      const result = await authFactory.validateSession('expired_token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid or expired session');
    });

    it('should return success false and error for a non-existent session', async () => {
      mockDb.query.adminSessions.findFirst.mockResolvedValue(undefined);

      const result = await authFactory.validateSession('nonexistent_token');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid or expired session');
    });
  });
});
