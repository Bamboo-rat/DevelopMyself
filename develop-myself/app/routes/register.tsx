import type { Route } from "./+types/register";
import Register from "~/pages/auth/Register";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Đăng ký | Phát triển bản thân" },
    { name: "description", content: "Tạo tài khoản mới" },
  ];
}

export default function RegisterPage() {
  return <Register />;
}
