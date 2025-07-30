import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { randomBytes } from 'crypto';

let testDb;
let testAuthFactory;
let testAnalyticsFactory;

function createTestDatabase() {
  return new Database(':memory:');
}

function createTestAuthFactory(db) {
  function createUser(data) {
    try {
      const id = randomBytes(16).toString('hex');
      const stmt = db.prepare('INSERT INTO admin_user (id, email, password_hash) VALUES (?, ?, ?)');
      stmt.run(id, data.email, 'temp-hash');
      return { id, email: data.email, passwordHash: 'temp-hash' };
    } catch (error) {
      console.error('Failed to create test user:', error);
      return null;
    }
  }

  function createSession(userId, expiresInDays = 30) {
    try {
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      
      const sessionId = randomBytes(16).toString('hex');
      const stmt = db.prepare('INSERT INTO admin_sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)');
      stmt.run(sessionId, userId, token, expiresAt.toISOString());
      return { id: sessionId, userId, token, expiresAt };
    } catch (error) {
      console.error('Failed to create test session:', error);
      return null;
    }
  }

  return {
    createUser,
    createSession
  };
}

function createTestAnalyticsFactory(db) {
  function recordPageView(data) {
    try {
      const id = randomBytes(16).toString('hex');
      const timestamp = new Date().toISOString();
      
      const stmt = db.prepare('INSERT INTO analytics_events (id, event_type, page, user_id, timestamp) VALUES (?, ?, ?, ?, ?)');
      stmt.run(id, 'pageview', data.page, data.userId, timestamp);
      
      return {
        id,
        eventType: 'pageview',
        page: data.page,
        userId: data.userId,
        timestamp: new Date(timestamp)
      };
    } catch (error) {
      console.error('Failed to record page view:', error);
      return null;
    }
  }

  return {
    recordPageView
  };
}

beforeAll(async function setupTestDatabase() {
  testDb = createTestDatabase();
  
  testDb.exec(`
    CREATE TABLE admin_user (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE admin_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES admin_user(id),
      token TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE analytics_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      page TEXT,
      user_id TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  testAuthFactory = createTestAuthFactory(testDb);
  testAnalyticsFactory = createTestAnalyticsFactory(testDb);
});

afterAll(function cleanupTestDatabase() {
  if (testDb) {
    testDb.close();
  }
});

describe('Analytics and Auth Smoke Tests', function testAnalyticsAndAuth() {
  it('should create user and session in admin_sessions table', function testUserAndSessionCreation() {
    const testUser = testAuthFactory.createUser({ 
      email: 'test@example.com', 
      role: 'admin' 
    });

    expect(testUser).not.toBeNull();
    expect(testUser.email).toBe('test@example.com');

    const session = testAuthFactory.createSession(testUser.id);

    expect(session).not.toBeNull();
    expect(session.userId).toBe(testUser.id);
    expect(session.token).toBeDefined();
    
    const sessionCount = testDb.prepare('SELECT COUNT(*) as count FROM admin_sessions').get();
    expect(sessionCount.count).toBe(1);
  });

  it('should store analytics events in analytics_events table', function testAnalyticsEventStorage() {
    const event = testAnalyticsFactory.recordPageView({
      page: '/test-page',
      userId: 'test-user-123'
    });

    expect(event).not.toBeNull();
    expect(event.eventType).toBe('pageview');
    expect(event.page).toBe('/test-page');
    expect(event.userId).toBe('test-user-123');
    
    const eventCount = testDb.prepare('SELECT COUNT(*) as count FROM analytics_events').get();
    expect(eventCount.count).toBe(1);
    
    const savedEvent = testDb.prepare('SELECT * FROM analytics_events WHERE id = ?').get(event.id);
    expect(savedEvent.event_type).toBe('pageview');
    expect(savedEvent.page).toBe('/test-page');
    expect(savedEvent.user_id).toBe('test-user-123');
  });

  it('should handle login endpoint simulation', function testLoginEndpointSimulation() {
    const testEmail = 'admin@test.com';
    
    const user = testAuthFactory.createUser({ 
      email: testEmail, 
      role: 'admin' 
    });
    
    expect(user).not.toBeNull();
    
    const userExists = testDb.prepare('SELECT * FROM admin_user WHERE email = ?').get(testEmail);
    expect(userExists).toBeDefined();
    expect(userExists.email).toBe(testEmail);
    
    const session = testAuthFactory.createSession(user.id);
    expect(session).not.toBeNull();
    
    const sessionExists = testDb.prepare('SELECT * FROM admin_sessions WHERE user_id = ?').get(user.id);
    expect(sessionExists).toBeDefined();
    expect(sessionExists.token).toBe(session.token);
  });
});

