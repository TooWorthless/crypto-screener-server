import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();
const verificationCodes = new Map<string, string>();

export const checkUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.query;
        if (typeof email !== 'string') throw new Error('Email must be a string');
        const user = await authService.checkUser(email);
        res.json({ user: user || null });
    } catch (error) {
        next(error);
    }
};

export const registerWithBackend = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, authType, password } = req.body;
        const user = await authService.registerWithBackend({ username, email, authType, password });
        res.json({ user });
    } catch (error) {
        next(error);
    }
};

export const loginWithCredentials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;
        const { tokens, user } = await authService.loginWithCredentials(username, password);
        res.json({ ...tokens, user });
    } catch (error) {
        next(error);
    }
};

export const registerWithCredentials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body;
        const { userId, code } = await authService.registerWithCredentials(username, email, password);
        verificationCodes.set(userId, code);
        res.json({ message: 'Verification code sent', userId });
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, code } = req.body;
        const storedCode = verificationCodes.get(userId);
        if (!storedCode) throw new Error('Code not found or expired');
        const { tokens, user } = await authService.verifyEmail(userId, code, storedCode);
        verificationCodes.delete(userId);
        res.json({ ...tokens, user });
    } catch (error) {
        next(error);
    }
};

// export const loginWithGoogle = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { googleToken } = req.body;
//     const { tokens, user } = await authService.loginWithGoogle(googleToken);
//     res.json({ ...tokens, user });
//   } catch (error) {
//     next(error);
//   }
// };
export const loginWithGoogle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userData } = req.body; // { email, name }
        const { email, name } = userData;
        const { tokens, user } = await authService.loginWithGoogle({ email, name });
        res.json({ ...tokens, user });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        const tokens = await authService.refreshToken(refreshToken);
        res.json(tokens);
    } catch (error) {
        next(error);
    }
};