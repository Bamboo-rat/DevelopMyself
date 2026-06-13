/**
 * GET /api/pages/tree — Lấy page tree
 */
import { prisma } from '~/lib/prisma.server';
import { requireUser } from '~/lib/auth.server';
import { apiSuccess } from '~/lib/api-utils';

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);

  const allPages = await prisma.page.findMany({
    where: {
      userId: user.id,
      isDeleted: false,
    },
    orderBy: [{ depth: 'asc' }, { sortOrder: 'asc' }],
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

  // Build tree in-memory (O(n))
  type TreeNode = {
    id: string;
    title: string;
    icon: string | null;
    pageType: string;
    pageKind: string | null;
    sortOrder: number;
    depth: number;
    children: TreeNode[];
  };

  const nodeMap = new Map<string, TreeNode>();
  for (const p of allPages) {
    nodeMap.set(p.id, { ...p, children: [] });
  }

  const roots: TreeNode[] = [];
  for (const p of allPages) {
    const node = nodeMap.get(p.id)!;
    if (!p.parentId) {
      roots.push(node);
    } else {
      const parent = nodeMap.get(p.parentId);
      if (parent) parent.children.push(node);
    }
  }

  return apiSuccess(roots);
}
