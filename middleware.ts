import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Bảo vệ /admin/*: chưa đăng nhập thì đá về /admin/login.
 * Đồng thời refresh session cookie của Supabase trên mọi request tới /admin
 * (đúng pattern chính thức của @supabase/ssr cho Next.js middleware) — nếu
 * không làm bước này, access token hết hạn giữa chừng sẽ khiến Server
 * Component đọc session cũ/lỗi dù cookie vẫn còn.
 *
 * Nếu chưa cấu hình env Supabase, cho qua thẳng — /admin/wishes tự hiện
 * thông báo "chưa cấu hình" thay vì redirect-loop vô nghĩa.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginPage) {
    const wishesUrl = new URL("/admin/wishes", request.url);
    return NextResponse.redirect(wishesUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
