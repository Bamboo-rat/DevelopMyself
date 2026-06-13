/**
 * GET /api/page-templates          — Danh sách templates
 * GET /api/page-templates/type/:t  — Templates theo loại
 */
import { prisma } from '~/lib/prisma.server';
import { requireUser } from '~/lib/auth.server';
import { apiSuccess } from '~/lib/api-utils';
import type { PageType } from '~/lib/prisma.types';

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  const url = new URL(request.url);
  const segments = url.pathname.split('/');

  // /api/page-templates/type/:pageType
  const typeIndex = segments.indexOf('type');
  if (typeIndex !== -1 && segments[typeIndex + 1]) {
    const pageType = segments[typeIndex + 1] as PageType;
    const templates = await prisma.pageTemplate.findMany({
      where: {
        pageType,
        OR: [{ isSystem: true }, { userId: user.id }],
      },
      orderBy: { createdAt: 'asc' },
    });
    return apiSuccess(templates.map(mapToResponse));
  }

  // /api/page-templates
  const templates = await prisma.pageTemplate.findMany({
    where: {
      OR: [{ isSystem: true }, { userId: user.id }],
    },
    orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
  });

  return apiSuccess(templates.map(mapToResponse));
}

function mapToResponse(t: any) {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    pageType: t.pageType,
    defaultContent: t.defaultContent,
    isSystem: t.isSystem,
  };
}
