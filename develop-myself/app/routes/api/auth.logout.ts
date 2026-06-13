/**
 * POST /api/auth/logout
 * Xóa session cookie
 */
import { destroySessionCookie } from '~/lib/session.server';

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ success: false, message: 'Method not allowed' }, { status: 405 });
  }

  return Response.json(
    { success: true, message: 'Đăng xuất thành công', data: null },
    { headers: { 'Set-Cookie': destroySessionCookie() } }
  );
}
