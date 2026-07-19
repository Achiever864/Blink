export interface ReelMedia {
    url: string;
    publicId: string;
    type: "image" | "video" | "audio" | "file";
    duration?: number;
}

export interface Reel {
    _id: string;
    author: {
        _id: string;
        username: string;
        profilePicture?: {url: string; publicId: string};
    };
    caption: string;
    media: ReelMedia[];
    likes: string[];
    commentsCount: number;
    createdAt: string;
}