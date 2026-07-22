export interface ReelMedia {
    _id: string;
    url: string;
    publicId: string;
    type: "image" | "video" | "audio" | "file";
    duration?: number;
    width?: number;
    height?: number;
    bytes?: number;
    format?: string;
}

export interface Reel {
    _id: string;
    author: {
        _id: string;
        id?: string;
        username: string;
        fullName?: string;
        profilePicture?: {url: string; publicId: string};
    };
    caption: string;
    media: ReelMedia[];
    visibility: "public" | "friends" | "private";
    likes: string[];
    commentsCount: number;
    shares?: number;
    isEdited?: boolean;
    createdAt: string;
    updatedAt?: string;
}