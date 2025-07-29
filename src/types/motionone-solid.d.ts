declare module '@motionone/solid' {
  import { Component, JSX } from 'solid-js';

  export interface MotionProps {
    initial?: Record<string, any>;
    animate?: Record<string, any>;
    exit?: Record<string, any>;
    transition?: {
      duration?: number;
      delay?: number;
      easing?: string | number[] | any;
      [key: string]: any;
    };
    whileHover?: Record<string, any>;
    whileTap?: Record<string, any>;
    whileFocus?: Record<string, any>;
    whileInView?: Record<string, any>;
    style?: JSX.CSSProperties | string;
    class?: string;
    children?: JSX.Element;
    [key: string]: any;
  }

  export interface MotionComponent<T = HTMLElement> {
    (props: MotionProps & JSX.HTMLAttributes<T>): JSX.Element;
  }

  export const Motion: {
    div: MotionComponent<HTMLDivElement>;
    span: MotionComponent<HTMLSpanElement>;
    p: MotionComponent<HTMLParagraphElement>;
    h1: MotionComponent<HTMLHeadingElement>;
    h2: MotionComponent<HTMLHeadingElement>;
    h3: MotionComponent<HTMLHeadingElement>;
    h4: MotionComponent<HTMLHeadingElement>;
    h5: MotionComponent<HTMLHeadingElement>;
    h6: MotionComponent<HTMLHeadingElement>;
    a: MotionComponent<HTMLAnchorElement>;
    button: MotionComponent<HTMLButtonElement>;
    section: MotionComponent<HTMLElement>;
    article: MotionComponent<HTMLElement>;
    header: MotionComponent<HTMLElement>;
    footer: MotionComponent<HTMLElement>;
    nav: MotionComponent<HTMLElement>;
    main: MotionComponent<HTMLElement>;
    aside: MotionComponent<HTMLElement>;
    ul: MotionComponent<HTMLUListElement>;
    ol: MotionComponent<HTMLOListElement>;
    li: MotionComponent<HTMLLIElement>;
    img: MotionComponent<HTMLImageElement>;
    svg: MotionComponent<SVGSVGElement>;
    path: MotionComponent<SVGPathElement>;
    [key: string]: MotionComponent<any>;
  };

  export interface PresenceProps {
    children: JSX.Element;
    exitBeforeEnter?: boolean;
    initial?: boolean;
  }

  export const Presence: Component<PresenceProps>;
}
