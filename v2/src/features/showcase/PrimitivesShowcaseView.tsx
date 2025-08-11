import { lazy, Suspense } from "solid-js";

function loadButtonDemo() {
  return import("./demos/ButtonDemo").then(function (m) {
    return { default: m.ButtonDemo };
  });
}
function loadInputDemo() {
  return import("./demos/InputDemo").then(function (m) {
    return { default: m.InputDemo };
  });
}
function loadTextareaDemo() {
  return import("./demos/TextareaDemo").then(function (m) {
    return { default: m.TextareaDemo };
  });
}
function loadCheckboxDemo() {
  return import("./demos/CheckboxDemo").then(function (m) {
    return { default: m.CheckboxDemo };
  });
}
function loadDashedHighlightDemo() {
  return import("./demos/DashedHighlightDemo").then(function (m) {
    return { default: m.DashedHighlightDemo };
  });
}
function loadArrowLinkDemo() {
  return import("./demos/ArrowLinkDemo").then(function (m) {
    return { default: m.ArrowLinkDemo };
  });
}

const ButtonDemo = lazy(loadButtonDemo);
const InputDemo = lazy(loadInputDemo);
const TextareaDemo = lazy(loadTextareaDemo);
const CheckboxDemo = lazy(loadCheckboxDemo);
const DashedHighlightDemo = lazy(loadDashedHighlightDemo);
const ArrowLinkDemo = lazy(loadArrowLinkDemo);

function SectionTitle(props: { title: string; subtitle?: string }) {
  return (
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-foreground tracking-tight">{props.title}</h2>
      {props.subtitle && <p class="text-sm text-muted-foreground mt-1">{props.subtitle}</p>}
    </div>
  );
}

function Card(props: { title: string; children: any; desc?: string }) {
  return (
    <div class="rounded-lg border border-border bg-card/40 p-4 hover:bg-card/60 transition-colors">
      <div class="mb-3">
        <h3 class="text-sm font-medium text-foreground">{props.title}</h3>
        {props.desc && <p class="text-xs text-muted-foreground mt-1">{props.desc}</p>}
      </div>
      <div class="rounded-md bg-background p-4">
        <Suspense fallback={<div class="text-sm text-muted-foreground">Loading…</div>}>
          {props.children}
        </Suspense>
      </div>
    </div>
  );
}

export function PrimitivesShowcaseView() {
  return (
    <div class="container-centered">
      <header class="mb-10">
        <span class="inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          Feature · Showcase
        </span>
        <h1 class="mt-4 text-3xl font-bold tracking-tight text-foreground">Primitive Components</h1>
        <p class="mt-2 text-muted-foreground">
          A compact, lazy-loaded collection of our foundational UI building blocks.
        </p>
      </header>

      <SectionTitle title="Display & Links" />
      <div class="grid gap-4 sm:grid-cols-2">
        <Card title="DashedHighlight" desc="Animated outline accent for inline text.">
          <DashedHighlightDemo />
        </Card>
        <Card title="ArrowLink" desc="Subtle external link with animated underline.">
          <ArrowLinkDemo />
        </Card>
      </div>

      <SectionTitle title="Inputs" subtitle="Composable, accessible form primitives" />
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Button" desc="Variants, sizes, loading state.">
          <ButtonDemo />
        </Card>
        <Card title="Input" desc="Label, helper, error states.">
          <InputDemo />
        </Card>
        <Card title="Textarea" desc="Autosize, counters, states.">
          <TextareaDemo />
        </Card>
        <Card title="Checkbox" desc="Accessible labeled checkbox.">
          <CheckboxDemo />
        </Card>
      </div>
    </div>
  );
}
