/**
 * GET /api/auth/me
 * Trả về thông tin user hiện tại từ session
 */
import { getSession } from '~/lib/auth.server';
import { apiError } from '~/lib/api-utils';

export async function loader({ request }: { request: Request }) {
  const user = await getSession(request);
  if (!user) {
    return apiError('Chưa đăng nhập', 401);
  }
  return Response.json({ success: true, data: user });
}
