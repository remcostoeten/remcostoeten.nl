import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const asyncHooksShim = resolve(__dirname, "src/shims/async_hooks.ts");

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "node:async_hooks": asyncHooksShim,
      },
    },
  },
  server: {
    preset: "vercel",
  },
});
