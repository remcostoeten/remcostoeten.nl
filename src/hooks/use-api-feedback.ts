import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

type TApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  status: 'idle' | 'loading' | 'success' | 'error';
};

type TApiOptions = {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  loadingMessage?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
};

export function useApiFeedback() {
  const [response, setResponse] = useState<TApiResponse>({ status: 'idle' });

  const makeRequest = useCallback(async <T = unknown>(
    url: string,
    options: TApiOptions = {}
  ): Promise<T | null> => {
    const {
      showSuccessToast = true,
      showErrorToast = true,
      successMessage,
      loadingMessage,
      method = 'GET',
      headers = {},
      body
    } = options;

    try {
      setResponse({ status: 'loading' });

      if (loadingMessage) {
        toast({
          title: 'Loading...',
          description: loadingMessage,
        });
      }

      const requestConfig: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: AbortSignal.timeout(10000),
      };

      if (body && method !== 'GET') {
        requestConfig.body = JSON.stringify(body);
      }

      const fetchResponse = await fetch(url, requestConfig);
      
      if (!fetchResponse.ok) {
        throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
      }

      const data = await fetchResponse.json() as T;
      
      setResponse({ 
        status: 'success', 
        data 
      });

      if (showSuccessToast) {
        toast({
          title: 'Success',
          description: successMessage || `${method} request completed successfully`,
        });
      }

      return data;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setResponse({ 
        status: 'error', 
        error: errorMessage 
      });

      if (showErrorToast) {
        toast({
          title: 'Request Failed',
          description: `API Error: ${errorMessage}`,
          variant: 'destructive',
        });
      }

      return null;
    }
  }, []);

  const postAnalyticsEvent = useCallback(async (eventData: {
    eventType: string;
    page?: string;
    sessionId?: string;
    referrer?: string;
    data?: unknown;
  }) => {
    const apiPort = import.meta.env.VITE_API_PORT || '3003';
    return makeRequest(`http://localhost:${apiPort}/api/analytics/events`, {
      method: 'POST',
      body: eventData,
      successMessage: 'Analytics event tracked successfully',
      showSuccessToast: false,
    });
  }, [makeRequest]);

  const getAnalyticsMetrics = useCallback(async (timeRange?: string) => {
    const apiPort = import.meta.env.VITE_API_PORT || '3003';
    const url = timeRange 
      ? `http://localhost:${apiPort}/api/analytics/metrics?range=${timeRange}`
      : `http://localhost:${apiPort}/api/analytics/metrics`;
      
    return makeRequest(url, {
      successMessage: 'Metrics loaded successfully',
      showSuccessToast: false,
    });
  }, [makeRequest]);

  const getRealTimeStats = useCallback(async () => {
    const apiPort = import.meta.env.VITE_API_PORT || '3003';
    return makeRequest(`http://localhost:${apiPort}/api/analytics/realtime`, {
      successMessage: 'Real-time stats loaded',
      showSuccessToast: false,
    });
  }, [makeRequest]);

  const getAnalyticsEvents = useCallback(async (params?: {
    limit?: number;
    offset?: number;
    event?: string;
  }) => {
    const apiPort = import.meta.env.VITE_API_PORT || '3003';
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.event) searchParams.set('event', params.event);
    
    const url = `http://localhost:${apiPort}/api/analytics/events?${searchParams}`;
    
    return makeRequest(url, {
      successMessage: 'Events loaded successfully',
      showSuccessToast: false,
    });
  }, [makeRequest]);

  const testApiConnection = useCallback(async () => {
    const apiPort = import.meta.env.VITE_API_PORT || '3003';
    return makeRequest(`http://localhost:${apiPort}/api/health`, {
      successMessage: 'API connection test successful',
      showSuccessToast: true,
    });
  }, [makeRequest]);

  return {
    response,
    makeRequest,
    postAnalyticsEvent,
    getAnalyticsMetrics,
    getRealTimeStats,
    getAnalyticsEvents,
    testApiConnection,
    isLoading: response.status === 'loading',
    isSuccess: response.status === 'success',
    isError: response.status === 'error',
    error: response.error,
    data: response.data,
  };
}
