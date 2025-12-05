/**
 * Language Icon Components
 * Real programming language icons from react-icons library
 */

import type { ComponentType } from "react";
import { IconType } from "react-icons";

// Import actual programming language icons from various react-icons sets
import {
  SiTypescript,
  SiJavascript,
  SiPython,
  SiRust,
  SiReact,
  SiGo,
  SiPhp,
  SiCss3,
  SiHtml5,
  SiYaml,
  SiGnubash,
  SiCplusplus,
  SiSwift,
  SiKotlin,
  SiDart,
  SiRuby,
  SiElixir,
  SiHaskell,
  SiScala,
  SiClojure,
  SiLua,
  SiPerl,
  SiR,
  SiJulia,
  SiMarkdown,
  SiDocker,
  SiVim,
  SiSqlite,
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiNginx,
  SiApache,
  SiRedis,
  SiElasticsearch,
  SiSass,
  SiLess,
  SiStylus,
  SiTailwindcss,
  SiBootstrap,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiNextdotjs,
  SiNuxtdotjs,
  SiNodedotjs,
  SiExpress,
  SiFastapi,
  SiFlask,
  SiDjango,
  SiSpring,
  SiLaravel,
  SiRubyonrails,
  SiGraphql,
  SiPrisma,
} from "react-icons/si";

import {
  DiTerminal,
} from "react-icons/di";

import {
  VscCode,
  VscJson,
  VscFileCode,
} from "react-icons/vsc";

import {
  FaCode,
} from "react-icons/fa";

type TIconProps = {
  className?: string;
  size?: number;
};

// Language icon mapping using real react-icons
type TLanguageIconMap = {
  [key: string]: IconType;
};

export const LANGUAGE_ICONS: TLanguageIconMap = {
  // Core languages
  typescript: SiTypescript,
  javascript: SiJavascript,
  python: SiPython,
  java: FaCode, // Java icon not available, using fallback
  csharp: FaCode, // C# icon not available, using fallback
  "c#": FaCode,
  cpp: SiCplusplus,
  "c++": SiCplusplus,
  c: SiCplusplus,
  rust: SiRust,
  go: SiGo,
  golang: SiGo,
  swift: SiSwift,
  kotlin: SiKotlin,
  dart: SiDart,
  php: SiPhp,
  ruby: SiRuby,
  elixir: SiElixir,
  haskell: SiHaskell,
  scala: SiScala,
  clojure: SiClojure,
  lua: SiLua,
  perl: SiPerl,
  r: SiR,
  julia: SiJulia,
  matlab: FaCode, // Matlab icon not available, using fallback
  
  // Web technologies
  html: SiHtml5,
  html5: SiHtml5,
  css: SiCss3,
  css3: SiCss3,
  scss: SiSass,
  sass: SiSass,
  less: SiLess,
  stylus: SiStylus,
  
  // Frontend frameworks
  react: SiReact,
  jsx: SiReact,
  tsx: SiReact,
  vue: SiVuedotjs,
  vuejs: SiVuedotjs,
  angular: SiAngular,
  svelte: SiSvelte,
  nextjs: SiNextdotjs,
  "next.js": SiNextdotjs,
  nuxtjs: SiNuxtdotjs,
  "nuxt.js": SiNuxtdotjs,
  
  // CSS frameworks
  tailwind: SiTailwindcss,
  tailwindcss: SiTailwindcss,
  bootstrap: SiBootstrap,
  
  // Backend & Runtime
  nodejs: SiNodedotjs,
  "node.js": SiNodedotjs,
  express: SiExpress,
  expressjs: SiExpress,
  fastapi: SiFastapi,
  flask: SiFlask,
  django: SiDjango,
  spring: SiSpring,
  springboot: SiSpring,
  laravel: SiLaravel,
  rails: SiRubyonrails,
  "ruby-on-rails": SiRubyonrails,
  
  // Data formats
  json: VscJson,
  yaml: SiYaml,
  yml: SiYaml,
  xml: VscFileCode,
  
  // Databases
  sql: SiSqlite,
  sqlite: SiSqlite,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  mysql: SiMysql,
  mongodb: SiMongodb,
  mongo: SiMongodb,
  redis: SiRedis,
  elasticsearch: SiElasticsearch,
  
  // DevOps & Tools
  docker: SiDocker,
  dockerfile: SiDocker,
  nginx: SiNginx,
  apache: SiApache,
  
  // Shell & Terminal
  bash: SiGnubash,
  shell: SiGnubash,
  sh: SiGnubash,
  zsh: DiTerminal,
  fish: DiTerminal,
  powershell: DiTerminal, // PowerShell icon not available, using terminal fallback
  ps1: DiTerminal,
  
  // Other
  markdown: SiMarkdown,
  md: SiMarkdown,
  vim: SiVim,
  viml: SiVim,
  graphql: SiGraphql,
  gql: SiGraphql,
  prisma: SiPrisma,
  
  // Fallback
  default: FaCode,
} as const;

// Helper function to get icon component for a language
export function getLanguageIcon(language: string): IconType {
  const normalizedLanguage = language.toLowerCase().trim();
  return LANGUAGE_ICONS[normalizedLanguage] || LANGUAGE_ICONS.default;
}
