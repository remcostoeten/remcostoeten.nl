import { Checkbox } from "~/components/primitives/checkbox";
import { createSignal } from "solid-js";

export function CheckboxDemo() {
  const [checked, setChecked] = createSignal(false);

  function onInput(e: Event) {
    const target = e.target as HTMLInputElement;
    setChecked(target.checked);
  }

  return (
    <div class="space-y-3">
      <Checkbox
        id="demo-checkbox"
        name="demo"
        checked={checked()}
        onInput={onInput}
        label="Accept terms"
      />
      <div class="text-sm text-muted-foreground">Checked: {String(checked())}</div>
    </div>
  );
}
