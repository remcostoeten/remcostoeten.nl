import { db } from "@/db/connection";
import { adminUser, adminSessions, adminActivityLog, type TAdminUser, type TNewAdminSession, type TNewAdminActivityLog } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";

const ADMIN_EMAIL = "remcostoeten@hotmail.com";
const ADMIN_PASSWORD = "Mhca6r4g1!";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'salt_remco_2024').digest('hex');
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function calculateExpiresAt(): Date {
  return new Date(Date.now() + SESSION_DURATION);
}

async function ensureAdminExists(): Promise<TAdminUser> {
  const existingAdmin = await db.select().from(adminUser).where(eq(adminUser.email, ADMIN_EMAIL)).limit(1);
  
  if (existingAdmin.length > 0) {
    return existingAdmin[0];
  }

  const newAdmin = await db.insert(adminUser).values({
    email: ADMIN_EMAIL,
    passwordHash: hashPassword(ADMIN_PASSWORD),
    isActive: true,
  }).returning();

  return newAdmin[0];
}

export function createAuthService() {
  async function login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error("Invalid credentials");
    }

    const admin = await ensureAdminExists();
    
    // Update last login
    await db.update(adminUser)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUser.id, admin.id));

    // Create session
    const token = generateToken();
    const expiresAt = calculateExpiresAt();

    const sessionData: TNewAdminSession = {
      userId: admin.id,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    };

    await db.insert(adminSessions).values(sessionData);

    // Log activity
    await logActivity(admin.id, "login", "auth", { ipAddress }, ipAddress);

    return {
      token,
      expiresAt,
      user: {
        id: admin.id,
        email: admin.email,
        lastLoginAt: admin.lastLoginAt,
      },
    };
  }

  async function validateSession(token: string) {
    const session = await db
      .select({
        session: adminSessions,
        user: adminUser,
      })
      .from(adminSessions)
      .innerJoin(adminUser, eq(adminSessions.userId, adminUser.id))
      .where(
        and(
          eq(adminSessions.token, token),
          gt(adminSessions.expiresAt, new Date()),
          eq(adminUser.isActive, true)
        )
      )
      .limit(1);

    if (session.length === 0) {
      return null;
    }

    return {
      user: {
        id: session[0].user.id,
        email: session[0].user.email,
        lastLoginAt: session[0].user.lastLoginAt,
      },
      session: session[0].session,
    };
  }

  async function logout(token: string, ipAddress?: string) {
    const sessionResult = await validateSession(token);
    
    if (sessionResult) {
      await db.delete(adminSessions).where(eq(adminSessions.token, token));
      await logActivity(sessionResult.user.id, "logout", "auth", { ipAddress }, ipAddress);
    }
  }

  async function logActivity(
    userId: string, 
    action: string, 
    module: string, 
    details?: any, 
    ipAddress?: string
  ) {
    const activityData: TNewAdminActivityLog = {
      userId,
      action,
      module,
      details,
      ipAddress,
    };

    await db.insert(adminActivityLog).values(activityData);
  }

  async function cleanExpiredSessions() {
    await db.delete(adminSessions).where(
      and(
        eq(adminSessions.expiresAt, new Date())
      )
    );
  }

  async function getRecentActivity(limit: number = 50) {
    return await db
      .select({
        action: adminActivityLog.action,
        module: adminActivityLog.module,
        details: adminActivityLog.details,
        timestamp: adminActivityLog.timestamp,
        ipAddress: adminActivityLog.ipAddress,
      })
      .from(adminActivityLog)
      .orderBy(adminActivityLog.timestamp)
      .limit(limit);
  }

  return {
    login,
    validateSession,
    logout,
    logActivity,
    cleanExpiredSessions,
    getRecentActivity,
  };
}
