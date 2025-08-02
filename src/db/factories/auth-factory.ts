import { adminUser, adminSessions } from '../schema';
import { eq } from 'drizzle-orm';
import { PBKDF2, RandomBytes } from 'crypto';

// Define interfaces for injected dependencies
interface IDB {
  query: {
    adminUser: {
      findFirst: (options: any) => Promise<any>;
    };
    adminSessions: {
      findFirst: (options: any) => Promise<any>;
    };
  };
  insert: (table: any) => {
    values: (data: any) => {
      returning: () => Promise<any>;
    };
  };
  delete: (table: any) => {
    where: (condition: any) => Promise<any>;
  };
}

interface ICrypto {
  pbkdf2Sync: (password: string | Buffer, salt: string | Buffer, iterations: number, keylen: number, digest: string) => Buffer;
  randomBytes: (size: number) => Buffer;
}

// Helper function to hash password
function hashPassword(password: string, crypto: ICrypto, salt?: string): string {
  const currentSalt = salt || crypto.randomBytes(16).toString('hex');
  const hashedPassword = crypto.pbkdf2Sync(password, currentSalt, 1000, 64, 'sha512').toString('hex');
  return `${currentSalt}:${hashedPassword}`;
}

// Helper function to verify password
function verifyPassword(password: string, storedHash: string, crypto: ICrypto): boolean {
  const [salt, hashedPassword] = storedHash.split(':');
  const newHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return newHash === hashedPassword;
}

type TAuthFactory = {
  verifyUser: (email: string, password: string) => Promise<{ success: boolean; userId?: string; error?: string }>, 
  createSession: (userId: string) => Promise<{ success: boolean; token?: string; error?: string }>, 
  invalidateSession: (token: string) => Promise<{ success: boolean; error?: string }>, 
  validateSession: (token: string) => Promise<{ success: boolean; userId?: string; error?: string }>,
  getUserById: (userId: string) => Promise<any>;
};

export function createAuthFactory(injectedDb: IDB, injectedCrypto: ICrypto): TAuthFactory {
  async function verifyUser(email: string, password: string): Promise<{ success: boolean; userId?: string; error?: string }> {
    const user = await injectedDb.query.adminUser.findFirst({
      where: eq(adminUser.email, email),
    });

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    if (!verifyPassword(password, user.passwordHash, injectedCrypto)) {
      return { success: false, error: 'Invalid credentials' };
    }

    return { success: true, userId: user.id };
  }

  async function createSession(userId: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const token = injectedCrypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    try {
      await injectedDb.insert(adminSessions).values({
        userId,
        token,
        expiresAt,
      }).returning();
      return { success: true, token };
    } catch (error) {
      console.error('Error creating session:', error);
      return { success: false, error: 'Failed to create session' };
    }
  }

  async function invalidateSession(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      await injectedDb.delete(adminSessions).where(eq(adminSessions.token, token)).execute();
      return { success: true };
    } catch (error) {
      console.error('Error invalidating session:', error);
      return { success: false, error: 'Failed to invalidate session' };
    }
  }

  async function validateSession(token: string): Promise<{ success: boolean; userId?: string; error?: string }> {
    const session = await injectedDb.query.adminSessions.findFirst({
      where: eq(adminSessions.token, token),
    });

    if (!session || session.expiresAt < new Date()) {
      return { success: false, error: 'Invalid or expired session' };
    }

    return { success: true, userId: session.userId };
  }

  async function getUserById(userId: string): Promise<any> {
    return injectedDb.query.adminUser.findFirst({
      where: eq(adminUser.id, userId),
    });
  }

  return {
    verifyUser,
    createSession,
    invalidateSession,
    validateSession,
    getUserById,
  };
}

import { db } from '../connection';
import * as crypto from 'crypto';

export const authFactory = createAuthFactory(db, crypto);