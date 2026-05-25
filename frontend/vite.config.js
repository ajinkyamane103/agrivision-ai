import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": { target: "https://agrivision-backend-production-ea30.up.railway.app", changeOrigin: true },
    },
  },
  build: { outDir: "dist", sourcemap: false },
});
