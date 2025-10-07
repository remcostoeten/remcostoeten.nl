import type { CreateVisitorData } from '../types/visitor';

export interface TGeolocationData {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
}

/**
 * Extract geolocation data from IP address
 * In production, you'd use a service like MaxMind GeoIP2 or ipapi.co
 * For now, we'll use a simple approach with public APIs
 */
export async function getGeolocationFromIP(ipAddress?: string): Promise<TGeolocationData> {
    if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
        // Local/private IP addresses
        return {
            country: 'Local',
            region: 'Local',
            city: 'Local',
            timezone: 'UTC'
        };
    }

    try {
        // Using ipapi.co (free tier: 1000 requests/day)
        const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        return {
            country: data.country_name || data.country,
            region: data.region,
            city: data.city,
            timezone: data.timezone
        };
    } catch (error) {
        console.warn('Failed to get geolocation data:', error);
        return {
            country: 'Unknown',
            region: 'Unknown',
            city: 'Unknown',
            timezone: 'UTC'
        };
    }
}

/**
 * Parse user agent to extract device information
 */
export function parseUserAgent(userAgent?: string): {
    browser?: string;
    os?: string;
    deviceType?: string;
    platform?: string;
} {
    if (!userAgent) {
        return {};
    }

    const ua = userAgent.toLowerCase();

    // Browser detection
    let browser = 'Unknown';
    if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('opera')) browser = 'Opera';

    // OS detection
    let os = 'Unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('ios')) os = 'iOS';

    // Device type detection
    let deviceType = 'desktop';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
        deviceType = 'tablet';
    }

    // Platform detection
    let platform = 'Unknown';
    if (ua.includes('windows')) platform = 'Windows';
    else if (ua.includes('mac')) platform = 'macOS';
    else if (ua.includes('linux')) platform = 'Linux';
    else if (ua.includes('android')) platform = 'Android';
    else if (ua.includes('ios')) platform = 'iOS';

    return {
        browser,
        os,
        deviceType,
        platform
    };
}

/**
 * Enhance visitor data with geolocation and device information
 */
export async function enhanceVisitorData(data: CreateVisitorData): Promise<CreateVisitorData> {
    // Get geolocation data
    const geoData = await getGeolocationFromIP(data.ipAddress);

    // Parse user agent
    const deviceData = parseUserAgent(data.userAgent);

    return {
        ...data,
        ...geoData,
        ...deviceData,
        // Extract language from user agent or use default
        language: data.language || 'en-US',
        // Extract screen resolution if available (this would come from frontend)
        screenResolution: data.screenResolution || 'Unknown'
    };
}



