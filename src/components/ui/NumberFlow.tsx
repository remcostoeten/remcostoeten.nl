import { createSignal, createEffect, Component, JSX, onCleanup, For } from 'solid-js';
import './NumberFlow.css';
import { DigitColumn } from '../../../components/ui/DigitColumn';
import { buildDigitMeta, splitFormatted } from '../lib/digit-model-helpers';

type TProps = {
  value: number;
  class?: string;
  format?: Intl.NumberFormatOptions;
  transformTiming?: {
    duration: number;
    easing: string;
  };
  spinTiming?: {
    duration: number;
    easing: string;
  };
  opacityTiming?: {
    duration: number;
    easing: string;
  };
  prefix?: string;
  suffix?: string;
  animated?: boolean;
  ref?: (el: HTMLSpanElement) => void;
} & JSX.HTMLAttributes<HTMLSpanElement>;

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeInOutExpo(t: number): number {
  return t === 0
    ? 0
    : t === 1
    ? 1
    : t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

export const NumberFlow: Component<TProps> = (props) => {
  const [displayValue, setDisplayValue] = createSignal(props.value);
  let spanRef: HTMLSpanElement | undefined;

  const formatValue = (value: number) => {
    return new Intl.NumberFormat(undefined, props.format || {}).format(value);
  };

  createEffect(() => {
    setDisplayValue(props.value);
  });
  if (props.animated === false) {
    const formattedValue = formatValue(props.value);
    return (
      <span 
        ref={(el) => {
          spanRef = el;
          if (props.ref) props.ref(el);
        }}
        class={`font-mono ${props.class || ''}`}
        {...(props as any)}
      >
        {props.prefix}{formattedValue}{props.suffix}
      </span>
    );
  }

  return (
    <span class={`inline-flex items-center ${props.class || ''}`}>
      {props.prefix && <span class="mr-0.5">{props.prefix}</span>}
      <span
        ref={(el) => {
          spanRef = el;
          if (props.ref) props.ref(el);
        }}
        class="font-mono"
        {...(props as any)}
      >
        {formatValue(displayValue())}
      </span>
      {props.suffix && <span class="ml-0.5">{props.suffix}</span>}
    </span>
  );
};
