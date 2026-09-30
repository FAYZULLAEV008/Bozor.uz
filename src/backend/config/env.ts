import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'bozor_uz_jwt_access_secret_super_secure_key_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'bozor_uz_jwt_refresh_secret_super_secure_key_2026',
  jwtAccessExpiresIn: '1d',
  jwtRefreshExpiresIn: '7d',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
};
