import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // sem outDir customizado → vai para "dist" por padrão
  plugins: [react()],
})
