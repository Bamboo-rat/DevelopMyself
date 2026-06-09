import type { Route } from "./+types/dashboard";
import Dashboard from "~/pages/Dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Phát triển bản thân" },
    { name: "description", content: "Chào mừng bạn đến với trang web của mình!" },
  ];
}

export default function Home() {
  return <Dashboard />;
}
