import { Button } from "~/components/primitives/button";
import { createSignal, For } from "solid-js";

export function ButtonDemo() {
  const [loading, setLoading] = createSignal(false);

  function toggleLoading() {
    setLoading(!loading());
  }

  return (
    <div class="space-y-3">
      <div class="flex flex-wrap gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <For each={["sm", "md", "lg"] as const}>
          {function (s) {
            return <Button size={s}>Size: {s}</Button>;
          }}
        </For>
      </div>

      <div class="flex items-center gap-2">
        <Button loading={loading()} onClick={toggleLoading}>
          Toggle Loading
        </Button>
      </div>
    </div>
  );
}
