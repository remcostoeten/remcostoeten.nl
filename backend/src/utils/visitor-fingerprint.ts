import { createHash } from 'crypto';

type TFingerprintData = {
  userAgent?: string;
  acceptLanguage?: string;
  screenResolution?: string;
  timezone?: string;
  platform?: string;
  ipAddress?: string;
};

function generateVisitorFingerprint(data: TFingerprintData): string {
  // Create a consistent fingerprint from available data
  const fingerprintData = [
    data.userAgent || '',
    data.acceptLanguage || '',
    data.screenResolution || '',
    data.timezone || '',
    data.platform || '',
    // Don't include IP address in fingerprint for privacy
    // data.ipAddress || '',
  ].join('|');

  // Generate a hash of the fingerprint data
  return createHash('sha256').update(fingerprintData).digest('hex').substring(0, 16);
}

function extractFingerprintFromRequest(req: any): TFingerprintData {
  return {
    userAgent: req.headers.get('user-agent'),
    acceptLanguage: req.headers.get('accept-language'),
    screenResolution: req.headers.get('x-screen-resolution'),
    timezone: req.headers.get('x-timezone'),
    platform: req.headers.get('x-platform'),
    ipAddress: req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress,
  };
}

export { generateVisitorFingerprint, extractFingerprintFromRequest };

