import { HttpStatusCode } from "axios";
import { type Request, type Response } from "express";
import { LoggerUtils } from "../../utils/logger.utils";
import { GeneralError } from "../../utils/general.error";
import { PhotoService } from "../../application/services/photo.service";
import { ApiPhotosResponse } from "@/domain/entities/api.response.entity";

export async function photoController(
    req: Request,
    res: Response,
    logger: LoggerUtils,
    photoService: PhotoService
): Promise<void> {
    try {
        const { photoId } = req.params;
        const { title, offset = 0, limit = 25 } = req.query;

        const albumTitle = req.query['album.title'] || '';
        const userEmail = req.query['album.user.email'] || '';

        if (photoId) {
            const response: unknown = await photoService.photoWithId(photoId);

            if (!response) {
                res.status(HttpStatusCode.NoContent).json([]);
                return Promise.resolve();
            }

            res.status(HttpStatusCode.Ok).json(response);
            return Promise.resolve();
        }

        const filterParams = { title: title?.toString().toLowerCase() || '', albumTitle: albumTitle?.toString().toLowerCase() || '', userEmail: userEmail?.toString().toLowerCase() || '' } as { [key: string]: string };
        const response: ApiPhotosResponse | GeneralError = await photoService.filteringPhotos(
            filterParams,
            Number(limit),
            Number(offset)
        );

        if (response instanceof GeneralError) {
            throw response;
        }

        if (!response.result.length) {
            res.status(HttpStatusCode.NoContent).json([]);
            return Promise.resolve();
        }

        res.set('x-pagination-limit', response.pagination.limit.toString());
        res.set('x-pagination-offset', response.pagination.offset.toString());
        res.set('x-pagination-total', response.pagination.total.toString());
        res.set('x-pagination-pages', response.pagination.pages.toString());
        res.status(HttpStatusCode.Ok).json(response.result);
        return Promise.resolve();


    } catch (error) {
        res
            .status(HttpStatusCode.InternalServerError)
            .json(error);
    }
}
