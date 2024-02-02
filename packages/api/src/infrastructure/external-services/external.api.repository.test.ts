import { ExternalApiRepository } from './external.api.repository';
import { LocalCacheConfig } from '@/domain/entities/config.entity';
import { LoggerUtils } from '../../utils/logger.utils';
import { DataEntries } from '../../domain/entities/app.entity';
import { PhotoResponse } from '../../domain/entities/jsonplaceholder.entity';
import { ExternalApiService } from '../external-api/external.api.service';
import { LocalCacheService } from '../cache/local.cache.service';

describe('ExternalApiRepository', () => {
    let externalApiRepository: ExternalApiRepository;
    let externalApiServiceMock: ExternalApiService;
    let localCacheServiceMock: LocalCacheService;
    let localCacheConfig: LocalCacheConfig;


    beforeEach(() => {
        externalApiServiceMock = {} as ExternalApiService;
        localCacheServiceMock = {} as LocalCacheService;
        localCacheConfig = {
            enabled: true,
            path: 'cache',
            ttl: 1,
        } as LocalCacheConfig;

        externalApiRepository = new ExternalApiRepository(
            externalApiServiceMock,
            localCacheServiceMock,
            localCacheConfig,
            new LoggerUtils('test')
        );
    });

    describe('evaluate', () => {
        test('should return data from cache if local cache is enabled', async () => {
            localCacheConfig.enabled = true;
            const key = DataEntries.PHOTOS;
            const cacheData = [{ id: 1, title: 'Photo 1' }, { id: 2, title: 'Photo 2' }];

            localCacheServiceMock.readTmpFile = jest.fn().mockResolvedValue(JSON.stringify(cacheData));
            externalApiServiceMock.extract = jest.fn();

            const result = await externalApiRepository.evaluate(key);

            expect(localCacheServiceMock.readTmpFile).toHaveBeenCalledWith(key);
            expect(externalApiServiceMock.extract).not.toHaveBeenCalled();
            expect(result).toEqual(cacheData);
        });

        test('should extract data from the external API if local cache is disabled', async () => {
            localCacheConfig.enabled = false;
            const key = DataEntries.PHOTOS;
            const apiData = [{ id: 1, title: 'Photo 1' }, { id: 2, title: 'Photo 2' }] as unknown as PhotoResponse[];

            externalApiServiceMock.extract = jest.fn().mockResolvedValue(apiData);

            const result = await externalApiRepository.evaluate(key);

            expect(externalApiServiceMock.extract).toHaveBeenCalledWith(key, {} as PhotoResponse[]);
            expect(result).toEqual(apiData);
        });
    });

    describe('cache', () => {
        test('should extract and cache data if cache needs recovery', async () => {
            const key = DataEntries.PHOTOS;
            const apiData = [{ id: 1, title: 'Photo 1' }, { id: 2, title: 'Photo 2' }];

            externalApiServiceMock.extract = jest.fn().mockResolvedValue(apiData);
            localCacheServiceMock.writeTmpFile = jest.fn();
            localCacheServiceMock.readTmpFile = jest.fn().mockResolvedValue(null);
            localCacheServiceMock.checkAndCreateFile = jest.fn().mockResolvedValue(true);

            const result = await externalApiRepository.cache(key);

            expect(externalApiServiceMock.extract).toHaveBeenCalledWith(key, {} as PhotoResponse[]);
            expect(localCacheServiceMock.writeTmpFile).toHaveBeenCalledWith(key, JSON.stringify(apiData));
            expect(result).toEqual(apiData);
        });

        test('should extract and cache data if cache is not found', async () => {
            const key = DataEntries.PHOTOS;
            const apiData = [{ id: 1, title: 'Photo 1' }, { id: 2, title: 'Photo 2' }];

            externalApiServiceMock.extract = jest.fn().mockResolvedValue(apiData);
            localCacheServiceMock.writeTmpFile = jest.fn();
            localCacheServiceMock.readTmpFile = jest.fn().mockResolvedValue(null);
            localCacheServiceMock.checkAndCreateFile = jest.fn().mockResolvedValue(true);

            const result = await externalApiRepository.cache(key);

            expect(externalApiServiceMock.extract).toHaveBeenCalledWith(key, {} as PhotoResponse[]);
            expect(localCacheServiceMock.writeTmpFile).toHaveBeenCalledWith(key, JSON.stringify(apiData));
            expect(result).toEqual(apiData);
        });

        test('should return cached data if cache is found', async () => {
            const key = DataEntries.PHOTOS;
            const cacheData = [{ id: 1, title: 'Photo 1' }, { id: 2, title: 'Photo 2' }];

            localCacheServiceMock.readTmpFile = jest.fn().mockResolvedValue(JSON.stringify(cacheData));
            localCacheServiceMock.writeTmpFile = jest.fn();
            externalApiServiceMock.extract = jest.fn();

            const result = await externalApiRepository.cache(key);

            expect(localCacheServiceMock.readTmpFile).toHaveBeenCalledWith(key);
            expect(localCacheServiceMock.writeTmpFile).not.toHaveBeenCalled();
            expect(externalApiServiceMock.extract).not.toHaveBeenCalled();
            expect(result).toEqual(cacheData);
        });
    });

    describe('extractApiData', () => {
        test('should extract data from the external API', async () => {
            const key = DataEntries.PHOTOS;
            const apiData = [{ id: 1, title: 'Photo 1' }, { id: 2, title: 'Photo 2' }];

            externalApiServiceMock.extract = jest.fn().mockResolvedValue(apiData);

            const result = await externalApiRepository.extractApiData(key);

            expect(externalApiServiceMock.extract).toHaveBeenCalledWith(key, {} as PhotoResponse[]);
            expect(result).toEqual(apiData);
        });
    });

    describe('needRecovery', () => {
        test('should return true and generate a new cache time if cache time is not found', async () => {
            localCacheServiceMock.readTmpFile = jest.fn().mockResolvedValue(null);
            localCacheServiceMock.checkAndCreateFile = jest.fn();
            const cacheTime = { ttl: 1234567890 };
            const currentTime = 1234567889;

            jest.spyOn(Date.prototype, 'getTime').mockReturnValue(currentTime * 1000);

            const result = await externalApiRepository.needRecovery();

            expect(localCacheServiceMock.readTmpFile).toHaveBeenCalledWith("cacheTime");
            expect(localCacheServiceMock.checkAndCreateFile).toHaveBeenCalledWith(
                "cacheTime",
                JSON.stringify(cacheTime)
            );
            expect(result).toBe(true);
        });

        test('should return true and update cache time if cache time has expired', async () => {
            const cacheTime = { ttl: 1234567890 };
            const currentTime = 1234567891;

            localCacheServiceMock.readTmpFile = jest.fn().mockResolvedValue(JSON.stringify(cacheTime));
            localCacheServiceMock.deleteFiles = jest.fn();
            localCacheServiceMock.writeTmpFile = jest.fn();

            jest.spyOn(Date.prototype, 'getTime').mockReturnValue(currentTime * 1000);

            const result = await externalApiRepository.needRecovery();

            expect(localCacheServiceMock.readTmpFile).toHaveBeenCalledWith("cacheTime");
            expect(localCacheServiceMock.deleteFiles).toHaveBeenCalled();
            expect(localCacheServiceMock.writeTmpFile).toHaveBeenCalledWith(
                "cacheTime",
                JSON.stringify({ ttl: currentTime + localCacheConfig.ttl })
            );
            expect(result).toBe(true);
        });

        test('should return false if cache time has not expired', async () => {
            const cacheTime = { ttl: 1234567890 };
            const currentTime = 1234567889;

            localCacheServiceMock.readTmpFile = jest.fn().mockResolvedValue(JSON.stringify(cacheTime));

            jest.spyOn(Date.prototype, 'getTime').mockReturnValue(currentTime * 1000);

            const result = await externalApiRepository.needRecovery();

            expect(localCacheServiceMock.readTmpFile).toHaveBeenCalledWith("cacheTime");
            expect(result).toBe(false);
        });
    });
});