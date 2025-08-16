type TProps = {
  label: string;
  href: string;
  svgPath: string;
  viewBox?: string;
  size?: number;
  class?: string;
};

export function SocialLink(props: TProps) {
  const viewBox = props.viewBox || "0 0 256 256";
  const size = props.size || 12;
  const cls = props.class || "flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900";
  return (
    <a class={cls} href={props.href} target="_blank" rel="noreferrer">
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox={viewBox}>
        <path d={props.svgPath} />
      </svg>
      {props.label}
    </a>
  );
}
