/**
 * GET   /api/users/me           — Lấy profile
 * PUT   /api/users/me           — Cập nhật profile
 * PUT   /api/users/me/password  — Đổi mật khẩu
 */
import { prisma } from '~/lib/prisma.server';
import { requireUser } from '~/lib/auth.server';
import { hashPassword, verifyPassword } from '~/lib/password.server';
import { apiError, apiSuccess } from '~/lib/api-utils';

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return apiSuccess(profile);
}

export async function action({ request }: { request: Request }) {
  const user = await requireUser(request);
  const url = new URL(request.url);
  const isPasswordChange = url.pathname.endsWith('/password');

  if (request.method !== 'PUT' && request.method !== 'PATCH') {
    return apiError('Method not allowed', 405);
  }

  const body = await request.json();

  if (isPasswordChange) {
    const { oldPassword, newPassword } = body;
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return apiError('User không tồn tại', 404);

    const isValid = await verifyPassword(oldPassword, dbUser.passwordHash);
    if (!isValid) return apiError('Mật khẩu cũ không đúng', 400);

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
    return apiSuccess(null, 'Đổi mật khẩu thành công');
  }

  // Update profile
  const { fullName, avatarUrl } = body;
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return apiSuccess(updated, 'Cập nhật hồ sơ thành công');
}
