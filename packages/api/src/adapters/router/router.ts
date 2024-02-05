import { HttpStatusCode } from "axios";
import { ApiConfig } from "../../domain/entities/config.entity";
import express, { type Router, type Response } from "express";
import { photoController } from "../controllers/photos.controller";
import { AppDependencies } from "../../domain/entities/app.entity";
import { LoggerUtils } from "../../utils/logger.utils";
import { apiKeyMiddleware } from "../middleware/photos.middleware";

export const RouterDefinition = (
  apiConfig: ApiConfig,
  logger: LoggerUtils,
  appDependencies: AppDependencies
): Router => {
  const router: Router = express.Router();
  router.get("/ping", (_, res: Response) => {
    res.send("PONG!");
  });

  router.get("/health-check", (_, res: Response) => {
    res.status(HttpStatusCode.Ok).json({ uptime: process.uptime() });
  });

  // v1
  // /external-api/photos
  router.get(
    "/external-api/photos",
    (req, res, next) => apiKeyMiddleware(req, res, next, apiConfig),
    async (req, res) =>
      photoController(req, res, logger, appDependencies.photoService)
  );
  // /external-api/photos/:photoId
  router.get("/external-api/photos/:photoId",
    (req, res, next) => apiKeyMiddleware(req, res, next, apiConfig),
    async (req, res) =>
      photoController(req, res, logger, appDependencies.photoService)
  );
  router.use('/v1', router);

  // Add 404 status if nothing matches with the definitions
  router.use((_, res: Response) => {
    res.status(HttpStatusCode.NotFound).json({ error: "Resource not Found" });
  });

  return router;
};
