import {
    AlbumEntity,
    PhotoEntity,
    UserEntity,
} from "../../domain/entities/photo.entity";
import {
    AlbumResponse,
    PhotoResponse,
    UserResponse,
} from "../../domain/entities/jsonplaceholder.entity";
import { LoggerUtils } from "../../utils/logger.utils";
import { GeneralError } from "../../utils/general.error";
import { DataEntries } from "../../domain/entities/app.entity";
import { ExternalApiRepository } from "../../infrastructure/external-services/external.api.repository";

export class PhotoRepository {
    constructor(
        private readonly externalApiRepository: ExternalApiRepository,
        private readonly logger: LoggerUtils
    ) { }

    async photos(): Promise<PhotoEntity[] | GeneralError> {
        try {
            const photos = (await this.externalApiRepository.evaluate(
                DataEntries.PHOTOS
            )) as unknown as PhotoResponse[];

            const { users, albums } = await this.cacheData();

            return await Promise.all(
                photos.map((photo) => this.photoData(photo, users, albums))
            );
        } catch (error) {
            this.logger.error(error);
            return error as GeneralError;
        }
    }

    async photoWithId(photoId: string): Promise<PhotoEntity | unknown> {
        try {
            const photos = (await this.externalApiRepository.evaluate(
                DataEntries.PHOTOS
            )) as unknown as PhotoResponse[];
            const { users, albums } = await this.cacheData();

            const photo = photos.find(
                (photo) => photo.id === Number(photoId)
            ) as unknown as PhotoResponse;

            if (!photo) {
                return undefined;
            }

            return this.photoData(photo, users, albums);
        } catch (error) {
            this.logger.error(error);
            return error;
        }
    }

    async photosFiltered(filterParams: {
        [key: string]: string;
    }): Promise<PhotoEntity[] | GeneralError> {
        try {
            const { users, albums } = await this.cacheData();
            const photos: PhotoEntity[] = [];

            if (filterParams.title && filterParams.title !== "") {
                this.logger.debug("Filtering photos by title", filterParams.title);
                const titlePhotos = (await this.photosFilteredByTitle(
                    filterParams.title
                )) as unknown as PhotoResponse[];
                if (titlePhotos.length > 0) {
                    const titlePhotoData = await Promise.all(
                        titlePhotos.map((photo) => this.photoData(photo, users, albums))
                    );
                    photos.push(...titlePhotoData);
                }
            }

            if (filterParams.albumTitle && filterParams.albumTitle !== "") {
                this.logger.debug(
                    "Filtering photos by album title",
                    filterParams.albumTitle
                );

                // if there are no photos, filter by album title
                if (photos.length === 0) {
                    const albumTitlePhotos = (await this.photosFilteredByAlbumTitle(
                        filterParams.albumTitle
                    )) as unknown as PhotoResponse[];


                    if (albumTitlePhotos.length > 0) {
                        const albumTitlePhotoData = await Promise.all(
                            albumTitlePhotos.map((photo) =>
                                this.photoData(photo, users, albums)
                            )
                        );
                        photos.push(...albumTitlePhotoData);
                    }
                }

                // if there are photos, filter by album title
                return await this.filterPhotosResultWithAlbumTitle(
                    filterParams.albumTitle,
                    photos
                );
            }

            // if this email send, disable any other filter
            if (filterParams.userEmail && filterParams.userEmail !== "") {
                this.logger.debug(
                    "Filtering photos by album user email",
                    filterParams.userEmail
                );
                const userEmailPhotos = (await this.photosFilteredByAlbumUserEmail(
                    filterParams.userEmail
                )) as unknown as PhotoResponse[];

                if (userEmailPhotos.length > 0) {
                    return await Promise.all(
                        userEmailPhotos.map((photo) => this.photoData(photo, users, albums))
                    );
                }
            }

            // Clean repeated photo.id values
            const uniquePhotos: PhotoEntity[] = photos.reduce(
                (unique: PhotoEntity[], photo: PhotoEntity) => {
                    if (!unique.some((p) => p.id === photo.id)) {
                        unique.push(photo);
                    }
                    return unique;
                },
                []
            );

            return uniquePhotos;
        } catch (error) {
            this.logger.error(error);
            return error as GeneralError;
        }
    }

    async photosFilteredByTitle(
        title: string
    ): Promise<PhotoResponse[] | GeneralError> {
        try {
            const photos = (await this.externalApiRepository.evaluate(
                DataEntries.PHOTOS
            )) as unknown as PhotoResponse[];
            return photos.filter((photo) => photo.title.includes(title));
        } catch (error) {
            this.logger.error(error);
            return error as GeneralError;
        }
    }
    async photosFilteredByAlbumTitle(
        albumTitle: string
    ): Promise<PhotoResponse[] | GeneralError> {
        try {
            const photos = (await this.externalApiRepository.evaluate(
                DataEntries.PHOTOS
            )) as unknown as PhotoResponse[];
            const albums = (await this.externalApiRepository.evaluate(
                DataEntries.ALBUMS
            )) as unknown as AlbumResponse[];

            const albumFiltered: AlbumResponse[] = albums.filter((album) =>
                album.title.includes(albumTitle)
            );
            return photos.filter((photo) =>
                albumFiltered.some((album) => album.id === photo.albumId)
            );
        } catch (error) {
            this.logger.error(error);
            return error as GeneralError;
        }
    }

    async filterPhotosResultWithAlbumTitle(
        albumTitle: string,
        photos: PhotoEntity[]
    ): Promise<PhotoEntity[]> {
        return photos.filter((photo) => photo.album?.title.includes(albumTitle));
    }
    async photosFilteredByAlbumUserEmail(
        userEmail: string
    ): Promise<PhotoResponse[] | GeneralError> {
        try {
            const photos = (await this.externalApiRepository.evaluate(
                DataEntries.PHOTOS
            )) as unknown as PhotoResponse[];

            const { users, albums } = await this.cacheData();
            this.logger.debug("Filtering photos by album user email", userEmail);

            const userFiltered: UserResponse[] = users.filter(
                (user) =>
                    user.email.trim().toLowerCase() == userEmail.trim().toLowerCase()
            );

            if (userFiltered.length > 0) {
                return albums
                    .filter((album) => album.userId === userFiltered[0].id)
                    .map(
                        (album) =>
                            photos.find(
                                (photo) => photo.albumId === album.id
                            ) as unknown as PhotoResponse
                    );
            }

            return [] as PhotoResponse[];
        } catch (error) {
            return error as GeneralError;
        }
    }

    async cacheData(): Promise<{
        users: UserResponse[];
        albums: AlbumResponse[];
    }> {
        const users = (await this.externalApiRepository.evaluate(
            DataEntries.USERS
        )) as unknown as UserResponse[];
        const albums = (await this.externalApiRepository.evaluate(
            DataEntries.ALBUMS
        )) as unknown as AlbumResponse[];

        return { users, albums };
    }

    private async photoData(
        photo: PhotoResponse,
        users: UserResponse[],
        albums: AlbumResponse[]
    ) {
        const album = albums.find(
            (album) => album.id === photo?.albumId
        ) as unknown as AlbumResponse;
        const user = users.find(
            (user) => user.id === album?.userId
        ) as unknown as UserResponse;

        return this.photoResponse(user, album, photo);
    }

    private photoResponse(
        user: UserResponse,
        album: AlbumResponse,
        photo: PhotoResponse
    ): PhotoEntity {
        let albumItem, userItem;

        if (user) {
            userItem = {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                address: {
                    street: user.address.street,
                    suite: user.address.suite,
                    city: user.address.city,
                    zipcode: user.address.zipcode,
                    geo: {
                        lat: user.address.geo.lat,
                        lng: user.address.geo.lng,
                    },
                },
                phone: user.phone,
                website: user.website,
                company: {
                    name: user.company.name,
                    catchPhrase: user.company.catchPhrase,
                    bs: user.company.bs,
                },
            };
        }

        if (album) {
            albumItem = {
                id: album.id,
                title: album.title,
                user: userItem as UserEntity,
            };
        }

        return {
            id: photo.id,
            title: photo.title,
            url: photo.url,
            thumbnailUrl: photo.thumbnailUrl,
            album: albumItem as AlbumEntity,
        };
    }
}
