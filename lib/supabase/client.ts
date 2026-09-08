"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase dùng trong Client Component (hiện tại chỉ trang đăng nhập
 * admin cần — lời chúc giờ gửi qua ô "Lời chúc" của form RSVP, validate ở
 * /api/rsvp trên server, không gọi thẳng Supabase từ trình duyệt).
 *
 * Trả về null nếu chưa cấu hình env — cho phép UI hiện thông báo "chưa cấu
 * hình" thay vì crash trắng trang khi chưa có Supabase project thật.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createBrowserClient(url, anonKey);
}
