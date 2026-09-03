"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server Actions cho /admin/wishes — chạy trên server, không lộ ra network
 * tab như một API route công khai. middleware.ts + RLS đã chặn truy cập trái
 * phép, nhưng mỗi action vẫn tự kiểm tra session lần nữa (defense in depth):
 * không tin tưởng tuyệt đối vào một lớp bảo vệ duy nhất.
 */
async function requireAdminClient() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Chưa cấu hình Supabase.");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Bạn cần đăng nhập.");

  return supabase;
}

function revalidateWishPaths() {
  revalidatePath("/admin/wishes");
  revalidatePath("/wishes");
  revalidatePath("/");
}

export async function approveWish(id: string) {
  const supabase = await requireAdminClient();
  const { error } = await supabase
    .from("wedding_wishes")
    .update({ is_approved: true })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateWishPaths();
}

export async function unapproveWish(id: string) {
  const supabase = await requireAdminClient();
  const { error } = await supabase
    .from("wedding_wishes")
    .update({ is_approved: false })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidateWishPaths();
}

export async function deleteWish(id: string) {
  const supabase = await requireAdminClient();
  const { error } = await supabase.from("wedding_wishes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateWishPaths();
}

export async function signOutAdmin() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
