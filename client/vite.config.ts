import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // Crucial for Docker Hot Reload on some systems
    },
    host: true, // Needed for the Docker Container port mapping to work
    strictPort: true,
    port: 5173,
  },
});
