import { JSX, createSignal, onMount, Show } from "solid-js";
import { FadeIn } from "./fade-in";

type TClientMotionProps = {
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
 * Client-only Motion component with CSS fallback
 * Tries to use @motionone/solid, falls back to CSS animations
 */
export function ClientMotion(props: TClientMotionProps) {
  const [isMounted, setIsMounted] = createSignal(false);
  const [MotionComponent, setMotionComponent] = createSignal<any>(null);
  const [motionFailed, setMotionFailed] = createSignal(false);

  onMount(async () => {
    try {
      // Dynamically import Motion only on client side
      const { Motion } = await import("@motionone/solid");
      setMotionComponent(() => Motion);
      setIsMounted(true);
    } catch (error) {
      console.warn("Motion component failed to load, using CSS fallback:", error);
      setMotionFailed(true);
      setIsMounted(true);
    }
  });

  const element = props.as || 'div';
  const initial = props.initial || { opacity: 0, y: 20 };
  const animate = props.animate || { opacity: 1, y: 0 };
  const transition = props.transition || {
    duration: 0.6,
    easing: [0.4, 0.0, 0.2, 1]
  };

  // SSR fallback - render with final animation state
  if (!isMounted()) {
    const Component = element as any;
    return (
      <Component
        class={props.class}
        style={{
          opacity: 1, // Always visible during SSR
          transform: "translateY(0px)"
        }}
      >
        {props.children}
      </Component>
    );
  }

  // If Motion failed to load, use CSS fallback
  if (motionFailed() || !MotionComponent()) {
    return (
      <FadeIn
        as={element}
        class={props.class}
        delay={transition.delay ? transition.delay * 1000 : 0}
        duration={transition.duration ? transition.duration * 1000 : 600}
      >
        {props.children}
      </FadeIn>
    );
  }

  // Client-side with Motion
  const Motion = MotionComponent();
  const MotionEl = Motion[element];

  return (
    <MotionEl
      initial={initial}
      animate={animate}
      transition={transition}
      class={props.class}
    >
      {props.children}
    </MotionEl>
  );
}
