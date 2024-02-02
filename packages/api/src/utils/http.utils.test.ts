import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { HttpRequest } from './http.utils';

jest.mock('axios');

describe('HttpRequest', () => {
    let httpRequest: HttpRequest;
    const url = 'https://example.com';

    beforeEach(() => {
        httpRequest = new HttpRequest();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('get', () => {
        test('should make a GET request and return the response data', async () => {
            const responseData = { message: 'Success' };
            const response: AxiosResponse = {
                status: 200,
                data: responseData,
                statusText: 'OK',
                headers: {},
                config: {
                    headers: {} as AxiosRequestHeaders
                }
            };

            jest.spyOn(axios, 'get').mockResolvedValue(response);

            const result = await httpRequest.get(url);

            expect(axios.get).toHaveBeenCalledWith(url);
            expect(result).toEqual(responseData);
        });

        test('should throw a Error if the response status is not 200', async () => {
            const response: AxiosResponse = {
                status: 404,
                data: {},
                statusText: 'Not Found',
                headers: {},
                config: {
                    headers: {} as AxiosRequestHeaders
                }
            };

            jest.spyOn(axios, 'get').mockImplementation(() => Promise.resolve(response));

            await expect(httpRequest.get(url)).rejects.toThrow(Error);
            await expect(httpRequest.get(url)).rejects.toThrow('Error in request: 404');
        });
    });

});