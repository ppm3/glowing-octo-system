import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import { HttpStatusCode } from "axios";
import { config } from "./config/service.config";
import { HttpRequest } from "./utils/http.utils";
import { RouterDefinition } from "./adapters/router/router";
import { AppDependencies } from "./domain/entities/app.entity";
import { PhotoService } from "./application/services/photo.service";
import { LocalCacheService } from "./infrastructure/cache/local.cache.service";
import { ApiConfig, ConfigParams } from "./domain/entities/config.entity";
import { PhotoRepository } from "./application/services/photo.repository";
import { ExternalApiService } from "./infrastructure/external-api/external.api.service";
import { ExternalApiRepository } from "./infrastructure/external-services/external.api.repository";
import { LoggerUtils } from "./utils/logger.utils";

const app: Express = express();

app.use(cors());

const configParams: ConfigParams = config;
const apiConfig: ApiConfig = configParams.api;
const PORT: string | number = apiConfig.port;

const logger = new LoggerUtils(configParams.api.logLevel);

// initialization dependencies
const photoService = new PhotoService(
  new PhotoRepository(
    new ExternalApiRepository(
      new ExternalApiService(
        new HttpRequest(),
        configParams.externalSource,
        logger
      ),
      new LocalCacheService(configParams.localCache, logger),
      configParams.localCache,
      logger
    ),
    logger
  ),
  logger
);

// add routes
app.use(
  RouterDefinition(apiConfig, logger, { photoService } as AppDependencies)
);

// add 500 if error is thrown
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  res
    .status(HttpStatusCode.InternalServerError)
    .json({ error: "Internal Server Error" });
  next(err);
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
