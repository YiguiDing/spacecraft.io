import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
    
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@common": path.resolve(__dirname, "../common"),
    },
  },
  build: {
    lib: {
      name: "Spacecraft",
      formats: ["es"],
      entry: "./src/index.ts",
      fileName: "index",
    },
    rollupOptions: {
      external: ["vue"],
    },
  },
  plugins: [vue()],
});
