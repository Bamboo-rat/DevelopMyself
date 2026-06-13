import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

function chromeDevToolsProbe(): Plugin {
  return {
    name: "chrome-devtools-probe",
    configureServer(server) {
      server.middlewares.use(
        "/.well-known/appspecific/com.chrome.devtools.json",
        (_request, response) => {
          response.statusCode = 200;
          response.setHeader("Content-Type", "application/json");
          response.end("{}");
        }
      );
    },
  };
}

export default defineConfig({
  plugins: [chromeDevToolsProbe(), tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    // Prisma client được generate dạng CJS — cần external để Node.js require() thay vì Vite bundle
    external: [
      "@prisma/client",
      ".prisma/client",
      "@neondatabase/serverless",
      "@prisma/adapter-neon",
      "bcryptjs",
      "cloudinary",
      "cookie",
    ],
  },
  optimizeDeps: {
    exclude: ["@prisma/client", ".prisma/client"],
  },
});
