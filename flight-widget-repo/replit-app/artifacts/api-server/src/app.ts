import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { fileURLToPath } from "node:url";
import path from "node:path";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// A single-service production option; managed Replit previews route the
// frontend and API separately and do not enable this.
if (process.env.SERVE_WEB === "true") {
  const webDir = fileURLToPath(new URL("../../flight-widget/dist/public/", import.meta.url));
  app.use(express.static(webDir));
  app.get("/{*path}", (req, res) => {
    if (req.path.startsWith("/api/")) {
      res.status(404).json({ error: "API route not found." });
      return;
    }
    res.sendFile(path.join(webDir, "index.html"));
  });
}

export default app;
