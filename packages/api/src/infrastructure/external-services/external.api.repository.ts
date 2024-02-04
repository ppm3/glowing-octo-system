import { LocalCacheService } from "../cache/local.cache.service";
import { LocalCacheConfig } from "../../domain/entities/config.entity";
import { ExternalApiService } from "../external-api/external.api.service";
import {
    AlbumResponse,
    PhotoResponse,
    UserResponse,
} from "../../domain/entities/jsonplaceholder.entity";
import { LoggerUtils } from "../../utils/logger.utils";
import { DataEntries } from "../../domain/entities/app.entity";

export class ExternalApiRepository {
    private cacheTime: string = "cacheTime";
    constructor(
        private readonly externalApiService: ExternalApiService,
        private readonly localCacheService: LocalCacheService,
        private readonly localCacheConfig: LocalCacheConfig,
        private readonly logger: LoggerUtils
    ) { }

    async evaluate(
        key: DataEntries
    ): Promise<PhotoResponse[] | AlbumResponse[] | UserResponse[] | undefined> {
        if (this.localCacheConfig.enabled) {
            return await this.cache(key);
        }

        return await this.extractApiData(key);
    }

    async cache(
        key: DataEntries
    ): Promise<PhotoResponse[] | AlbumResponse[] | UserResponse[] | undefined> {
        if (await this.needRecovery()) {
            const payload = await this.extractApiData(key);
            await this.localCacheService.writeTmpFile(key, JSON.stringify(payload));
            return payload;
        }

        // extract cache
        const cache = await this.localCacheService.readTmpFile(key);
        if (!cache) {
            this.logger.debug("Cache not found");
            const payload = await this.extractApiData(key);
            await this.localCacheService.writeTmpFile(key, JSON.stringify(payload));
            return payload;
        }

        const payload = JSON.parse(cache);
        const responseType = this.responseType(key);
        return payload as unknown as typeof responseType;
    }

    async extractApiData(key: DataEntries): Promise<PhotoResponse[] | AlbumResponse[] | UserResponse[]> {
        return await this.externalApiService.extract(key, this.responseType(key));
    }

    private responseType(key: DataEntries): PhotoResponse[] | AlbumResponse[] | UserResponse[] {
        switch (key) {
            case "photos":
                return {} as PhotoResponse[];
            case "albums":
                return {} as AlbumResponse[];
            default:
                return {} as UserResponse[];
        }
    }

    async needRecovery(): Promise<boolean> {
        const cacheTime = await this.localCacheService.readTmpFile(this.cacheTime);
        const unixTime = Math.floor(new Date().getTime() / 1000);
        const expiryTime = unixTime + this.localCacheConfig.ttl;

        if (!cacheTime) {
            // cache time not found, need to recovery cache.
            this.logger.debug("cache time not found, it generated a new one.");
            await this.localCacheService.checkAndCreateFile(
                this.cacheTime,
                JSON.stringify({ ttl: expiryTime })
            );
            return true;
        }
        const controlTime = JSON.parse(cacheTime);
        if (unixTime > controlTime["ttl"]) {
            // cache time expired, need to recovery cache.
            this.logger.debug("Cache time expired", expiryTime);
            await this.localCacheService.deleteFiles();
            await this.localCacheService.writeTmpFile(
                this.cacheTime,
                JSON.stringify({ ttl: expiryTime })
            );
            this.logger.warn("cache time expired", expiryTime);
            return true;
        }
        this.logger.info("cache time not expired");
        return false;

    }
}
