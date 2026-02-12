import { HeroPill } from "@/components/ui/hero-pill"
import { PillShowcase } from "@/components/ui/pill-showcase"
import { GooeyToggle, GooeyFilter } from "@/components/ui/gooey-toggle"
import type { ComponentRegistration, Category } from "./types"

export const CATEGORIES: Category[] = [
  {
    slug: "ui",
    label: "UI",
    description: "Interface components and explorations",
    icon: "Layers",
  },
  {
    slug: "code-snippets",
    label: "Code Snippets",
    description: "Reusable code patterns and utilities",
    icon: "Code",
    disabled: true,
  },
  {
    slug: "package-builds",
    label: "Package Builds",
    description: "NPM packages and library prototypes",
    icon: "Package",
    disabled: true,
  },
  {
    slug: "cli-tools",
    label: "CLI Tools",
    description: "Command line utilities and scripts",
    icon: "Terminal",
    disabled: true,
  },
]

export const COMPONENT_REGISTRY: ComponentRegistration[] = [
  {
    slug: "hero-pill",
    name: "HeroPill",
    description:
      "A pill component with icon micro-interactions, variant styles, and ghost behavior",
    category: "ui",
    component: HeroPill as ComponentRegistration["component"],
    showcaseComponent: PillShowcase,
    props: [
      {
        name: "text",
        label: "Text",
        type: "string",
        defaultValue: "Hello World",
        placeholder: "Pill text content",
        required: true,
      },
      {
        name: "variant",
        label: "Variant",
        type: "enum",
        defaultValue: "default",
        options: [
          { value: "default", label: "Default" },
          { value: "outline", label: "Outline" },
          { value: "ghost", label: "Ghost" },
          { value: "glow", label: "Glow" },
        ],
      },
      {
        name: "animate",
        label: "Animate",
        description: "Enable slide-up-fade entrance animation",
        type: "boolean",
        defaultValue: false,
      },
      {
        name: "icon",
        label: "Icon",
        description: "Optional leading icon",
        type: "icon",
        defaultValue: null,
      },
      {
        name: "className",
        label: "Class Name",
        description: "Additional Tailwind classes",
        type: "string",
        defaultValue: "",
        placeholder: "e.g. opacity-80",
      },
    ],
    behaviors: [
      {
        name: "ghostBehavior",
        label: "Ghost Behavior",
        description: "Controls automatic ghost state transitions",
        type: "enum",
        defaultValue: "never",
        options: [
          { value: "never", label: "Never" },
          { value: "always", label: "Always Ghost" },
          { value: "idle", label: "Ghost on Idle" },
        ],
        dependsOn: { behavior: "variant", value: "ghost", source: "prop" },
      },
      {
        name: "ghostIdleMs",
        label: "Idle Timeout (ms)",
        description: "Milliseconds of inactivity before ghosting",
        type: "number",
        defaultValue: 3000,
        min: 500,
        max: 10000,
        step: 250,
        dependsOn: { behavior: "ghostBehavior", value: "idle" },
      },
      {
        name: "href",
        label: "Link URL",
        description: "Navigate to URL on click",
        type: "string",
        defaultValue: "",
        placeholder: "https://example.com",
      },
      {
        name: "linkTarget",
        label: "Link Target",
        type: "enum",
        defaultValue: "_self",
        options: [
          { value: "_self", label: "Same Window" },
          { value: "_blank", label: "New Tab" },
        ],
        dependsOn: { behavior: "href", notValue: "" },
      },
    ],
    animations: [],
    previewProps: {
      text: "Preview",
      variant: "default",
      animate: false,
    },
  },
  {
    slug: "gooey-toggle",
    name: "GooeyToggle",
    description:
      "A gooey SVG toggle switch with liquid morph animation and color variants",
    category: "ui",
    component: GooeyToggle as ComponentRegistration["component"],
    previewExtras: GooeyFilter,
    props: [
      {
        name: "checked",
        label: "Checked",
        description: "Toggle state",
        type: "boolean",
        defaultValue: false,
      },
      {
        name: "variant",
        label: "Variant",
        type: "enum",
        defaultValue: "default",
        options: [
          { value: "default", label: "Default" },
          { value: "success", label: "Success" },
          { value: "warning", label: "Warning" },
          { value: "danger", label: "Danger" },
        ],
      },
      {
        name: "disabled",
        label: "Disabled",
        description: "Disable interaction",
        type: "boolean",
        defaultValue: false,
      },
      {
        name: "className",
        label: "Class Name",
        description: "Additional Tailwind classes",
        type: "string",
        defaultValue: "",
        placeholder: "e.g. scale-150",
      },
    ],
    behaviors: [],
    animations: [
      {
        name: "scale-in",
        label: "Scale In",
        keyframes: {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        duration: 400,
        timingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        iterationCount: 1,
      },
      {
        name: "wobble",
        label: "Wobble",
        keyframes: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-3deg)" },
          "75%": { transform: "rotate(3deg)" },
        },
        duration: 600,
        timingFunction: "ease-in-out",
        iterationCount: 1,
      },
      {
        name: "pulse-glow",
        label: "Pulse Glow",
        keyframes: {
          "0%, 100%": { filter: "brightness(1) drop-shadow(0 0 0px transparent)" },
          "50%": { filter: "brightness(1.2) drop-shadow(0 0 8px hsl(142 71% 45% / 0.4))" },
        },
        duration: 2000,
        timingFunction: "ease-in-out",
        iterationCount: "infinite",
      },
    ],
    previewProps: {
      checked: false,
      variant: "default",
    },
  },
]

export function getComponentBySlug(
  slug: string
): ComponentRegistration | undefined {
  return COMPONENT_REGISTRY.find((c) => c.slug === slug)
}

export function getComponentsByCategory(
  category: string
): ComponentRegistration[] {
  return COMPONENT_REGISTRY.filter((c) => c.category === category)
}
