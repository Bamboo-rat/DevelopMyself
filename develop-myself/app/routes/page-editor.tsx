import type { Route } from "./+types/page-editor";
import PageEditor from "~/pages/PageEditor";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chỉnh sửa trang - DevMyself" },
  ];
}

export default function PageEditorRoute() {
  return <PageEditor />;
}
