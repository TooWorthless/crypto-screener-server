import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { generateTokens, verifyToken } from '../utils/jwt';
import { sendVerificationEmail } from './emailService';
import { Tokens, User } from '../types';

export class AuthService {
    async checkUser(email: string): Promise<User | null> {
        return await UserModel.findOne({ email });
    }

    async loginWithCredentials(username: string, password: string): Promise<{ tokens: Tokens; user: User }> {
        const user = await UserModel.findOne({ username });
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid credentials');
        }
        if (!user.isVerified) throw new Error('Email not verified');
        const tokens = generateTokens(user._id.toString());
        return { tokens, user };
    }

    async registerWithBackend(data: {
        username: string;
        email: string;
        authType: 'google' | 'credentials';
        password?: string;
    }): Promise<User> {
        const { username, email, authType, password } = data;
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) throw new Error('User already exists');
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        const user = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            authType,
            isVerified: authType === 'google',
        });
        return user;
    }

    async registerWithCredentials(username: string, email: string, password: string): Promise<{ userId: string; code: string }> {
        const existingUser = await UserModel.findOne({ $or: [{ username }, { email }] });
        if (existingUser) throw new Error('User already exists');
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            authType: 'credentials',
        });
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await sendVerificationEmail(email, code);
        return { userId: user._id.toString(), code };
    }

    async verifyEmail(userId: string, code: string, storedCode: string): Promise<{ tokens: Tokens; user: User }> {
        if (code !== storedCode) throw new Error('Invalid code');
        const user = await UserModel.findByIdAndUpdate(userId, { isVerified: true }, { new: true });
        if (!user) throw new Error('User not found');
        const tokens = generateTokens(user._id.toString());
        return { tokens, user };
    }

    //   async loginWithGoogle(googleToken: string): Promise<{ tokens: Tokens; user: User }> {
    //     const googleUser = { sub: 'google|123', email: 'user@gmail.com', name: 'User' };
    //     let user = await UserModel.findOne({ $or: [{ googleId: googleUser.sub }, { email: googleUser.email }] });
    //     if (!user) {
    //       user = await UserModel.create({
    //         username: googleUser.name,
    //         email: googleUser.email,
    //         googleId: googleUser.sub,
    //         authType: 'google',
    //         isVerified: true,
    //       });
    //     }
    //     const tokens = generateTokens(user._id.toString());
    //     return { tokens, user };
    //   }
    async loginWithGoogle(userData: { email: string; name: string }): Promise<{ tokens: Tokens; user: User }> {
        const { email, name } = userData;
        let user = await UserModel.findOne({ email });

        if (!user) {
            user = await UserModel.create({
                username: name,
                email,
                authType: 'google',
                isVerified: true,
            });
        } else if (user.authType !== 'google') {
            throw new Error('User exists with a different auth type');
        }

        const tokens = generateTokens(user._id.toString());
        return { tokens, user };
    }

    async refreshToken(refreshToken: string): Promise<Tokens> {
        const decoded = verifyToken(refreshToken);
        const user = await UserModel.findById(decoded.id);
        if (!user) throw new Error('Invalid refresh token');
        return generateTokens(user._id.toString());
    }
}