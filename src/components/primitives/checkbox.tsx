import { JSX } from "solid-js";

type TCheckboxProps = {
  id: string;
  name: string;
  checked: boolean;
  onInput: (e: Event) => void;
  label: string;
  class?: string;
};

export function Checkbox(props: TCheckboxProps): JSX.Element {
  return (
    <div class="flex items-center">
      <input
        id={props.id}
        name={props.name}
        type="checkbox"
        class={`h-4 w-4 text-accent focus:ring-accent border-border rounded ${props.class || ""}`}
        checked={props.checked}
        onInput={props.onInput}
      />
      <label for={props.id} class="ml-2 block text-sm text-muted-foreground">
        {props.label}
      </label>
    </div>
  );
}
