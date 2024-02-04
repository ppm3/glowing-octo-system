import fs from 'fs';
import { tmpdir } from 'os';
import { LoggerUtils } from "../../utils/logger.utils";
import { LocalCacheConfig } from "../../domain/entities/config.entity";

export class LocalCacheService {
    constructor(
        private readonly localCacheConfig: LocalCacheConfig,
        private readonly logger: LoggerUtils
    ) { }

    async createCacheDirectory(): Promise<void> {
        const directoryPath = `${tmpdir()}/${this.localCacheConfig.path}`;
        try {
            await fs.promises.mkdir(directoryPath, { recursive: true });
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
                this.logger.error(err);
                throw err;
            }
        }
    }

    async deleteFiles(): Promise<void> {
        const directoryPath = `${tmpdir()}/${this.localCacheConfig.path}`;
        try {
            await fs.promises.rm(directoryPath, { recursive: true });
        } catch (err) {
            this.logger.error(err);
            throw err;
        }
        await this.createCacheDirectory();
        this.logger.info('Local cache directory deleted');
        return;
    }

    async checkAndCreateFile(key: string, payload: string): Promise<boolean> {
        const filePath = `${tmpdir()}/${this.localCacheConfig.path}/${key}.json`;
        try {
            await fs.promises.open(filePath, 'r');
            return true;
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
                await this.writeTmpFile(key, payload);
                return true;
            } else {
                this.logger.error(err);
                throw err;
            }
        }
    }

    async writeTmpFile(key: string, payload: string): Promise<boolean> {

        const filePath = `${tmpdir()}/${this.localCacheConfig.path}/${key}.json`;
        await this.createCacheDirectory();
        await fs.promises.writeFile(filePath, payload);

        return true;
    }

    async readTmpFile(key: string): Promise<string> {
        const filePath = `${tmpdir()}/${this.localCacheConfig.path}/${key}.json`;
        try {
            return await fs.promises.readFile(filePath, "utf-8");
        } catch (_err) {
            return '';
        }
    }
}
