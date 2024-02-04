import fs from 'fs';
import { LoggerUtils } from '../../utils/logger.utils';
import { LocalCacheService } from './local.cache.service';
import { LocalCacheConfig } from '@/domain/entities/config.entity';

describe('LocalCacheService', () => {
    let localCacheService: LocalCacheService;

    beforeEach(() => {
        localCacheService = new LocalCacheService(
            { path: "cache", ttl: 1, enabled: true } as LocalCacheConfig,
            new LoggerUtils("debug")
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createCacheDirectory', () => {
        test('should create cache directory', async () => {
            const mockMkdir = jest.spyOn(fs.promises, 'mkdir').mockResolvedValueOnce('');

            await localCacheService.createCacheDirectory();

            expect(mockMkdir).toHaveBeenCalledWith('/tmp/cache', { recursive: true });
        });

        test('should log and rethrow error if directory creation fails', async () => {
            const mockError = new Error('Failed to create directory');
            jest.spyOn(fs.promises, 'mkdir').mockRejectedValueOnce(mockError);

            await expect(localCacheService.createCacheDirectory()).rejects.toThrow(mockError);
        });
    });

    describe('deleteFiles', () => {
        test('should delete all files in the cache directory', async () => {
            const mockRm = jest.spyOn(fs.promises, 'rm').mockResolvedValueOnce();
            const mockCreateCacheDirectory = jest.spyOn(localCacheService, 'createCacheDirectory').mockResolvedValueOnce();

            await localCacheService.deleteFiles();

            expect(mockRm).toHaveBeenCalledWith('/tmp/cache', { recursive: true });
            expect(mockCreateCacheDirectory).toHaveBeenCalled();
        });

        test('should log and rethrow error if file deletion fails', async () => {
            const mockError = new Error('Failed to delete files');
            jest.spyOn(fs.promises, 'rm').mockRejectedValueOnce(mockError);

            await expect(localCacheService.deleteFiles()).rejects.toThrow(mockError);
        });
    });

    describe('checkAndCreateFile', () => {
        test('should return true if file exists', async () => {
            const mockOpen = jest.spyOn(fs.promises, 'open').mockResolvedValueOnce(null as never);

            const result = await localCacheService.checkAndCreateFile('key', 'payload');

            expect(mockOpen).toHaveBeenCalledWith('/tmp/cache/key.json', 'r');
            expect(result).toBe(true);
        });

        test('should write temporary file and return true if file does not exist', async () => {
            const mockOpen = jest.spyOn(fs.promises, 'open').mockRejectedValueOnce({ code: 'ENOENT' } as never);
            const mockWriteTmpFile = jest.spyOn(localCacheService, 'writeTmpFile').mockResolvedValueOnce(true);

            const result = await localCacheService.checkAndCreateFile('key', 'payload');

            expect(mockOpen).toHaveBeenCalledWith('/tmp/cache/key.json', 'r');
            expect(mockWriteTmpFile).toHaveBeenCalledWith('key', 'payload');
            expect(result).toBe(true);
        });

        test('should log and rethrow error if file check fails with an unexpected error', async () => {
            const mockError = new Error('Failed to check file');
            jest.spyOn(fs.promises, 'open').mockRejectedValueOnce(mockError);

            await expect(localCacheService.checkAndCreateFile('key', 'payload')).rejects.toThrow(mockError);
        });
    });

    describe('writeTmpFile', () => {
        test('should create cache directory and write file', async () => {
            const mockCreateCacheDirectory = jest.spyOn(localCacheService, 'createCacheDirectory').mockResolvedValueOnce();
            const mockWriteFile = jest.spyOn(fs.promises, 'writeFile').mockResolvedValueOnce();

            const result = await localCacheService.writeTmpFile('key', 'payload');

            expect(mockCreateCacheDirectory).toHaveBeenCalled();
            expect(mockWriteFile).toHaveBeenCalledWith('/tmp/cache/key.json', 'payload');
            expect(result).toBe(true);
        });
    });

    describe('readTmpFile', () => {
        test('should read file content', async () => {
            const mockReadFile = jest.spyOn(fs.promises, 'readFile').mockResolvedValueOnce('file content');

            const result = await localCacheService.readTmpFile('key');

            expect(mockReadFile).toHaveBeenCalledWith('/tmp/cache/key.json', 'utf-8');
            expect(result).toBe('file content');
        });

        test('should return an empty string if file does not exist', async () => {
            const mockReadFile = jest.spyOn(fs.promises, 'readFile').mockRejectedValueOnce(new Error('File not found'));

            const result = await localCacheService.readTmpFile('key');

            expect(mockReadFile).toHaveBeenCalledWith('/tmp/cache/key.json', 'utf-8');
            expect(result).toBe('');
        });
    });
});