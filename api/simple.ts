export default function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, url } = req;
    
    // Basic environment check
    const hasDbUrl = !!process.env.DATABASE_URL;
    const nodeEnv = process.env.NODE_ENV;
    
    // Simple routing
    if (url?.includes('/debug')) {
      return res.json({
        status: 'debug',
        timestamp: new Date().toISOString(),
        method,
        url,
        environment: {
          NODE_ENV: nodeEnv,
          has_database_url: hasDbUrl,
          database_url_prefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
        }
      });
    }

    if (url?.includes('/health')) {
      return res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        method,
        url
      });
    }

    // For analytics endpoints, return empty data for now
    if (url?.includes('/analytics/events')) {
      if (method === 'POST') {
        return res.json({ success: true, message: 'Event tracked (mock)' });
      } else {
        return res.json({
          events: [],
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0
        });
      }
    }

    if (url?.includes('/analytics/metrics')) {
      return res.json({
        totalPageViews: 0,
        uniqueVisitors: 0,
        averageSessionDuration: 0,
        topPages: [],
        topReferrers: [],
        deviceTypes: [],
        popularProjects: [],
        contactFormStats: { submissions: 0, successRate: 0 },
        hourlyActivity: [],
        dailyActivity: [],
        topCountries: [],
        topRegions: [],
        topCities: []
      });
    }

    if (url?.includes('/analytics/realtime')) {
      return res.json({
        activeUsers: 0,
        currentPageViews: [],
        recentEvents: []
      });
    }

    // Default response
    return res.json({
      status: 'simple_api',
      message: 'Simple analytics API is working',
      timestamp: new Date().toISOString(),
      method,
      url
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
