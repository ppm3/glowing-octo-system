import { HttpRequest } from "../../utils/http.utils";
import { ExternalSourceConfig } from "../../domain/entities/config.entity";
import {
    AlbumResponse,
    PhotoResponse,
    UserResponse,
} from "../../domain/entities/jsonplaceholder.entity";
import { LoggerUtils } from "../../utils/logger.utils";
import { DataEntries } from "../../domain/entities/app.entity";

export class ExternalApiService {
    constructor(
        private readonly http: HttpRequest,
        private readonly externalSourceConfig: ExternalSourceConfig,
        private readonly logger: LoggerUtils
    ) { }

    async extract(
        endpoint: DataEntries,
        response: PhotoResponse[] | AlbumResponse[] | UserResponse[]
    ): Promise<PhotoResponse[] | AlbumResponse[] | UserResponse[]> {
        const {
            url,
            endpoints,
        } = this.externalSourceConfig;

        this.logger.debug('Fetching data from:', `${url}${endpoints[endpoint]}`);
        return await this.http.get(`${url}${endpoints[endpoint]}`) as unknown as typeof response;
    }

}
