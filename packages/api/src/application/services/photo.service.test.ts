import { PhotoService } from './photo.service';
import { LoggerUtils } from '../../utils/logger.utils';
import { PhotoRepository } from './photo.repository';
import PhotoResponseFixture from '../../fixtures/api_response/photo.json';
import PhotosResponseFixture from '../../fixtures/api_response/photos.json';

describe('PhotoService', () => {
    let photoService: PhotoService;
    let photoRepositoryMock: PhotoRepository;

    beforeEach(() => {
        photoRepositoryMock = {} as PhotoRepository;


        photoService = new PhotoService(photoRepositoryMock, new LoggerUtils('test'));
    });

    describe('photoWithId', () => {
        test('should call photoRepository.photoWithId with the provided photoId', async () => {
            const photoId = '1';
            const expectedResponse = PhotoResponseFixture[0];

            photoRepositoryMock.photoWithId = jest.fn().mockResolvedValue(expectedResponse);

            const result = await photoService.photoWithId(photoId);

            expect(photoRepositoryMock.photoWithId).toHaveBeenCalledWith(photoId);
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('filteringPhotos', () => {
        test('should call photoRepository.photosFiltered if filterParams is not empty', async () => {
            const filterParams = { albumId: '1' };
            const limit = 10;
            const offset = 0;
            const expectedResponse = PhotosResponseFixture;

            const chuckResponse = expectedResponse.slice(offset, offset + limit);

            photoRepositoryMock.photosFiltered = jest.fn().mockResolvedValue(expectedResponse);

            const result = await photoService.filteringPhotos(filterParams, limit, offset);

            expect(photoRepositoryMock.photosFiltered).toHaveBeenCalledWith(filterParams);
            expect(result).toEqual({
                result: chuckResponse,
                pagination: {
                    limit,
                    offset,
                    total: expectedResponse.length,
                    pages: 3,
                },
            });
        });

        test('should call photoRepository.photos if filterParams is empty', async () => {
            const filterParams = {};
            const limit = 10;
            const offset = 0;
            const expectedResponse = PhotosResponseFixture;
            const chuckResponse = expectedResponse.slice(offset, offset + limit);

            photoRepositoryMock.photos = jest.fn().mockResolvedValue(expectedResponse);

            const result = await photoService.filteringPhotos(filterParams, limit, offset);

            expect(photoRepositoryMock.photos).toHaveBeenCalled();
            expect(result).toEqual({
                result: chuckResponse,
                pagination: {
                    limit,
                    offset,
                    total: expectedResponse.length,
                    pages: 3,
                },
            });
        });
    });

    describe('paginationPhotos', () => {
        test('should return an empty array if offset is greater than or equal to the length of photos', () => {
            const photos = PhotoResponseFixture;
            const limit = 10;
            const offset = 1;

            const result = photoService.paginationPhotos(photos, limit, offset);

            expect(result).toEqual([]);
        });

        test('should return all photos if limit is greater than the length of photos', () => {
            const photos = PhotoResponseFixture;
            const limit = 10;
            const offset = 0;

            const result = photoService.paginationPhotos(photos, limit, offset);

            expect(result).toEqual(photos);
        });

        test('should return a subset of photos based on the limit and offset', () => {
            const photos = PhotoResponseFixture.slice(0, 3);
            const limit = 2;
            const offset = 1;

            const photoSpeckedResult = photos.slice(offset, offset + limit);

            const result = photoService.paginationPhotos(photos, limit, offset);

            expect(result).toEqual(photoSpeckedResult);
        });
    });
});