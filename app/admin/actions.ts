"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Dùng chung cho mọi Server Action ở /admin/* — chạy trên server, không lộ ra
 * network tab như một API route công khai. middleware.ts + RLS đã chặn truy
 * cập trái phép, nhưng mỗi action vẫn tự kiểm tra session lần nữa (defense in
 * depth): không tin tưởng tuyệt đối vào một lớp bảo vệ duy nhất.
 */
export async function requireAdminClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Chưa cấu hình Supabase.");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Bạn cần đăng nhập.");

  return supabase;
}

export async function signOutAdmin() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
