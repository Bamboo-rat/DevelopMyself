/**
 * PUT /api/users/me/password — Đổi mật khẩu
 */
import { prisma } from '~/lib/prisma.server';
import { requireUser } from '~/lib/auth.server';
import { hashPassword, verifyPassword } from '~/lib/password.server';
import { apiError, apiSuccess } from '~/lib/api-utils';

export async function action({ request }: { request: Request }) {
  const user = await requireUser(request);

  if (request.method !== 'PUT' && request.method !== 'PATCH') {
    return apiError('Method not allowed', 405);
  }

  const body = await request.json();
  const { oldPassword, newPassword } = body;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return apiError('User không tồn tại', 404);

  const isValid = await verifyPassword(oldPassword, dbUser.passwordHash);
  if (!isValid) return apiError('Mật khẩu cũ không đúng', 400);

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  return apiSuccess(null, 'Đổi mật khẩu thành công');
}
