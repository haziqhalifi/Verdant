import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@verdant/shared": fileURLToPath(new URL("../shared/src/index.ts", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
