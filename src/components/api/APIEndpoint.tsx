"use client";

import { useEffect, useState, useCallback } from "react";

interface APIEndpointProps {
  endpointUrl: string;
  refreshInterval?: number;
  render?: (data: any) => React.ReactNode;
}

interface APIState {
  data: any;
  loading: boolean;
  error: string | null;
}

export default function APIEndpoint({ 
  endpointUrl, 
  refreshInterval, 
  render 
}: APIEndpointProps) {
  const [state, setState] = useState<APIState>({
    data: null,
    loading: true,
    error: null
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(endpointUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setState({
        data,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  }, [endpointUrl]);

  // Fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up interval refresh if specified
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  // Render loading state
  if (state.loading) {
    return (
      <div className="text-base text-foreground leading-relaxed">
        Loading...
      </div>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <div className="text-base text-foreground leading-relaxed">
        Error: {state.error}
      </div>
    );
  }

  // Render with custom render function if provided
  if (render) {
    return (
      <div className="text-base text-foreground leading-relaxed">
        {render(state.data)}
      </div>
    );
  }

  // Fallback to JSON pretty print
  return (
    <pre className="text-base text-foreground leading-relaxed">
      {JSON.stringify(state.data, null, 2)}
    </pre>
  );
}
