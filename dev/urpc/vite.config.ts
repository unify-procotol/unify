import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ command, mode }) => {
  const htmlFile = process.env.VITE_ENTRY || "indexeddb.html";

  return {
    server: {
      port: htmlFile === "localstorage.html" ? 3001 : 3000,
      open: true,
    },
    build: {
      target: "es2022",
      rollupOptions: {
        input: {
          main: resolve(__dirname, htmlFile),
        },
      },
    },
  };
});
