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

    // ─── API Routes ────────────────────────────────────────────────
    // Auth API
    route("api/auth/register", "routes/api/auth.register.ts"),
    route("api/auth/login", "routes/api/auth.login.ts"),
    route("api/auth/logout", "routes/api/auth.logout.ts"),
    route("api/auth/me", "routes/api/auth.me.ts"),

    // Pages API — specific routes trước, generic sau
    route("api/pages/tree", "routes/api/pages.tree.ts"),
    route("api/pages/search", "routes/api/pages.search.ts"),
    route("api/pages", "routes/api/pages._index.ts"),
    route("api/pages/:id/duplicate", "routes/api/pages.$id.duplicate.ts"),
    route("api/pages/:id/:suffix", "routes/api/pages.$id.$suffix.ts"),
    route("api/pages/:id", "routes/api/pages.$id.ts"),



    // Templates API
    route("api/page-templates/type/:pageType", "routes/api/page-templates.type.$pageType.ts"),
    route("api/page-templates", "routes/api/page-templates.ts"),

    // Users API
    route("api/users/me/password", "routes/api/users.me.password.ts"),
    route("api/users/me", "routes/api/users.me.ts"),


    // Upload API
    route("api/upload", "routes/api/upload.ts"),

] satisfies RouteConfig;
