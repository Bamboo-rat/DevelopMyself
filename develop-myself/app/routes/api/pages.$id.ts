/**
 * GET    /api/pages/:id         — Chi tiết page
 * PATCH  /api/pages/:id         — Cập nhật (title/content/icon/type/sort/parent/archive)
 * DELETE /api/pages/:id         — Soft delete
 */
import { prisma } from '~/lib/prisma.server';
import { requireUser } from '~/lib/auth.server';
import { apiError, apiSuccess } from '~/lib/api-utils';

// ─── Loader: GET page detail ───────────────────────────────────────────────
export async function loader({ request, params }: { request: Request; params: { id: string } }) {
  const user = await requireUser(request);
  const { id } = params;

  const page = await findAndVerify(id, user.id);
  if (!page) return apiError('Trang không tồn tại hoặc không có quyền truy cập', 404);

  return apiSuccess(mapToDetail(page));
}

// ─── Action: PATCH / DELETE ────────────────────────────────────────────────
export async function action({ request, params }: { request: Request; params: { id: string } }) {
  const user = await requireUser(request);
  const { id } = params;

  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  // /api/pages/:id/title → suffix = 'title'
  const suffix = segments[segments.length - 1] !== id ? segments[segments.length - 1] : null;

  // DELETE
  if (request.method === 'DELETE') {
    const page = await findAndVerify(id, user.id);
    if (!page) return apiError('Trang không tồn tại', 404);
    if (page.isDeleted) return apiError('Trang đã bị xóa', 400);

    const now = new Date();
    await prisma.page.update({ where: { id }, data: { isDeleted: true, deletedAt: now } });

    // Cascade soft delete descendants theo path prefix
    if (page.path) {
      await prisma.page.updateMany({
        where: { userId: user.id, path: { startsWith: page.path + '/' }, isDeleted: false },
        data: { isDeleted: true, deletedAt: now },
      });
    }

    return apiSuccess(null, 'Xóa trang thành công');
  }

  // PATCH
  if (request.method === 'PATCH') {
    const page = await findAndVerify(id, user.id);
    if (!page) return apiError('Trang không tồn tại', 404);

    const body = await request.json();

    // /api/pages/:id/title
    if (suffix === 'title') {
      const updated = await prisma.page.update({
        where: { id },
        data: { title: body.title },
      });
      return apiSuccess(mapToDetail(updated), 'Cập nhật tiêu đề thành công');
    }

    // /api/pages/:id/content
    if (suffix === 'content') {
      const updated = await prisma.page.update({
        where: { id },
        data: { content: body.content },
      });
      return apiSuccess(mapToDetail(updated), 'Cập nhật nội dung thành công');
    }

    // /api/pages/:id/icon
    if (suffix === 'icon') {
      const updated = await prisma.page.update({
        where: { id },
        data: { icon: body.icon ?? null },
      });
      return apiSuccess(mapToDetail(updated), 'Đổi icon thành công');
    }

    // /api/pages/:id/type
    if (suffix === 'type') {
      const updated = await prisma.page.update({
        where: { id },
        data: { pageType: body.pageType },
      });
      return apiSuccess(mapToDetail(updated), 'Đổi loại trang thành công');
    }

    // /api/pages/:id/sort-order
    if (suffix === 'sort-order') {
      const updated = await prisma.page.update({
        where: { id },
        data: { sortOrder: body.sortOrder },
      });
      return apiSuccess(mapToDetail(updated), 'Cập nhật thứ tự thành công');
    }

    // /api/pages/:id/archive
    if (suffix === 'archive') {
      const updated = await prisma.page.update({
        where: { id },
        data: { isArchived: body.archived },
      });
      const msg = body.archived ? 'Lưu trữ trang thành công' : 'Khôi phục trang thành công';
      return apiSuccess(mapToDetail(updated), msg);
    }

    // /api/pages/:id/parent — Di chuyển sang parent khác
    if (suffix === 'parent') {
      const { newParentId } = body as { newParentId: string | null };

      // Circular reference check
      if (newParentId === id) return apiError('Không thể di chuyển trang vào chính nó', 400);
      if (page.path && newParentId) {
        const newParentPage = await prisma.page.findUnique({ where: { id: newParentId } });
        if (newParentPage?.path?.startsWith(page.path + '/')) {
          return apiError('Không thể di chuyển trang vào trang con của nó', 400);
        }
      }

      let newDepth = 0;
      let newParentPath: string | null = null;
      if (newParentId) {
        const newParent = await findAndVerify(newParentId, user.id);
        if (!newParent) return apiError('Parent page không tồn tại', 404);
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
        data: {
          parentId: newParentId ?? null,
          depth: newDepth,
          sortOrder: nextSortOrder,
          path: newPath,
        },
      });

      // Cập nhật path và depth của descendants
      if (oldPath) {
        const descendants = await prisma.page.findMany({
          where: { userId: user.id, path: { startsWith: oldPath + '/' }, isDeleted: false },
        });
        for (const desc of descendants) {
          const newDescPath = desc.path!.replace(oldPath, newPath);
          await prisma.page.update({
            where: { id: desc.id },
            data: { path: newDescPath, depth: desc.depth + depthDelta },
          });
        }
      }

      return apiSuccess(mapToDetail(updated), 'Di chuyển trang thành công');
    }

    // /api/pages/:id/blocks/toggle
    if (suffix === 'toggle') {
      const { blockId, checked } = body as { blockId: string; checked: boolean };
      const content = page.content as any;
      if (!content?.blocks) return apiError('Không tìm thấy block', 404);

      const blocks = [...content.blocks];
      const blockIndex = blocks.findIndex((b: any) => b.id === blockId);
      if (blockIndex === -1) return apiError('Không tìm thấy block', 404);
      if (blocks[blockIndex].type !== 'todo') return apiError('Block không hỗ trợ toggle', 400);

      blocks[blockIndex] = { ...blocks[blockIndex], checked };
      const updated = await prisma.page.update({
        where: { id },
        data: { content: { ...content, blocks } },
      });
      return apiSuccess(mapToDetail(updated), 'Cập nhật checklist thành công');
    }

    return apiError('Endpoint không hợp lệ', 404);
  }

  return apiError('Method not allowed', 405);
}

// ─── Helpers ───────────────────────────────────────────────────────────────
async function findAndVerify(pageId: string, userId: string) {
  return prisma.page.findFirst({
    where: { id: pageId, userId, isDeleted: false },
  });
}

function mapToDetail(p: any) {
  return {
    id: p.id,
    parentId: p.parentId,
    title: p.title,
    content: p.content,
    icon: p.icon,
    coverUrl: p.coverUrl,
    pageType: p.pageType,
    pageKind: p.pageKind,
    sortOrder: p.sortOrder,
    depth: p.depth,
    path: p.path,
    isFavorite: p.isFavorite,
    isArchived: p.isArchived,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
