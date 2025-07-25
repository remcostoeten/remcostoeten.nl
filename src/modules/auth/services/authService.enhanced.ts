import { db } from "@/db/connection";
import { adminUser, adminSessions, adminActivityLog, type TAdminUser, type TNewAdminSession, type TNewAdminActivityLog } from "@/db/schema";
import { eq, and, gt, count, desc } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";
import { authConfig } from "@/config/auth";

function hashPassword(password: string): string {
  return createHash('sha256').update(password + authConfig.passwordSalt).digest('hex');
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function calculateExpiresAt(): Date {
  return new Date(Date.now() + authConfig.sessionDuration);
}

async function ensureAdminExists(): Promise<TAdminUser> {
  const existingAdmin = await db
    .select()
    .from(adminUser)
    .where(eq(adminUser.email, authConfig.adminEmail))
    .limit(1);
  
  if (existingAdmin.length > 0) {
    return existingAdmin[0];
  }

  const newAdmin = await db.insert(adminUser).values({
    email: authConfig.adminEmail,
    passwordHash: hashPassword(authConfig.adminPassword),
    isActive: true,
  }).returning();

  return newAdmin[0];
}

async function checkRateLimit(ipAddress?: string): Promise<boolean> {
  if (!ipAddress) return true;

  const fifteenMinutesAgo = new Date(Date.now() - authConfig.lockoutDuration);
  
  const recentAttempts = await db
    .select({ count: count() })
    .from(adminActivityLog)
    .where(and(
      eq(adminActivityLog.action, "login_failed"),
      eq(adminActivityLog.ipAddress, ipAddress),
      gt(adminActivityLog.timestamp, fifteenMinutesAgo)
    ));

  const attemptCount = recentAttempts[0]?.count || 0;
  return attemptCount < authConfig.maxLoginAttempts;
}

export function createEnhancedAuthService() {
  async function login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    // Rate limiting check
    if (!(await checkRateLimit(ipAddress))) {
      await logActivity(null, "login_rate_limited", "auth", { ipAddress }, ipAddress);
      throw new Error("Too many login attempts. Please try again later.");
    }

    // Credential validation
    if (email !== authConfig.adminEmail || password !== authConfig.adminPassword) {
      await logActivity(null, "login_failed", "auth", { email, ipAddress }, ipAddress);
      throw new Error("Invalid credentials");
    }

    const admin = await ensureAdminExists();
    
    // Update last login
    await db.update(adminUser)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUser.id, admin.id));

    // Clean up old sessions for this user (max 3 concurrent sessions)
    const existingSessions = await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.userId, admin.id))
      .orderBy(desc(adminSessions.createdAt));

    if (existingSessions.length >= 3) {
      const sessionsToDelete = existingSessions.slice(2);
      for (const session of sessionsToDelete) {
        await db.delete(adminSessions).where(eq(adminSessions.id, session.id));
      }
    }

    // Create new session
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

    // Log successful login
    await logActivity(admin.id, "login_success", "auth", { ipAddress }, ipAddress);

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
    if (!token || token.length !== 64) {
      return null;
    }

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
    userId: string | null, 
    action: string, 
    module: string, 
    details?: any, 
    ipAddress?: string
  ) {
    try {
      const activityData: TNewAdminActivityLog = {
        userId: userId || "00000000-0000-0000-0000-000000000000", // Use placeholder for failed attempts
        action,
        module,
        details,
        ipAddress,
      };

      await db.insert(adminActivityLog).values(activityData);
    } catch (error) {
      console.error("Failed to log activity:", error);
      // Don't throw here to avoid breaking the main flow
    }
  }

  async function cleanExpiredSessions() {
    const now = new Date();
    await db.delete(adminSessions).where(
      and(
        gt(now, adminSessions.expiresAt)
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
      .orderBy(desc(adminActivityLog.timestamp))
      .limit(limit);
  }

  async function getSecurityStats() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [todayLogins, weekLogins, failedAttempts, activeSessions] = await Promise.all([
      db.select({ count: count() })
        .from(adminActivityLog)
        .where(and(
          eq(adminActivityLog.action, "login_success"),
          gt(adminActivityLog.timestamp, oneDayAgo)
        )),
      
      db.select({ count: count() })
        .from(adminActivityLog)
        .where(and(
          eq(adminActivityLog.action, "login_success"),
          gt(adminActivityLog.timestamp, oneWeekAgo)
        )),
      
      db.select({ count: count() })
        .from(adminActivityLog)
        .where(and(
          eq(adminActivityLog.action, "login_failed"),
          gt(adminActivityLog.timestamp, oneWeekAgo)
        )),
      
      db.select({ count: count() })
        .from(adminSessions)
        .where(gt(adminSessions.expiresAt, new Date()))
    ]);

    return {
      todayLogins: todayLogins[0]?.count || 0,
      weekLogins: weekLogins[0]?.count || 0,
      failedAttempts: failedAttempts[0]?.count || 0,
      activeSessions: activeSessions[0]?.count || 0,
    };
  }

  return {
    login,
    validateSession,
    logout,
    logActivity,
    cleanExpiredSessions,
    getRecentActivity,
    getSecurityStats,
  };
}
