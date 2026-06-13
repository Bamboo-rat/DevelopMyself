/**
 * POST /api/pages/:id/duplicate — Nhân bản trang
 */
import { prisma } from '~/lib/prisma.server';
import { requireUser } from '~/lib/auth.server';
import { apiError, apiSuccess } from '~/lib/api-utils';

export async function action({ request, params }: { request: Request; params: { id: string } }) {
  const user = await requireUser(request);
  if (request.method !== 'POST') return apiError('Method not allowed', 405);

  const { id } = params;
  const original = await prisma.page.findFirst({
    where: { id, userId: user.id, isDeleted: false },
  });
  if (!original) return apiError('Trang không tồn tại', 404);

  const maxResult = await prisma.page.aggregate({
    where: { userId: user.id, parentId: original.parentId ?? null, isDeleted: false },
    _max: { sortOrder: true },
  });
  const nextSortOrder = (maxResult._max.sortOrder ?? 0) + 1;

  const copy = await prisma.page.create({
    data: {
      userId: user.id,
      parentId: original.parentId,
      title: `${original.title} (Copy)`,
      content: original.content ?? {},
      icon: original.icon,
      pageType: original.pageType,
      pageKind: original.pageKind,
      sortOrder: nextSortOrder,
      depth: original.depth,
      isFavorite: false,
      isArchived: false,
      isDeleted: false,
      path: '',
    },
  });

  const parentPath = original.path?.substring(0, original.path.lastIndexOf('/')) || null;
  const newPath = parentPath ? `${parentPath}/${copy.id}` : `/${copy.id}`;
  const updated = await prisma.page.update({ where: { id: copy.id }, data: { path: newPath } });

  return Response.json(
    { success: true, message: 'Nhân bản trang thành công', data: updated },
    { status: 201 }
  );
}
