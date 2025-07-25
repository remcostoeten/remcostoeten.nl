type TNumberFlowConfig = {
  format?: Intl.NumberFormatOptions;
  transformTiming?: { duration: number; easing: string };
  spinTiming?: { duration: number; easing: string };
  opacityTiming?: { duration: number; easing: string };
  prefix?: string;
  suffix?: string;
};

export const numberFlowPresets = {
  currency: (currencyCode = 'USD'): TNumberFlowConfig => ({
    format: {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    transformTiming: { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  }),

  percentage: (): TNumberFlowConfig => ({
    suffix: '%',
    format: {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
    transformTiming: { duration: 300, easing: 'ease-out' },
    spinTiming: { duration: 350, easing: 'ease-out' },
  }),

  compact: (): TNumberFlowConfig => ({
    format: {
      notation: 'compact',
      compactDisplay: 'short',
    },
    transformTiming: { duration: 500, easing: 'ease-out' },
  }),

  integer: (): TNumberFlowConfig => ({
    format: {
      maximumFractionDigits: 0,
    },
    transformTiming: { duration: 400, easing: 'ease-out' },
  }),

  decimal: (digits = 2): TNumberFlowConfig => ({
    format: {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    },
    transformTiming: { duration: 450, easing: 'ease-out' },
  }),

  fast: (): TNumberFlowConfig => ({
    transformTiming: { duration: 200, easing: 'ease-out' },
    spinTiming: { duration: 250, easing: 'ease-out' },
    opacityTiming: { duration: 150, easing: 'ease-out' },
  }),

  slow: (): TNumberFlowConfig => ({
    transformTiming: { duration: 800, easing: 'ease-in-out' },
    spinTiming: { duration: 1000, easing: 'ease-in-out' },
    opacityTiming: { duration: 400, easing: 'ease-out' },
  }),

  smooth: (): TNumberFlowConfig => ({
    transformTiming: { duration: 600, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
    spinTiming: { duration: 700, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
    opacityTiming: { duration: 300, easing: 'ease-out' },
  }),
};

export function createNumberFlowConfig(overrides: TNumberFlowConfig = {}): TNumberFlowConfig {
  const defaults: TNumberFlowConfig = {
    format: {},
    transformTiming: { duration: 400, easing: 'ease-out' },
    spinTiming: { duration: 500, easing: 'ease-out' },
    opacityTiming: { duration: 200, easing: 'ease-out' },
  };

  return {
    ...defaults,
    ...overrides,
    format: { ...defaults.format, ...overrides.format },
    transformTiming: { ...defaults.transformTiming, ...overrides.transformTiming },
    spinTiming: { ...defaults.spinTiming, ...overrides.spinTiming },
    opacityTiming: { ...defaults.opacityTiming, ...overrides.opacityTiming },
  };
}
