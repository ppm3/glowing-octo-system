import dotenv from "dotenv";
import {
    ApiConfig,
    ConfigParams,
    ExternalSourceConfig,
    LocalCacheConfig,
} from "../domain/entities/config.entity";

dotenv.config();

export const config = {
    api: {
        port: Number(process.env.API_PORT),
        logLevel: String(process.env.API_LOG_LEVEL || "info"),
        xApiKey: String(process.env.API_X_API_KEY),
    } as ApiConfig,
    externalSource: {
        url: String(process.env.EXTERNAL_API_URL),
        endpoints: {
            users: String(process.env.EXTERNAL_API_USERS_ENDPOINT),
            albums: String(process.env.EXTERNAL_API_ALBUMS_ENDPOINT),
            photos: String(process.env.EXTERNAL_API_PHOTOS_ENDPOINT),
        },
    } as ExternalSourceConfig,
    localCache: {
        enabled: process.env.LOCAL_CACHE_ENABLED === "true",
        ttl: Number(process.env.LOCAL_CACHE_TTL),
        path: String(process.env.LOCAL_CACHE_PATH),
    } as LocalCacheConfig,
} as ConfigParams;
