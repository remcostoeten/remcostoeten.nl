'use client';

import { useState, useEffect, useCallback } from 'react';
import { getApiConfig, setApiEnvironment, type ApiEnvironment } from '@/config/api.config';

type TApiEnvironmentState = {
  environment: ApiEnvironment;
  base: string;
  analytics: string;
  isLocal: boolean;
  isProduction: boolean;
};

type TApiEnvironmentHook = {
  currentEnvironment: ApiEnvironment;
  config: TApiEnvironmentState;
  isLocal: boolean;
  isProduction: boolean;
  switchEnvironment: (env: ApiEnvironment) => void;
  isDevelopment: boolean;
};

function getInitialConfig(): TApiEnvironmentState {
  const config = getApiConfig();
  return {
    environment: config.environment,
    base: config.base,
    analytics: config.analytics,
    isLocal: config.isLocal,
    isProduction: config.isProduction,
  };
}

export function useApiEnvironment(): TApiEnvironmentHook {
  const [config, setConfig] = useState<TApiEnvironmentState>(getInitialConfig());
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(function syncConfigOnMount() {
    setConfig(getInitialConfig());
  }, []);

  const switchEnvironment = useCallback(function handleEnvironmentSwitch(env: ApiEnvironment) {
    setApiEnvironment(env);
  }, []);

  return {
    currentEnvironment: config.environment,
    config,
    isLocal: config.isLocal,
    isProduction: config.isProduction,
    switchEnvironment,
    isDevelopment,
  };
}
