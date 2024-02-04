import { PhotoService } from "../../application/services/photo.service";

export interface AppDependencies {
    photoService: PhotoService
}

export enum DataEntries {
    PHOTOS = "photos",
    USERS = "users",
    ALBUMS = "albums",
}