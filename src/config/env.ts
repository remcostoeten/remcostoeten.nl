/**
 * @fileoverview Environment configuration for frontend deployment
 */

type TEnvironment = 'development' | 'production' | 'test';

type TEnvConfig = {
  API_BASE_URL: string;
  APP_ENV: TEnvironment;
  IS_PRODUCTION: boolean;
  IS_DEVELOPMENT: boolean;
};

function getEnvironment(): TEnvironment {
  const env = import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development';
  return env as TEnvironment;
}

function getApiBaseUrl(): string {
  // In production, use the Vercel API URL
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://your-api.vercel.app/api';
  }
  
  // In development, use local API
  return import.meta.env.VITE_API_URL || 'http://localhost:3334';
}

const environment = getEnvironment();

export const env: TEnvConfig = {
  API_BASE_URL: getApiBaseUrl(),
  APP_ENV: environment,
  IS_PRODUCTION: environment === 'production',
  IS_DEVELOPMENT: environment === 'development',
};

export function createApiUrl(endpoint: string): string {
  const baseUrl = env.API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
}
