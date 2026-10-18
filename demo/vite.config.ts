import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "demo",
  server: {
    // Bind IPv4 explicitly: "localhost" can resolve to ::1 and be refused in Chromium.
    host: "127.0.0.1",
  },
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // Pre-bundle up front so the dev server never reloads the page mid-test.
    include: [
      "react",
      "react/jsx-runtime",
      "react-dom/client",
      "react-router-dom",
      "lucide-react",
    ],
  },
  build: {
    outDir: "../dist-demo",
    emptyOutDir: true,
  },
});
