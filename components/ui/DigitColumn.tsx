import { createSignal, createEffect, onMount, Component } from 'solid-js';

type TProps = {
  from: string;
  to: string;
  timing: {
    duration: number;
    easing: string;
  };
  delay?: number;
  ref?: (el: HTMLSpanElement) => void;
};

function calculateOffset(digit: string): number {
  if (digit === '.') return -10;
  const digitNum = parseInt(digit, 10);
  if (isNaN(digitNum)) return 0;
  return -digitNum;
}

export function DigitColumn(props: TProps): Component<TProps> {
  const [offset, setOffset] = createSignal(0);
  let digitRef: HTMLSpanElement | undefined;

  function applyTransition(targetOffset: number) {
    if (!digitRef) return;
    
    digitRef.style.transition = `transform ${props.timing.duration}ms ${props.timing.easing}`;
    digitRef.style.transform = `translateY(${targetOffset * 10}%)`;
    if (props.delay !== undefined) {
      digitRef.style.transitionDelay = `${props.delay}ms`;
    }
    setOffset(targetOffset);
  }

  onMount(() => {
    const startOffset = calculateOffset(props.from);
    const targetOffset = calculateOffset(props.to);
    
    if (digitRef) {
      digitRef.style.transform = `translateY(${startOffset * 10}%)`;
      digitRef.style.transition = 'none';
      
      requestAnimationFrame(() => {
        applyTransition(targetOffset);
      });
    }
  });

  createEffect(() => {
    const targetOffset = calculateOffset(props.to);
    if (targetOffset !== offset()) {
      applyTransition(targetOffset);
    }
  });

  return (
    <span class="nf-digit">
      <span 
        class="nf-stack"
        ref={(el) => {
          digitRef = el;
          if (props.ref) props.ref(el);
        }}
      >
        <span>0</span>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
        <span>6</span>
        <span>7</span>
        <span>8</span>
        <span>9</span>
        <span>.</span>
      </span>
    </span>
  );
}
