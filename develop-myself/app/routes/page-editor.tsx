import type { Route } from "./+types/page-editor";
import PageEditor from "~/pages/PageEditor";
import { useParams } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chỉnh sửa trang - DevMyself" },
  ];
}

export default function PageEditorRoute() {
  const params = useParams();
  return <PageEditor key={params.pageId} />;
}
