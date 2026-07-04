"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { ClipboardPaste, Copy, Eraser, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/cn";
import { ACCEPT_ATTRIBUTE } from "../../find-replace/constants";
import {
  readTextFile,
  useFileDrop,
} from "../../find-replace/hooks/use-file-drop";

const TEXTAREA_CLASSES =
  "w-full h-full resize-none border-0 bg-transparent p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words focus-visible:outline-none focus-visible focus:bg-inherit/50 transition-colors duration-200 ";

function PanelAction({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function countLines(text: string): number {
  if (text === "") return 0;
  let lines = 1;
  for (let index = 0; index < text.length; index += 1) {
    if (text.charCodeAt(index) === 10) lines += 1;
  }
  return lines;
}

async function copyToClipboard(text: string, subject: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${subject} copied to clipboard`);
  } catch {
    toast.error("Clipboard access was denied");
  }
}

type Props = {
  label: string;
  value: string;
  onChange: (text: string) => void;
};

export function TextPanel({ label, value, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { dragging, dropProps } = useFileDrop((result) => {
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onChange(result.content);
    toast.success(`Loaded "${result.name}"`);
  });

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (text === "") {
        toast.info("Clipboard is empty");
        return;
      }
      onChange(text);
      toast.success("Pasted from clipboard");
    } catch {
      toast.error("Clipboard access was denied");
    }
  }

  return (
    <section
      aria-label={label}
      className="relative flex min-w-0 flex-col"
      {...dropProps}
    >
      <header className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
        <h3 className="text-xs font-medium text-muted-foreground">{label}</h3>
        <div className="flex items-center gap-0.5">
          <PanelAction
            label="Paste from clipboard"
            onClick={() => void pasteFromClipboard()}
          >
            <ClipboardPaste aria-hidden className="size-3.5" />
          </PanelAction>
          <PanelAction
            label="Upload a text file"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload aria-hidden className="size-3.5" />
          </PanelAction>
          <PanelAction
            label={`Copy ${label.toLowerCase()}`}
            disabled={value === ""}
            onClick={() => void copyToClipboard(value, label)}
          >
            <Copy aria-hidden className="size-3.5" />
          </PanelAction>
          <PanelAction
            label={`Clear ${label.toLowerCase()}`}
            disabled={value === ""}
            onClick={() => onChange("")}
          >
            <Eraser aria-hidden className="size-3.5" />
          </PanelAction>
        </div>
      </header>

      <div className="relative h-64 md:h-80 grow">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          placeholder="Paste text here, drop a file, or use the paste button above…"
          spellCheck={false}
          className={cn(TEXTAREA_CLASSES, "absolute inset-0")}
        />
        {dragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-brand-400 bg-background/80">
            <p className="text-sm text-foreground">Drop file to load it</p>
          </div>
        )}
      </div>

      <footer className="flex items-center justify-between border-t border-border/50 px-3 py-1 text-xs tabular-nums text-muted-foreground">
        <span>
          {value.length.toLocaleString()} chars ·{" "}
          {countLines(value).toLocaleString()} lines
        </span>
      </footer>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="sr-only"
        aria-label={`Upload a text file into ${label}`}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void readTextFile(file).then((result) => {
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              onChange(result.content);
              toast.success(`Loaded "${result.name}"`);
            });
          }
          event.target.value = "";
        }}
      />
    </section>
  );
}
