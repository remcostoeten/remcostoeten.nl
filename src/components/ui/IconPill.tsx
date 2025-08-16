import { JSX } from "solid-js";

type TProps = {
  icon: JSX.Element;
  text: string;
  class?: string;
};

export function IconPill(props: TProps) {
  const base = "flex items-center justify-start gap-1 rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-black";
  return (
    <div class={`${base} ${props.class || ""}`.trim()}>
      {props.icon}
      {props.text}
    </div>
  );
}
