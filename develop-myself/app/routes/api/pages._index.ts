/**
 * POST /api/pages — Tạo page mới
 */
import { prisma } from '~/lib/prisma.server';
import { requireUser } from '~/lib/auth.server';
import { apiError } from '~/lib/api-utils';
import type { PageType, PageKind } from '~/lib/prisma.types';

export async function action({ request }: { request: Request }) {
  const user = await requireUser(request);

  if (request.method !== 'POST') {
    return apiError('Method not allowed', 405);
  }

  try {
    const body = await request.json();
    const {
      title,
      parentId,
      pageType,
      pageKind,
      icon,
      templateId,
    }: {
      title: string;
      parentId?: string | null;
      pageType?: PageType;
      pageKind?: PageKind;
      icon?: string;
      templateId?: string;
    } = body;

    if (!title) {
      return apiError('Tiêu đề không được để trống');
    }

    let depth = 0;
    let parentPath: string | null = null;

    if (parentId) {
      const parent = await prisma.page.findFirst({
        where: { id: parentId, userId: user.id, isDeleted: false },
      });
      if (!parent) return apiError('Parent page không tồn tại hoặc không có quyền truy cập', 404);
      depth = parent.depth + 1;
      parentPath = parent.path;
    }

    const maxResult = await prisma.page.aggregate({
      where: { userId: user.id, parentId: parentId ?? null, isDeleted: false },
      _max: { sortOrder: true },
    });
    const nextSortOrder = (maxResult._max.sortOrder ?? 0) + 1;

    let initialContent: any = {};
    if (pageKind !== 'FOLDER' && templateId) {
      const template = await prisma.pageTemplate.findUnique({ where: { id: templateId } });
      if (template) initialContent = template.defaultContent;
    }

    const page = await prisma.page.create({
      data: {
        userId: user.id,
        parentId: parentId ?? null,
        title,
        content: initialContent,
        icon: icon ?? null,
        pageType: pageType ?? 'NOTE',
        pageKind: pageKind ?? 'DOCUMENT',
        sortOrder: nextSortOrder,
        depth,
        isFavorite: false,
        isArchived: false,
        isDeleted: false,
        path: '',
      },
    });

    const path = parentPath ? `${parentPath}/${page.id}` : `/${page.id}`;
    const updated = await prisma.page.update({
      where: { id: page.id },
      data: { path },
    });

    return Response.json(
      {
        success: true,
        message: 'Tạo trang thành công',
        data: {
          id: updated.id,
          parentId: updated.parentId,
          title: updated.title,
          content: updated.content,
          icon: updated.icon,
          coverUrl: updated.coverUrl,
          pageType: updated.pageType,
          pageKind: updated.pageKind,
          sortOrder: updated.sortOrder,
          depth: updated.depth,
          path: updated.path,
          isFavorite: updated.isFavorite,
          isArchived: updated.isArchived,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[pages] create error:', error);
    return apiError('Lỗi server: ' + error.message, 500);
  }
}
