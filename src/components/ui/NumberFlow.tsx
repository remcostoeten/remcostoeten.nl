import { createSignal, createEffect, Component, JSX } from 'solid-js';
import { animate } from '@motionone/solid';

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

export const NumberFlow: Component<TProps> = (props) => {
  const [displayValue, setDisplayValue] = createSignal(props.value);
  const [isAnimating, setIsAnimating] = createSignal(false);
  let spanRef: HTMLSpanElement | undefined;

  const formatValue = (value: number) => {
    return new Intl.NumberFormat(undefined, props.format || {}).format(value);
  };

  createEffect(() => {
    const newValue = props.value;
    const currentValue = displayValue();
    
    if (newValue === currentValue || !props.animated) {
      setDisplayValue(newValue);
      return;
    }

    const transformTiming = props.transformTiming || { duration: 400, easing: 'ease-out' };
    const duration = transformTiming.duration / 1000;

    setIsAnimating(true);
    
    animate(
      (progress) => {
        const interpolatedValue = currentValue + (newValue - currentValue) * progress;
        setDisplayValue(interpolatedValue);
      },
      {
        duration,
        easing: transformTiming.easing === 'ease-out' ? 'ease-out' : 'ease-in-out',
      }
    ).finished.then(() => {
      setIsAnimating(false);
      setDisplayValue(newValue);
    });
  });

  if (!props.animated) {
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
