import { PhotoEntity } from "./photo.entity";

export interface ApiPhotosResponse {
    result: PhotoEntity[],
    pagination: {
        limit: number
        offset: number
        total: number
        pages: number
    }
}