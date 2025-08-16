type TProps = {
  label: string;
  href: string;
  class?: string;
};

export function ProjectBadge(props: TProps) {
  const base = "flex cursor-pointer items-center justify-start gap-1 border border-gray-200 px-4 py-2 text-xs font-medium text-black transition-all duration-300 hover:bg-gray-200";
  const shape = props.class || "rounded-full";
  return (
    <a target="_blank" href={props.href} rel="noreferrer">
      <div class={`${base} ${shape}`}>
        {props.label}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" class="mt-1 flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600">
          <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z" />
        </svg>
      </div>
    </a>
  );
}
