import { Motion } from "@motionone/solid";
import { JSX, createEffect, createSignal, onMount } from "solid-js";

type TMotionWrapperProps = {
  children: JSX.Element;
  initial?: Record<string, any>;
  animate?: Record<string, any>;
  transition?: {
    duration?: number;
    delay?: number;
    easing?: string | number[];
  };
  as?: keyof JSX.IntrinsicElements;
  class?: string;
  [key: string]: any;
};

/**
 * Motion wrapper that handles SSR properly and provides fallbacks
 */
export function MotionWrapper(props: TMotionWrapperProps) {
  const [isMounted, setIsMounted] = createSignal(false);
  
  onMount(() => {
    setIsMounted(true);
  });

  // Default values
  const element = props.as || 'div';
  const initial = props.initial || { opacity: 0, y: 20 };
  const animate = props.animate || { opacity: 1, y: 0 };
  const transition = props.transition || { 
    duration: 0.6, 
    easing: [0.4, 0.0, 0.2, 1] 
  };

  // If not mounted (SSR), render with final styles to prevent flash
  if (!isMounted()) {
    const Component = element as any;
    return (
      <Component 
        class={props.class}
        style={{ 
          opacity: animate.opacity || 1,
          transform: `translateY(${animate.y || 0}px)` 
        }}
      >
        {props.children}
      </Component>
    );
  }

  // Client-side: use Motion component
  const MotionComponent = (Motion as any)[element];
  
  return (
    <MotionComponent
      initial={initial}
      animate={animate}
      transition={transition}
      class={props.class}
      {...(props as any)}
    >
      {props.children}
    </MotionComponent>
  );
}
