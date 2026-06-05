import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { setupAuth } from "./auth";
import { errorHandler } from "./middlewares/error";
import { ensureAuthTables } from "./lib/initDb";
import pathModule from "path";
import { fileURLToPath as futp } from "url";

export async function createApp(): Promise<Express> {
  await ensureAuthTables();

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
          return { statusCode: res.statusCode };
        },
      },
    }),
  );
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await setupAuth(app);

  app.use("/api", router);

  // Serve frontend static files
  const __dirnameFe = pathModule.dirname(futp(import.meta.url));
  const frontendDist = pathModule.resolve(__dirnameFe, "../../nutricare/dist/public");
  app.use(express.static(frontendDist));
  app.get(".*", (_req, res) => {
    res.sendFile(pathModule.join(frontendDist, "index.html"));
  });

  app.use(errorHandler);

  return app;
}
