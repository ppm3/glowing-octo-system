import { ExternalApiService } from './external.api.service';
import { ExternalEndpoints, ExternalSourceConfig } from '@/domain/entities/config.entity';
import { LoggerUtils } from '../../utils/logger.utils';
import { HttpRequest } from '../../utils/http.utils';
import { DataEntries } from '../../domain/entities/app.entity';
import { PhotoResponse } from '../../domain/entities/jsonplaceholder.entity';

describe('ExternalApiService', () => {
    let externalApiService: ExternalApiService;
    let httpMock: HttpRequest;



    beforeEach(() => {
        httpMock = {} as HttpRequest;

        const testConfig = {
            url: 'https://api.example.com/',
            endpoints: { photos: 'photos', albums: 'albums', users: 'users' } as unknown as ExternalEndpoints
        } as unknown as ExternalSourceConfig;

        externalApiService = new ExternalApiService(
            httpMock,
            testConfig,
            new LoggerUtils('test')
        );
    });

    describe('extract', () => {
        test('should fetch data from the external API and return the response', async () => {
            const endpoint = DataEntries.PHOTOS;
            const response = [{ id: 1, title: 'Photo 1' }, { id: 2, title: 'Photo 2' }];

            httpMock.get = jest.fn().mockResolvedValue(response);

            const result = await externalApiService.extract(endpoint, response as PhotoResponse[]);

            expect(httpMock.get).toHaveBeenCalledWith('https://api.example.com/photos');
            expect(result).toEqual(response);
        });
    });
});