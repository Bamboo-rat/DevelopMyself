import { parse, serialize } from 'cookie';

const SESSION_COOKIE_NAME = 'dm_session';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24, // 24 giờ
};

/**
 * Đọc session token từ cookie header
 */
export function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  return cookies[SESSION_COOKIE_NAME] ?? null;
}

/**
 * Tạo Set-Cookie header với session token
 */
export function createSessionCookie(token: string): string {
  return serialize(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);
}

/**
 * Tạo Set-Cookie header để xóa session (logout)
 */
export function destroySessionCookie(): string {
  return serialize(SESSION_COOKIE_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
    expires: new Date(0),
  });
}
