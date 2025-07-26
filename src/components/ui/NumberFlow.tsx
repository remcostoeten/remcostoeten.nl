import { createSignal, createEffect, Component, JSX, onCleanup } from 'solid-js';

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
  const [isAnimating, setIsAnimating] = createSignal(false);
  let animationId: number | null = null;
  let spanRef: HTMLSpanElement | undefined;

  const formatValue = (value: number) => {
    return new Intl.NumberFormat(undefined, props.format || {}).format(value);
  };

  onCleanup(() => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
    }
  });

  createEffect(() => {
    const newValue = props.value;
    const currentValue = displayValue();
    
    // Default animated to true if not specified
    const isAnimated = props.animated !== false;
    
    if (newValue === currentValue || !isAnimated) {
      setDisplayValue(newValue);
      return;
    }

    // Cancel any existing animation
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
    }

    const transformTiming = props.transformTiming || { duration: 400, easing: 'ease-out' };
    const startTime = performance.now();
    const startValue = currentValue;
    const valueChange = newValue - startValue;

    setIsAnimating(true);
    
    function animateStep(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / transformTiming.duration, 1);
      
      // Apply easing function
      let easedProgress = progress;
      if (transformTiming.easing === 'ease-out') {
        easedProgress = easeOutExpo(progress);
      } else if (transformTiming.easing === 'ease-in-out') {
        easedProgress = easeInOutExpo(progress);
      }
      
      const interpolatedValue = startValue + (valueChange * easedProgress);
      setDisplayValue(interpolatedValue);
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animateStep);
      } else {
        setIsAnimating(false);
        setDisplayValue(newValue);
        animationId = null;
      }
    }
    
    animationId = requestAnimationFrame(animateStep);
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
