/**
 * GET /api/page-templates/type/:pageType — Templates theo loại page
 */
import { prisma } from '~/lib/prisma.server';
import { requireUser } from '~/lib/auth.server';
import { apiSuccess } from '~/lib/api-utils';
import type { PageType } from '~/lib/prisma.types';

export async function loader({ request, params }: { request: Request; params: { pageType: string } }) {
  const user = await requireUser(request);
  const pageType = params.pageType as PageType;

  const templates = await prisma.pageTemplate.findMany({
    where: {
      pageType,
      OR: [{ isSystem: true }, { userId: user.id }],
    },
    orderBy: { createdAt: 'asc' },
  });

  return apiSuccess(templates.map((t) => ({
    id: t.id, name: t.name, description: t.description,
    pageType: t.pageType, defaultContent: t.defaultContent, isSystem: t.isSystem,
  })));
}
