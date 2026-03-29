import { rehypeExtractCodeMeta } from "@/lib/rehype-extract-code-meta";
import { ArrowUpRight } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "../ui/code-block";
import {
  Notice,
  NoticeAlert,
  NoticeInfo,
  NoticeNeutral,
  NoticeRegular,
  NoticeSuccess,
  NoticeWarning,
} from "../ui/notice";
import { CollapsibleMedia } from "./collapsible-media";
import { SpotifyApiExplorer } from "./spotify-api-explorer";
import { SpotifyEnvGenerator } from "./spotify-env-generator";
import { UseShortcutDemo } from "./use-shortcut-demo";
import { UseShortcutSyntaxLab } from "./use-shortcut-syntax-lab";

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ));
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function CustomLink(props) {
  let href = props.href;
  const isGithubLink =
    typeof href === "string" &&
    (href.includes("github.com/") || href.includes("raw.githubusercontent.com/"));

  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return <a {...props} />;
  }

  if (isGithubLink) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        {...props}
        className="group inline-flex items-center gap-1.5"
      >
        <span>{props.children}</span>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-55 transition-all duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
      </a>
    );
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />;
}

function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-none" {...props} />;
}

function Video({ src, ...props }: { src: string; [key: string]: any }) {
  return (
    <video
      src={src}
      controls
      preload="metadata"
      className="rounded-lg w-full max-w-2xl"
      {...props}
    >
      Your browser does not support the video tag.
    </video>
  );
}

function extractTextContent(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractTextContent).join("");
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractTextContent(node.props.children);
  }

  return "";
}

function slugify(value: unknown): string {
  const text =
    typeof value === "string"
      ? value
      : extractTextContent(value as React.ReactNode);

  if (!text) {
    return "heading";
  }

  return text
    .toLowerCase()
    .trim()
    .replace(/\\([_*`[\](){}#+.!-])/g, "$1")
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

/**
 * Full-width section header for blog h2 headings
 * Uses landing page section style but with blog-appropriate typography
 */
function BlogSectionHeading({ children }: { children: React.ReactNode }) {
  if (!children) {
    return <h2>Heading</h2>;
  }

  const slug = slugify(children);

  return (
    <h2
      id={slug}
      className="text-xl font-semibold text-foreground mt-10 mb-4 first:mt-0 pb-2 border-b border-border/50"
    >
      <a href={`#${slug}`} className="anchor" aria-hidden="true" />
      {children}
    </h2>
  );
}

function createHeading(level: number) {
  // h2 uses the full-width section header style
  if (level === 2) {
    return BlogSectionHeading;
  }

  const Heading = ({ children }: { children: React.ReactNode }) => {
    if (!children) {
      return React.createElement(`h${level}`, {}, "Heading");
    }

    let slug = slugify(children);
    return React.createElement(
      `h${level}`,
      {
        id: slug,
        className: level === 3 ? "text-lg font-medium mt-8 mb-3" : undefined,
      },
      [
        React.createElement("a", {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: "anchor",
          "aria-hidden": true,
        }),
      ],
      children,
    );
  };

  Heading.displayName = `Heading${level}`;

  return Heading;
}

function normalizeCodeBlockInfo(
  className?: string,
  metastring?: string,
  code?: string,
) {
  const languageClass = className
    ?.split(" ")
    .find((token) => token.startsWith("language-"));
  const rawLanguage = languageClass?.replace("language-", "").trim() || "";
  const [languageCandidate, fileNameFromLanguage] = rawLanguage.includes(":")
    ? rawLanguage.split(":", 2)
    : [rawLanguage, undefined];

  const normalizedLanguageMap: Record<string, string> = {
    yml: "yaml",
    "docker-compose": "yaml",
    "docker-compose.yml": "yaml",
    "docker-compose.yaml": "yaml",
    "compose.yml": "yaml",
    "compose.yaml": "yaml",
  };

  const normalizedLanguage =
    normalizedLanguageMap[languageCandidate.toLowerCase()] ||
    languageCandidate.toLowerCase() ||
    "text";

  const inferredFrontmatterYaml =
    (normalizedLanguage === "text" || !normalizedLanguage) &&
    typeof code === "string" &&
    code.trimStart().startsWith("---") &&
    /frontmatter/i.test(metastring || "");

  return {
    language: inferredFrontmatterYaml ? "yaml" : normalizedLanguage,
    fileNameFromLanguage,
  };
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  Video,
  CollapsibleMedia,

  // BtwfyiDemo,
  a: CustomLink,
  Notice,
  NoticeAlert,
  NoticeWarning,
  NoticeSuccess,
  NoticeInfo,
  NoticeNeutral,
  NoticeRegular,
  SpotifyEnvGenerator,
  SpotifyApiExplorer,
  UseShortcutDemo,
  UseShortcutSyntaxLab,
  code: ({ children, ...props }) => {
    // Check if this is inline code (not inside a pre block)
    const isInline = !props.className?.includes("language-");
    if (isInline) {
      // Remove any backtick artifacts from inline code
      const content =
        typeof children === "string"
          ? children.replace(/^`|`$/g, "")
          : children;
      return (
        <code
          className="rounded-md border border-border/50 bg-muted/60 px-1.5 py-0.5 text-sm font-mono break-words"
          {...props}
        >
          {content}
        </code>
      );
    }
    return <code {...props}>{children}</code>;
  },
  pre: ({ children, ...props }) => {
    const codeElement = children as React.ReactElement<any>;
    const code = codeElement?.props?.children || "";
    const className = codeElement?.props?.className || "";
    const metastring = codeElement?.props?.metastring || "";
    const { language, fileNameFromLanguage } = normalizeCodeBlockInfo(
      className,
      metastring,
      code,
    );

    // Support both single and double quotes for filename and title
    const fileNameMatch = metastring.match(/filename=["']([^"']+)["']/);
    const titleMatch = metastring.match(/title=["']([^"']+)["']/);
    const fileName = fileNameMatch
      ? fileNameMatch[1]
      : titleMatch
        ? titleMatch[1]
        : fileNameFromLanguage;

    // Extract variant
    const variantMatch = metastring.match(/variant=["']([^"']+)["']/);
    const variant = variantMatch
      ? (variantMatch[1] as "default" | "sharp")
      : undefined;

    const startingLineNumberMatch = metastring.match(/start=["'](\d+)["']/);
    const startingLineNumber = startingLineNumberMatch
      ? Number(startingLineNumberMatch[1])
      : 1;

    const highlightMatch = metastring.match(/\{([\d,-]+)\}/);
    const highlightLines = highlightMatch
      ? highlightMatch[1].split(",").flatMap((v) => {
          if (v.includes("-")) {
            const [start, end] = v.split("-").map(Number);
            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
          }
          return [Number(v)];
        })
      : [];

    return (
      <CodeBlock
        code={code}
        language={language}
        fileName={fileName}
        disableTopBar={!fileName}
        highlightLines={highlightLines}
        startingLineNumber={startingLineNumber}
        variant={variant}
        {...props}
      />
    );
  },
  Table,
  CodeBlock,
};

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeExtractCodeMeta],
        },
      }}
    />
  );
}
