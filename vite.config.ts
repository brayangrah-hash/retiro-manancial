import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  // LINHA OBRIGATÓRIA PARA A CLOUDFLARE NÃO ABORTAR O BUILD:
  plugins: [],
});
