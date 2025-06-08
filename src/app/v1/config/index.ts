import dotenv from 'dotenv';

dotenv.config();

// config/getEnvVar.ts
const getEnvVar = (key: string, required = true): string => {
  const value = process.env[key];

  if (required && (value === undefined || value === '')) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }

  return value!;
};

export default {
  NODE_ENV: getEnvVar('NODE_ENV'),
  PORT: getEnvVar('PORT'),
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  BCRYPT_SALT_ROUNDS: getEnvVar('BCRYPT_SALT_ROUNDS'),

  // cors origin
  CORS_ORIGIN:
    process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) ?? [],

  // authentication secret
  RATE_LIMIT_WINDOW_MIN: getEnvVar('RATE_LIMIT_WINDOW_MIN'),
  RATE_LIMIT_MAX_REQUESTS: getEnvVar('RATE_LIMIT_MAX_REQUESTS'),
  JWT_ACCESS_SECRET_KEY: getEnvVar('JWT_ACCESS_SECRET_KEY'),
  JWT_REFRESH_SECRET_KEY: getEnvVar('JWT_REFRESH_SECRET_KEY'),
  JWT_RESET_ACCESS_SECRET_KEY: getEnvVar('JWT_RESET_ACCESS_SECRET_KEY'),
  JWT_VERIFY_SECRET_KEY: getEnvVar('JWT_VERIFY_SECRET_KEY'),
  JWT_ACCESS_EXP_TIME: getEnvVar('JWT_ACCESS_EXP_TIME'),
  JWT_REFRESH_EXP_TIME: getEnvVar('JWT_REFRESH_EXP_TIME'),
  JWT_RESET_ACCESS_EXP_TIME: getEnvVar('JWT_RESET_ACCESS_EXP_TIME'),
  JWT_VERIFY_EXP_TIME: getEnvVar('JWT_VERIFY_EXP_TIME'),

  // pagination default values
  PAGINATION_DEFAULT_SORT: getEnvVar('PAGINATION_DEFAULT_SORT'),
  PAGINATION_DEFAULT_LIMIT: Number(getEnvVar('PAGINATION_DEFAULT_LIMIT')),

  // super admin credentials
  SUPER_ADMIN_FULLNAME: getEnvVar('SUPER_ADMIN_FULLNAME'),
  SUPER_ADMIN_EMAIL: getEnvVar('SUPER_ADMIN_EMAIL'),
  SUPER_ADMIN_PASSWORD: getEnvVar('SUPER_ADMIN_PASSWORD'),
  SUPER_ADMIN_GENDER: getEnvVar('SUPER_ADMIN_GENDER'),
  SUPER_ADMIN_BIRTHDATE: getEnvVar('SUPER_ADMIN_BIRTHDATE'),

  // image upload secret key
  CLOUDINARY_CLOUD_NAME: getEnvVar('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnvVar('CLOUDINARY_API_KEY'),
  CLOUDINARY_SECRET_KEY: getEnvVar('CLOUDINARY_SECRET_KEY'),

  // email send
  SENDER_EMAIL: getEnvVar('SENDER_EMAIL'),
  SENDGRID_API_KEY: getEnvVar('SENDGRID_API_KEY'),
};
