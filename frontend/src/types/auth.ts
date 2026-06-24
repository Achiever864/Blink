export interface AuthFormData{
    name?: string;
    email: string;
    password: string;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    createdAt: string;
}