import jwt from 'jsonwebtoken';
import { config } from '../config';

export const generateTokens = (userId: string): { accessToken: string; refreshToken: string } => {
    const accessToken = jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtAccessExpiresIn } as any);
    const refreshToken = jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtRefreshExpiresIn } as any);
    return { accessToken, refreshToken };
};

export const verifyToken = (token: string): { id: string } => {
    return jwt.verify(token, config.jwtSecret) as { id: string };
};