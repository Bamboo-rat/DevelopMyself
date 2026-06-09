import type { Route } from "./+types/home";
import Welcome from "~/pages/Welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Phát triển bản thân" },
    { name: "description", content: "Chào mừng bạn đến với trang web của mình!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
