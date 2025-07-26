type TProps = {
  time: string;
  className?: string;
};

export function TimeNumberFlow(props: TProps) {
  return (
    <span class={`font-mono ${props.className || ""}`}>
      {props.time}
    </span>
  );
}
