export interface User {
    _id: string;
    username: string;
    email: string;
    password?: string;
    googleId?: string;
    isVerified: boolean;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}