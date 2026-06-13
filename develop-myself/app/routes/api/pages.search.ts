/**
 * GET /api/pages/search?keyword=abc&type=NOTE
 */
import { prisma } from '~/lib/prisma.server';
import { requireUser } from '~/lib/auth.server';
import { apiSuccess } from '~/lib/api-utils';
import type { PageType } from '~/lib/prisma.types';

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  const url = new URL(request.url);
  const keyword = url.searchParams.get('keyword') ?? '';
  const type = url.searchParams.get('type') as PageType | null;

  const pages = await prisma.page.findMany({
    where: {
      userId: user.id,
      isDeleted: false,
      ...(keyword && {
        title: { contains: keyword, mode: 'insensitive' },
      }),
      ...(type && { pageType: type }),
    },
    orderBy: { updatedAt: 'desc' },
    take: 20,
    select: {
      id: true,
      parentId: true,
      title: true,
      icon: true,
      pageType: true,
      pageKind: true,
      sortOrder: true,
      depth: true,
    },
  });

  return apiSuccess(pages.map((p) => ({ ...p, children: [] })));
}
