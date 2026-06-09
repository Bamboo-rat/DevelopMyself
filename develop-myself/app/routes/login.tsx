import type { Route } from "./+types/login";
import Login from "~/pages/auth/Login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Đăng nhập | Phát triển bản thân" },
    { name: "description", content: "Đăng nhập vào hệ thống" },
  ];
}

export default function LoginPage() {
  return <Login />;
}
