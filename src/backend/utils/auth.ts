import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.ts';
import { JwtUserPayload, User } from '../types/index.ts';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateTokens = (user: User) => {
  const payload: JwtUserPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiresIn,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): JwtUserPayload | null => {
  try {
    return jwt.verify(token, config.jwtAccessSecret) as JwtUserPayload;
  } catch (err) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtUserPayload | null => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret) as JwtUserPayload;
  } catch (err) {
    return null;
  }
};
