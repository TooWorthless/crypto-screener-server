import mongoose, { Schema } from 'mongoose';
import { User } from '../types';

const userSchema = new Schema<User>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  isVerified: { type: Boolean, default: false },
  authType: { type: String, enum: ['google', 'credentials'], required: true },
});

export const UserModel = mongoose.model<User>('User', userSchema);