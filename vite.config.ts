import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    "process.env": {
      VITE_YAHOO_FINANCE_API_KEY: JSON.stringify(
        process.env.VITE_YAHOO_FINANCE_API_KEY
      ),
      VITE_POLYGON_API_KEY: JSON.stringify(process.env.VITE_POLYGON_API_KEY),
    },
  },
});
