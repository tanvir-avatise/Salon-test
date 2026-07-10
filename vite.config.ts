import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// Served under a repo subpath on GitHub Pages (…github.io/Salon-test/), so the
// production build is based at "/Salon-test/". Local dev stays at root.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/Salon-test/" : "/",
  plugins: [react()],
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1200,
  },
}));
