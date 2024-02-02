import axios, { AxiosResponse } from 'axios';
import { GeneralError } from './general.error';
export class HttpRequest {

    async get(url: string): Promise<AxiosResponse> {
        const response = await axios.get(url);
            
        if (response.status !== 200) {
            throw new GeneralError('Error in request: ' + response.status);
        }

        return response.data;
    }

    // ToDo: Implement the rest of the methods
}
