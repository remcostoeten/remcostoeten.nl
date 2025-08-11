import { ArrowLink } from "~/components/ui/arrow-link";

export function ArrowLinkDemo() {
  return (
    <div class="space-y-3">
      <ArrowLink href="https://example.com" external>
        External link
      </ArrowLink>
      <div>
        <ArrowLink href="/">Internal link</ArrowLink>
      </div>
    </div>
  );
}
