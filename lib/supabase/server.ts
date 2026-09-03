import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Client Supabase dùng trong Server Component / Route Handler / Server Action.
 * Đọc/ghi session qua cookie theo đúng pattern chính thức của @supabase/ssr.
 *
 * set/remove được bọc try/catch: gọi từ một Server Component (render) không
 * được phép ghi cookie — Next.js sẽ throw. Bỏ qua lỗi đó là an toàn vì
 * middleware.ts đã lo phần refresh session trên mọi request rồi.
 *
 * Trả về null nếu chưa cấu hình env (chưa có Supabase project thật) — nơi gọi
 * tự xử lý thành empty state thay vì để trang crash.
 */
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Gọi từ Server Component render — bỏ qua, middleware đã refresh session.
        }
      },
    },
  });
}
