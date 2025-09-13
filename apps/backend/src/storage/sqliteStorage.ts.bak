import Database from 'better-sqlite3';
import type { StorageAdapter } from './types';
import type { Pageview, CreatePageviewData, PageviewFilters, PageviewStats } from '../types/pageview';

export const createSqliteStorage = (dbPath: string = './pageviews.db'): StorageAdapter => {
  const db = new Database(dbPath);

  // Initialize database schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS pageviews (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT,
      referrer TEXT,
      user_agent TEXT,
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_pageviews_timestamp ON pageviews(timestamp);
    CREATE INDEX IF NOT EXISTS idx_pageviews_url ON pageviews(url);
    CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON pageviews(created_at);
  `);

  return {
    async createPageview(data: CreatePageviewData): Promise<Pageview> {
      const pageview: Pageview = {
        id: crypto.randomUUID(),
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      const stmt = db.prepare(`
        INSERT INTO pageviews (id, url, title, referrer, user_agent, timestamp, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        pageview.id,
        pageview.url,
        pageview.title || null,
        pageview.referrer || null,
        pageview.userAgent || null,
        pageview.timestamp,
        pageview.createdAt
      );

      return pageview;
    },

    async getPageviews(filters: PageviewFilters): Promise<Pageview[]> {
      let query = 'SELECT * FROM pageviews';
      const params: any[] = [];
      const conditions: string[] = [];

      if (filters.url) {
        conditions.push('url LIKE ?');
        params.push(`%${filters.url}%`);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY timestamp DESC';

      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const stmt = db.prepare(query);
      const rows = stmt.all(...params) as any[];

      return rows.map(row => ({
        id: row.id,
        url: row.url,
        title: row.title,
        referrer: row.referrer,
        userAgent: row.user_agent,
        timestamp: row.timestamp,
        createdAt: row.created_at,
      }));
    },

    async getTotalCount(filters: Pick<PageviewFilters, 'url'>): Promise<number> {
      let query = 'SELECT COUNT(*) as count FROM pageviews';
      const params: any[] = [];

      if (filters.url) {
        query += ' WHERE url LIKE ?';
        params.push(`%${filters.url}%`);
      }

      const stmt = db.prepare(query);
      const result = stmt.get(...params) as { count: number };
      return result.count;
    },

    async getStats(): Promise<PageviewStats> {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const yesterday = new Date(today).toISOString();
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Total count
      const totalStmt = db.prepare('SELECT COUNT(*) as count FROM pageviews');
      const total = (totalStmt.get() as { count: number }).count;

      // Today count
      const todayStmt = db.prepare('SELECT COUNT(*) as count FROM pageviews WHERE timestamp >= ?');
      const todayCount = (todayStmt.get(today) as { count: number }).count;

      // Yesterday count
      const yesterdayStmt = db.prepare('SELECT COUNT(*) as count FROM pageviews WHERE timestamp >= ? AND timestamp < ?');
      const yesterdayCount = (yesterdayStmt.get(yesterday, today) as { count: number }).count;

      // This week count
      const weekStmt = db.prepare('SELECT COUNT(*) as count FROM pageviews WHERE timestamp >= ?');
      const thisWeekCount = (weekStmt.get(thisWeek) as { count: number }).count;

      // Unique URLs
      const uniqueStmt = db.prepare('SELECT COUNT(DISTINCT url) as count FROM pageviews');
      const uniqueUrls = (uniqueStmt.get() as { count: number }).count;

      // Top pages
      const topPagesStmt = db.prepare(`
        SELECT url, COUNT(*) as count 
        FROM pageviews 
        GROUP BY url 
        ORDER BY count DESC 
        LIMIT 10
      `);
      const topPages = topPagesStmt.all() as Array<{ url: string; count: number }>;

      return {
        total,
        today: todayCount,
        yesterday: yesterdayCount,
        thisWeek: thisWeekCount,
        uniqueUrls,
        topPages,
      };
    },
  };
};
