export interface UserResponse {
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

export interface AlbumResponse {
    userId: number;
    id: number;
    title: string;
}

export interface PhotoResponse {
    albumId: number;
    id: number;
    title: string;
    url: string;
    thumbnailUrl: string;
}