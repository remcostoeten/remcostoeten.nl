import { defineConfig } from "@solidjs/start/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    preset: "bun"
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
