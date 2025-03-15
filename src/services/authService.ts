import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { generateTokens, verifyToken } from '../utils/jwt';
import { sendVerificationEmail } from './emailService';
import { Tokens, User } from '../types';

export class AuthService {
  async loginWithCredentials(username: string, password: string): Promise<{ tokens: Tokens; user: User }> {
    const user = await UserModel.findOne({ username });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    if (!user.isVerified) throw new Error('Email not verified');
    const tokens = generateTokens(user._id.toString());
    return { tokens, user };
  }

  async registerWithCredentials(username: string, email: string, password: string): Promise<{ userId: string; code: string }> {
    const existingUser = await UserModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) throw new Error('User already exists');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ username, email, password: hashedPassword });
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

  async loginWithGoogle(googleToken: string): Promise<{ tokens: Tokens; user: User }> {
    const googleUser = { sub: 'google|123', email: 'user@gmail.com', name: 'User' };
    let user = await UserModel.findOne({ $or: [{ googleId: googleUser.sub }, { email: googleUser.email }] });
    if (!user) {
      user = await UserModel.create({
        username: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.sub,
        isVerified: true,
      });
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