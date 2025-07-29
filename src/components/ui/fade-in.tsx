import { JSX, createSignal, onMount } from "solid-js";

type TFadeInProps = {
  children: JSX.Element;
  delay?: number;
  duration?: number;
  as?: keyof JSX.IntrinsicElements;
  class?: string;
  [key: string]: any;
};

/**
 * Simple CSS-based fade-in animation as a fallback for Motion components
 * This ensures content is always visible and animated, even if Motion fails
 */
export function FadeIn(props: TFadeInProps) {
  const [isVisible, setIsVisible] = createSignal(false);
  
  onMount(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, props.delay || 0);
    
    return () => clearTimeout(timer);
  });

  const element = props.as || 'div';
  const duration = props.duration || 600;
  
  const Component = element as any;
  
  return (
    <Component
      class={props.class}
      style={{
        opacity: isVisible() ? 1 : 0,
        transform: isVisible() ? 'translateY(0px)' : 'translateY(20px)',
        transition: `opacity ${duration}ms cubic-bezier(0.4, 0.0, 0.2, 1), transform ${duration}ms cubic-bezier(0.4, 0.0, 0.2, 1)`,
        ...props.style
      }}
    >
      {props.children}
    </Component>
  );
}
