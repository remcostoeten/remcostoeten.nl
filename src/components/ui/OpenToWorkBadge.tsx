type TProps = {
  text: string;
  iconColorClass?: string;
  rotateClass?: string;
  bgClass?: string;
  borderClass?: string;
  textClass?: string;
};

export function OpenToWorkBadge(props: TProps) {
  const iconClass = props.iconColorClass || "fill-[#00997e]";
  const rotate = props.rotateClass || "-rotate-6";
  const bg = props.bgClass || "bg-gray-100";
  const border = props.borderClass || "border border-gray-200";
  const text = props.textClass || "text-black";
  const cls = `flex w-fit ${rotate} items-center justify-start gap-1 rounded-full ${border} ${bg} px-2 py-1 font-serif text-xs leading-tight ${text}`;
  return (
    <div class={cls}>
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 256 256" class="animate-pulse">
        <path class={iconClass} d="M240,128a15.79,15.79,0,0,1-10.5,15l-63.44,23.07L143,229.5a16,16,0,0,1-30,0L89.94,166.06,26.5,143a16,16,0,0,1,0-30L89.94,89.94,113,26.5a16,16,0,0,1,30,0l23.07,63.44L229.5,113A15.79,15.79,0,0,1,240,128Z" />
      </svg>
      {props.text}
    </div>
  );
}
