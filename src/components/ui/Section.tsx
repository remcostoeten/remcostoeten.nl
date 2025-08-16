import { JSX } from "solid-js";

function classNames(a?: string, b?: string): string {
  const x = a ? a.trim() : "";
  const y = b ? b.trim() : "";
  return [x, y].filter(Boolean).join(" ");
}

type TProps = {
  children: JSX.Element;
  class?: string;
  padding?: string;
  margin?: string;
};

export function Section(props: TProps) {
  const base = "w-full";
  const pm = [props.padding, props.margin].filter(Boolean).join(" ");
  const cls = classNames(base, classNames(pm, props.class));
  return <section class={cls}>{props.children}</section>;
}
