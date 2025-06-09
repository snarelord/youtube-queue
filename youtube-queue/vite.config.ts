import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

export default defineConfig({
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"), // ← FIX HERE
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "src/popup.html"),
        content: path.resolve(__dirname, "src/content.ts"),
        background: path.resolve(__dirname, "src/background.ts"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [{ src: "manifest.json", dest: "." }],
    }),
  ],
});
