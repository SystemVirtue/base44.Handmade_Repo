import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@/components": path.resolve(__dirname, "./Components"),
      "@/entities": path.resolve(__dirname, "./Entities"),
      "@/utils": path.resolve(__dirname, "./utils"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
