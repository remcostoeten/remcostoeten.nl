import { Textarea } from "~/components/primitives/textarea";
import { createSignal } from "solid-js";

export function TextareaDemo() {
  const [value, setValue] = createSignal("");

  function onInput(
    e: InputEvent & { currentTarget: HTMLTextAreaElement; target: HTMLTextAreaElement },
  ) {
    setValue(e.currentTarget.value);
  }

  return (
    <div class="space-y-4">
      <Textarea label="Default" placeholder="Write something" value={value()} onInput={onInput} />
      <Textarea label="Autosize" placeholder="This grows with content" autosize minRows={3} />
      <Textarea label="With helper" helperText="Max 120 chars" maxLength={120} />
      <Textarea label="Error" error="Description required" />
    </div>
  );
}
