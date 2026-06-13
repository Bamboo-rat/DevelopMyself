import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './prisma.server';
import { redirect } from 'react-router';
import { getSessionCookie, destroySessionCookie, createSessionCookie } from './session.server';
import { apiError } from './api-utils';

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set.');
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export interface SessionUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

/**
 * Tạo JWT session token (24h)
 */
export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token, trả về userId
 */
async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

/**
 * Lấy thông tin user từ request cookie
 * Trả về null nếu không có session hợp lệ
 */
export async function getSession(request: Request): Promise<SessionUser | null> {
  const token = getSessionCookie(request);
  if (!token) return null;

  const userId = await verifySessionToken(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      status: true,
    },
  });

  if (!user || user.status === 'INACTIVE') return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
  };
}

/**
 * Bắt buộc phải có session — nếu không, trả về JSON 401 Unauthorized
 */
export async function requireUser(request: Request): Promise<SessionUser> {
  const user = await getSession(request);
  if (!user) {
    throw apiError('Unauthorized', 401);
  }
  return user;
}

/**
 * Tạo session cookie sau khi login/register
 */
export async function createUserSession(userId: string, redirectTo: string) {
  const token = await createSessionToken(userId);
  const cookie = createSessionCookie(token);
  return redirect(redirectTo, {
    headers: { 'Set-Cookie': cookie },
  });
}

/**
 * Destroy session cookie (logout)
 */
export function destroySession(redirectTo: string) {
  return redirect(redirectTo, {
    headers: { 'Set-Cookie': destroySessionCookie() },
  });
}
