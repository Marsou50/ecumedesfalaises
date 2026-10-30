import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // Chemins relatifs : le build single-file fonctionne aussi sur GitHub Pages.
  base: "./",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  // Le serveur de prévisualisation est proxifié derrière un domaine
  // dynamique : on autorise les hôtes externes et on écoute sur 0.0.0.0.
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: true,
    port: 4173,
  },
});
