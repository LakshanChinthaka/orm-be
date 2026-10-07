import { CookieOptions } from 'express';

export const REFRESH_COOKIE_NAME = 'refresh_token';
export const EXPIRES_AT = 7 * 24 * 60 * 60 * 1000;

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict', // Mitigates CSRF attacks
  path: '/api/v1/app/auth', // Must match the real route (global prefix + controller); covers refresh-token and sign-out
  maxAge: EXPIRES_AT, // 7 Days
};
