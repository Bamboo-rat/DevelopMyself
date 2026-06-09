import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),

    // Dashboard
    route("dashboard", "routes/dashboard.tsx", [
        route(":pageId", "routes/page-editor.tsx")
    ]),

    // Auth
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),

] satisfies RouteConfig;

