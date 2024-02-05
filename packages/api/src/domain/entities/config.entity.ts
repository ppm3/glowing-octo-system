export interface ApiConfig {
    port: number;
    xApiKey: string;
    logLevel: string;
}

export interface ExternalEndpoints {
    users: string;
    albums: string;
    photos: string;
}

export interface ExternalSourceConfig {
    url: string;
    endpoints: ExternalEndpoints;
}

export interface LocalCacheConfig {
    ttl: number;
    enabled: boolean;
    path: string;
}

export interface ConfigParams {
    api: ApiConfig;
    externalSource: ExternalSourceConfig;
    localCache: LocalCacheConfig;
}
