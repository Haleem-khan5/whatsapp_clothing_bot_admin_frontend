import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
// Removed lovable-tagger to eliminate Lovable branding in dev builds

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Load .env from frontend dir if present; otherwise, fall back to parent repo root
  envDir: (() => {
    const local = __dirname;
    const parent = path.resolve(__dirname, "..");
    const candidates = [
      ".env",
      ".env.local",
      `.env.${mode}`,
      `.env.${mode}.local`,
    ];
    const hasLocal = candidates.some((name) => fs.existsSync(path.join(local, name)));
    return hasLocal ? local : parent;
  })(),
  server: {
    host: "::",
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  preview: {
    host: "::", // listen on all interfaces
    port: 3000,
    // Allow Render preview host(s)
    allowedHosts: [
      /\\.onrender\\.com$/,
      "whatsapp-clothing-bot-admin-frontend.onrender.com",
    ],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
