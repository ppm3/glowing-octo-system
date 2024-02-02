import { PhotoRepository } from './photo.repository';
import { LoggerUtils } from '../../utils/logger.utils';
import { DataEntries } from '../../domain/entities/app.entity';
import photoResponse from '../../fixtures/api_response/photo.json';
import usersFixture from '../../fixtures/jsonplaceholder/users.json';
import albumUserFixture from '../../fixtures/process/album_user.json';
import photosFixture from '../../fixtures/jsonplaceholder/photos.json';
import albumsFixture from '../../fixtures/jsonplaceholder/albums.json';
import { AlbumResponse, PhotoResponse } from '@/domain/entities/jsonplaceholder.entity';
import { ExternalApiRepository } from '../../infrastructure/external-services/external.api.repository';

describe('PhotoRepository', () => {
    let photoRepository: PhotoRepository;
    let externalApiRepositoryMock: ExternalApiRepository;

    let photosData: Array<unknown>;
    let usersData: Array<unknown>;
    let albumsData: Array<unknown>;
    let albumUserProcess: Array<unknown>;

    let filterParams: { [key: string]: string };


    beforeEach(async () => {
        externalApiRepositoryMock = {} as ExternalApiRepository;
        photoRepository = new PhotoRepository(
            externalApiRepositoryMock,
            new LoggerUtils('test')
        );
        photosData = photosFixture;
        albumsData = albumsFixture;
        usersData = usersFixture;
        albumUserProcess = albumUserFixture;

        filterParams = {
            'title': '',
            'albumTitle': '',
            'userEmail': ''
        };
    });

    describe('photos', () => {
        test('should return an array of PhotoEntity objects', async () => {
            // Mock the externalApiRepository.evaluate method

            externalApiRepositoryMock.evaluate = jest.fn().mockResolvedValue([photosData[0]]);

            // Mock the cacheData method
            photoRepository.cacheData = jest.fn().mockResolvedValue({
                albums: [albumsData[0]],
                users: [usersData[0]]
            });

            const result = await photoRepository.photos();

            expect(externalApiRepositoryMock.evaluate).toHaveBeenCalledWith(
                DataEntries.PHOTOS
            );
            expect(photoRepository.cacheData).toHaveBeenCalled();
            expect(result).toEqual(albumUserProcess);
        });

        test('should return a GeneralError object if an error occurs', async () => {
            // Mock the externalApiRepository.evaluate method to throw an error
            externalApiRepositoryMock.evaluate = jest.fn().mockRejectedValue(new Error('API error'));

            const result = await photoRepository.photos();

            expect(externalApiRepositoryMock.evaluate).toHaveBeenCalledWith(
                DataEntries.PHOTOS
            );
            expect(result).toEqual(new Error('API error'));
        });
    });

    describe('photoWithId', () => {
        test('should return a PhotoEntity object', async () => {
            externalApiRepositoryMock.evaluate = jest.fn().mockResolvedValue([photosData[0]]);

            photoRepository.cacheData = jest.fn().mockResolvedValue({
                albums: [albumsData[0]],
                users: [usersData[0]]
            });

            const result = await photoRepository.photoWithId('1');

            expect(externalApiRepositoryMock.evaluate).toHaveBeenCalledWith(
                DataEntries.PHOTOS
            );
            expect(photoRepository.cacheData).toHaveBeenCalled();
            expect(result).toEqual(photoResponse[0]);
        });

        test('should return undefined if no photo is found', async () => {
            externalApiRepositoryMock.evaluate = jest.fn().mockResolvedValue([]);

            const result = await photoRepository.photoWithId('1');

            expect(externalApiRepositoryMock.evaluate).toHaveBeenCalledWith(
                DataEntries.PHOTOS
            );
            expect(result).toEqual(undefined);
        });

        test('should return a GeneralError object if an error occurs', async () => {
            externalApiRepositoryMock.evaluate = jest.fn().mockRejectedValue(new Error('API error'));

            const result = await photoRepository.photoWithId('1');

            expect(externalApiRepositoryMock.evaluate).toHaveBeenCalledWith(
                DataEntries.PHOTOS
            );
            expect(result).toEqual(new Error('API error'));
        });
    });

    describe('photosFiltered', () => {
        test('should return an array of PhotoEntity objects with photo title', async () => {
            photoRepository.cacheData = jest.fn().mockResolvedValue({
                albums: [albumsData[0]],
                users: [usersData[0]]
            });

            filterParams['title'] = 'accusamus beatae';
            externalApiRepositoryMock.evaluate = jest.fn().mockResolvedValue([photosData[0]]);

            const result = await photoRepository.photosFiltered(filterParams);

            expect(externalApiRepositoryMock.evaluate).toHaveBeenCalledWith(
                DataEntries.PHOTOS
            );
            expect(photoRepository.cacheData).toHaveBeenCalled();
            expect(result).toEqual(photoResponse);
        });

        test('should return an empty array if no photos are found', async () => {
            externalApiRepositoryMock.evaluate = jest.fn().mockResolvedValue([]);
            filterParams['title'] = 'xstestx';
            const result = await photoRepository.photosFiltered(filterParams);

            expect(externalApiRepositoryMock.evaluate).toHaveBeenCalledWith(
                DataEntries.USERS
            );
            expect(externalApiRepositoryMock.evaluate).toHaveBeenCalledWith(
                DataEntries.ALBUMS
            );
            expect(result).toEqual([]);
        });

        test('should return a GeneralError object if an error occurs', async () => {
            externalApiRepositoryMock.evaluate = jest.fn().mockRejectedValue(new Error('API error'));
            filterParams['title'] = 'accusamus beatae';
            const result = await photoRepository.photosFiltered(filterParams);

            expect(externalApiRepositoryMock.evaluate).toHaveBeenCalledWith(
                DataEntries.USERS
            );
            expect(result).toEqual(new Error('API error'));
        });

        test('should return an array of PhotoEntity objects with photo album title', async () => {
            photoRepository.cacheData = jest.fn().mockResolvedValue({
                albums: [albumsData[0]],
                users: [usersData[0]]
            });

            filterParams['albumTitle'] = 'quidem molestiae';

            externalApiRepositoryMock.evaluate = jest.fn()
                .mockReturnValueOnce([photosData[0]] as PhotoResponse[])
                .mockReturnValueOnce(albumsData as AlbumResponse[]);

            const result = await photoRepository.photosFiltered(filterParams);

            expect(photoRepository.cacheData).toHaveBeenCalled();
            expect(externalApiRepositoryMock.evaluate).toHaveBeenCalledWith(
                DataEntries.PHOTOS
            );
            expect(externalApiRepositoryMock.evaluate).toHaveBeenCalledWith(
                DataEntries.ALBUMS
            );
            expect(result).toEqual(photoResponse);
        });

        test('should return an array of PhotoEntity objects with photo user email', async () => {
            photoRepository.cacheData = jest.fn().mockResolvedValue({
                albums: [albumsData[0]],
                users: [usersData[0]]
            });

            filterParams['userEmail'] = 'Sincere@april.biz';
            externalApiRepositoryMock.evaluate = jest.fn()
                .mockReturnValue([photosData[0]] as PhotoResponse[]);

            const result = await photoRepository.photosFiltered(filterParams);

            expect(photoRepository.cacheData).toHaveBeenCalled();
            expect(externalApiRepositoryMock.evaluate).toHaveBeenCalledWith(
                DataEntries.PHOTOS
            );
            expect(result).toEqual(photoResponse);
        });

        test('should return an array of PhotoEntity objects with photo title and the album title are correct', async () => {
            photoRepository.cacheData = jest.fn().mockResolvedValue({
                albums: [albumsData[0]],
                users: [usersData[0]]
            });

            externalApiRepositoryMock.evaluate = jest.fn().mockResolvedValue([photosData[0]]);

            const result = await photoRepository.photosFiltered({
                'title': 'accusamus',
                'albumTitle': 'quidem molestiae',
                'userEmail': ''
            } as { [key: string]: string });

            expect(externalApiRepositoryMock.evaluate).toHaveBeenCalledWith(
                DataEntries.PHOTOS
            );
            expect(photoRepository.cacheData).toHaveBeenCalled();
            expect(result).toEqual(photoResponse);
        });
    });
});