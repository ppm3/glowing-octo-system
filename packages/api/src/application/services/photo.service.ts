import { PhotoEntity } from "@/domain/entities/photo.entity";
import { PhotoRepository } from "./photo.repository";
import { ApiPhotosResponse } from "@/domain/entities/api.response.entity";
import { GeneralError } from "../../utils/general.error";
import { LoggerUtils } from "@/utils/logger.utils";

export class PhotoService {
    constructor(
        private readonly photoRepository: PhotoRepository,
        private readonly logger: LoggerUtils
    ) { }

    async photoWithId(photoId: string) {
        return await this.photoRepository.photoWithId(photoId);
    }

    async filteringPhotos(
        filterParams: { [key: string]: string },
        limit: number,
        offset: number
    ): Promise<ApiPhotosResponse | GeneralError> {
        if (Object.values(filterParams).some((value) => value !== "")) {
            return this.photosResponse(
                await this.photoRepository.photosFiltered(filterParams),
                limit,
                offset
            );
        }

        return this.photosResponse(
            await this.photoRepository.photos(),
            limit,
            offset
        );
    }

    photosResponse(
        photos: PhotoEntity[] | GeneralError,
        limit: number,
        offset: number
    ): ApiPhotosResponse | GeneralError {
        if (photos instanceof GeneralError) {
            throw photos;
        }

        return {
            result: this.paginationPhotos(photos, limit, offset),
            pagination: {
                limit,
                offset,
                total: photos.length,
                pages: Math.ceil(photos.length / limit),
            },
        };
    }

    paginationPhotos(
        photos: PhotoEntity[],
        limit: number,
        offset: number = 0
    ): PhotoEntity[] {
        if (offset >= photos.length) {
            return [];
        }

        if (limit > photos.length) {
            return photos;
        }

        return photos.slice(offset, offset + limit);
    }
}
