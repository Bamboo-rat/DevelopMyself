/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: set HttpOnly cookie + trả về user info
 */
import { prisma } from '~/lib/prisma.server';
import { verifyPassword } from '~/lib/password.server';
import { createSessionToken } from '~/lib/auth.server';
import { createSessionCookie } from '~/lib/session.server';
import { apiError } from '~/lib/api-utils';

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return apiError('Method not allowed', 405);
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError('Email và mật khẩu không được để trống');
    }

    // Tìm user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return apiError('Email hoặc mật khẩu không đúng', 401);
    }

    if (user.status === 'INACTIVE') {
      return apiError('Tài khoản đã bị vô hiệu hóa', 403);
    }

    // Xác thực password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return apiError('Email hoặc mật khẩu không đúng', 401);
    }

    // Cập nhật last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Tạo session token
    const token = await createSessionToken(user.id);
    const cookie = createSessionCookie(token);

    return Response.json(
      {
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
          },
        },
      },
      {
        headers: { 'Set-Cookie': cookie },
      }
    );
  } catch (error: any) {
    console.error('[login]', error);
    return apiError('Lỗi server: ' + error.message, 500);
  }
}
