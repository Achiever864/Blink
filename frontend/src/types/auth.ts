export interface AuthFormData{
    username?: string;
    email: string;
    password: string;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    profilePicture?: {
        url: string;
        publicId: string;
    };
    avatarUrl?: string;
    createdAt?: string;
    dateOfBirth: string;
    firstName: string;
    lastName: string;
    bio: string;
    website: string;
    occupation: string;
    city: string;
    nationality: string;
    interests: string[];
}