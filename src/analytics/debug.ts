export class AnalyticsDebug {
  private static isDebugMode(): boolean {
    return typeof window !== 'undefined' && 
           (window.location.hostname === 'localhost' || 
            window.localStorage.getItem('analytics_debug') === 'true');
  }

  static log(message: string, data?: unknown): void {
    if (this.isDebugMode()) {
      console.group(`🔍 Analytics Debug: ${message}`);
      if (data) {
        console.log(data);
      }
      console.groupEnd();
    }
  }

  static error(message: string, error?: unknown): void {
    if (this.isDebugMode()) {
      console.group(`❌ Analytics Error: ${message}`);
      if (error) {
        console.error(error);
      }
      console.groupEnd();
    }
  }

  static success(message: string, data?: unknown): void {
    if (this.isDebugMode()) {
      console.group(`✅ Analytics Success: ${message}`);
      if (data) {
        console.log(data);
      }
      console.groupEnd();
    }
  }

  static checkConfiguration(): void {
    if (!this.isDebugMode()) return;

    console.group('🔧 Analytics Configuration Check');
    console.log('Environment Info:', {
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      isDev: import.meta?.env?.DEV,
      mode: import.meta?.env?.MODE,
    });

    // Check if API is accessible
    const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? `http://localhost:${import.meta?.env?.VITE_API_PORT || '3003'}/api/analytics`
      : '/api/analytics';

    console.log('API Base URL:', apiBase);
    console.log('Will make requests to:', `${apiBase}/events`);
    console.groupEnd();
  }
}
