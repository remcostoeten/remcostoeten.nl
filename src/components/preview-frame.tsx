type TProps = {
  url?: string;
  title?: string;
  className?: string;
};

export function PreviewFrame({ url, title, className }: TProps) {
  return (
    <iframe
      src={url || "/"}
      title={title || "Live Preview"}
      className={className || "w-full h-full border border-[hsl(var(--border))] bg-white"}
    />
  );
}
