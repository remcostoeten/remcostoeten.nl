type TProps = {
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  class?: string;
};

export function Heading(props: TProps) {
  const lvl = props.level || 1;
  if (lvl === 1) return <h1 class={props.class}>{props.text}</h1>;
  if (lvl === 2) return <h2 class={props.class}>{props.text}</h2>;
  if (lvl === 3) return <h3 class={props.class}>{props.text}</h3>;
  if (lvl === 4) return <h4 class={props.class}>{props.text}</h4>;
  if (lvl === 5) return <h5 class={props.class}>{props.text}</h5>;
  return <h6 class={props.class}>{props.text}</h6>;
}
