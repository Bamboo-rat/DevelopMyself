/**
 * PATCH /api/pages/:id/:suffix
 * Xử lý các sub-routes: title, content, icon, type, sort-order, archive, parent, toggle
 * Delegate sang pages.$id handler
 */
import { prisma } from '~/lib/prisma.server';
import { requireUser } from '~/lib/auth.server';
import { apiError, apiSuccess } from '~/lib/api-utils';

export async function action({ request, params }: { request: Request; params: { id: string; suffix: string } }) {
  const user = await requireUser(request);
  const { id, suffix } = params;

  if (request.method !== 'PATCH' && request.method !== 'DELETE') {
    return apiError('Method not allowed', 405);
  }

  const page = await prisma.page.findFirst({
    where: { id, userId: user.id, isDeleted: false },
  });
  if (!page) return apiError('Trang không tồn tại', 404);

  const body = request.method === 'PATCH' ? await request.json() : {};

  switch (suffix) {
    case 'title': {
      const updated = await prisma.page.update({ where: { id }, data: { title: body.title } });
      return apiSuccess(mapToDetail(updated), 'Cập nhật tiêu đề thành công');
    }
    case 'content': {
      const updated = await prisma.page.update({ where: { id }, data: { content: body.content } });
      return apiSuccess(mapToDetail(updated), 'Cập nhật nội dung thành công');
    }
    case 'icon': {
      const updated = await prisma.page.update({ where: { id }, data: { icon: body.icon ?? null } });
      return apiSuccess(mapToDetail(updated), 'Đổi icon thành công');
    }
    case 'type': {
      const updated = await prisma.page.update({ where: { id }, data: { pageType: body.pageType } });
      return apiSuccess(mapToDetail(updated), 'Đổi loại trang thành công');
    }
    case 'sort-order': {
      const updated = await prisma.page.update({ where: { id }, data: { sortOrder: body.sortOrder } });
      return apiSuccess(mapToDetail(updated), 'Cập nhật thứ tự thành công');
    }
    case 'archive': {
      const updated = await prisma.page.update({ where: { id }, data: { isArchived: body.archived } });
      const msg = body.archived ? 'Lưu trữ trang thành công' : 'Khôi phục trang thành công';
      return apiSuccess(mapToDetail(updated), msg);
    }
    case 'parent': {
      const { newParentId } = body as { newParentId: string | null };
      if (newParentId === id) return apiError('Không thể di chuyển trang vào chính nó', 400);

      let newDepth = 0;
      let newParentPath: string | null = null;
      if (newParentId) {
        const newParent = await prisma.page.findFirst({ where: { id: newParentId, userId: user.id, isDeleted: false } });
        if (!newParent) return apiError('Parent page không tồn tại', 404);
        if (newParent.path?.startsWith((page.path ?? '') + '/')) {
          return apiError('Không thể di chuyển trang vào trang con của nó', 400);
        }
        newDepth = newParent.depth + 1;
        newParentPath = newParent.path;
      }

      const maxResult = await prisma.page.aggregate({
        where: { userId: user.id, parentId: newParentId ?? null, isDeleted: false },
        _max: { sortOrder: true },
      });
      const nextSortOrder = (maxResult._max.sortOrder ?? 0) + 1;
      const oldPath = page.path;
      const newPath = newParentPath ? `${newParentPath}/${id}` : `/${id}`;
      const depthDelta = newDepth - page.depth;

      const updated = await prisma.page.update({
        where: { id },
        data: { parentId: newParentId ?? null, depth: newDepth, sortOrder: nextSortOrder, path: newPath },
      });

      if (oldPath) {
        const descendants = await prisma.page.findMany({
          where: { userId: user.id, path: { startsWith: oldPath + '/' }, isDeleted: false },
        });
        for (const desc of descendants) {
          const newDescPath = desc.path!.replace(oldPath, newPath);
          await prisma.page.update({ where: { id: desc.id }, data: { path: newDescPath, depth: desc.depth + depthDelta } });
        }
      }

      return apiSuccess(mapToDetail(updated), 'Di chuyển trang thành công');
    }
    case 'toggle': {
      const { blockId, checked } = body as { blockId: string; checked: boolean };
      const content = page.content as any;
      if (!content?.blocks) return apiError('Không tìm thấy block', 404);
      const blocks = [...content.blocks];
      const idx = blocks.findIndex((b: any) => b.id === blockId);
      if (idx === -1) return apiError('Không tìm thấy block', 404);
      if (blocks[idx].type !== 'todo') return apiError('Block không hỗ trợ toggle', 400);
      blocks[idx] = { ...blocks[idx], checked };
      const updated = await prisma.page.update({ where: { id }, data: { content: { ...content, blocks } } });
      return apiSuccess(mapToDetail(updated), 'Cập nhật checklist thành công');
    }
    default:
      return apiError('Endpoint không hợp lệ', 404);
  }
}

function mapToDetail(p: any) {
  return {
    id: p.id, parentId: p.parentId, title: p.title, content: p.content,
    icon: p.icon, coverUrl: p.coverUrl, pageType: p.pageType, pageKind: p.pageKind,
    sortOrder: p.sortOrder, depth: p.depth, path: p.path, isFavorite: p.isFavorite,
    isArchived: p.isArchived, createdAt: p.createdAt, updatedAt: p.updatedAt,
  };
}
