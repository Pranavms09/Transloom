import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        billing: resolve(__dirname, "billing.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
        glossary: resolve(__dirname, "glossary.html"),
        memory: resolve(__dirname, "memory.html"),
        projects: resolve(__dirname, "projects.html"),
        register: resolve(__dirname, "register.html"),
        review: resolve(__dirname, "review.html"),
        settings: resolve(__dirname, "settings.html"),
        validation: resolve(__dirname, "validation.html"),
        workspace: resolve(__dirname, "workspace.html"),
      },
    },
  },
});
