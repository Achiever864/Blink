export interface AuthFormData{
    username?: string;
    email: string;
    password: string;
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    profilePicture?: string;
    avatarUrl?: string;
    createdAt?: string;
}