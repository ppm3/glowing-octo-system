export interface UserEntity {
    id: number;
    name: string;
    username: string;
    email: string;
    address: {
        street: string;
        suite: string;
        city: string;
        zipcode: string;
        geo: {
            lat: string;
            lng: string;
        };
    };
    phone: string;
    website: string;
    company: {
        name: string;
        catchPhrase: string;
        bs: string;
    };
}
export interface AlbumEntity {
    id: number;
    title: string;
    user: UserEntity;
}

export interface PhotoEntity {
    id: number;
    title: string;
    url: string;
    thumbnailUrl: string;
    album: AlbumEntity;
}
