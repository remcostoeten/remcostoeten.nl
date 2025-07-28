import { createSignal, createEffect, Component, JSX, For } from 'solid-js';
import { DigitColumn } from '../../../components/ui/DigitColumn';
import { buildDigitMeta, splitFormatted } from '../../lib/digit-model-helpers';

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

function NumberFlow(props: TProps) {
  const [displayValue, setDisplayValue] = createSignal(props.value);
  let spanRef: HTMLSpanElement | undefined;

  function formatValue(value: number) {
    return new Intl.NumberFormat(undefined, props.format || {}).format(value);
  }

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

  const formattedPrev = formatValue(displayValue());
  const formattedNext = formatValue(props.value);
  const charsMeta = buildDigitMeta(splitFormatted(formattedPrev), splitFormatted(formattedNext));
  const spinTiming = props.spinTiming || { duration: 400, easing: 'ease-out' };
  const opacityTiming = props.opacityTiming || { duration: 200, easing: 'ease-out' };
  const delayStep = Math.min(opacityTiming.duration * 0.1, 50);

  return (
    <span class={`inline-flex items-center ${props.class || ''}`}>
      {props.prefix && <span class="mr-0.5">{props.prefix}</span>}
      <span
        ref={(el) => {
          spanRef = el;
          if (props.ref) props.ref(el);
        }}
        class="font-mono inline-flex"
        {...(props as any)}
      >
        <For each={charsMeta}>
          {(meta) => {
            if (meta.isDigit) {
              const delay = meta.carry ? meta.index * delayStep : 0;
              return <DigitColumn from={meta.prev} to={meta.next} timing={spinTiming} delay={delay} />;
            } else {
              return <span>{meta.next}</span>;
            }
          }}
        </For>
      </span>
      {props.suffix && <span class="ml-0.5">{props.suffix}</span>}
    </span>
  );
}

export { NumberFlow };
