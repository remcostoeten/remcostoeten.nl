import { Input } from "~/components/primitives/input";
import { createSignal } from "solid-js";

export function InputDemo() {
  const [value, setValue] = createSignal("");

  function onInput(e: InputEvent & { currentTarget: HTMLInputElement; target: HTMLInputElement }) {
    setValue(e.currentTarget.value);
  }

  return (
    <div class="space-y-4">
      <Input label="Default" placeholder="Type here" value={value()} onInput={onInput} />
      <Input label="With helper" helperText="This is a hint" placeholder="Your email" />
      <Input label="Error" error="Invalid value" placeholder="Something" />
    </div>
  );
}
