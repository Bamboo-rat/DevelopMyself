/**
 * POST /api/auth/register
 * Body: { email, password, fullName }
 */
import { prisma } from '~/lib/prisma.server';
import { hashPassword } from '~/lib/password.server';
import { apiError } from '~/lib/api-utils';

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return apiError('Method not allowed', 405);
  }

  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password) {
      return apiError('Email và mật khẩu không được để trống');
    }

    // Kiểm tra email trùng
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError('Email đã được sử dụng');
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: fullName ?? null,
        status: 'ACTIVE',
      },
    });

    // Tạo session cookie và redirect
    // Nhưng từ API call (axios), ta trả JSON thay vì redirect
    return Response.json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
        },
      },
    });
  } catch (error: any) {
    console.error('[register]', error);
    return apiError('Lỗi server: ' + error.message, 500);
  }
}
