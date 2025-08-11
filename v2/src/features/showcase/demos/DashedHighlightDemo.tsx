import { DashedHighlight } from "~/components/primitives/dashed-highlight";

export function DashedHighlightDemo() {
  return (
    <div class="space-y-3">
      <div class="text-base">
        <DashedHighlight>Default hover animation</DashedHighlight>
      </div>
      <div class="text-base">
        <DashedHighlight alwaysAnimate>Always animating</DashedHighlight>
      </div>
      <div class="text-base">
        <DashedHighlight variant="special">Special variant</DashedHighlight>
      </div>
    </div>
  );
}
