import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,tsx,js,ts}",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@/components": path.resolve(__dirname, "./components"),
      "@/entities": path.resolve(__dirname, "./entities"),
      "@/utils": path.resolve(__dirname, "./utils"),
    },
  },
  esbuild: {
    loader: "jsx",
    include: /.*\.(jsx|js|tsx|ts)$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
        ".jsx": "jsx",
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
