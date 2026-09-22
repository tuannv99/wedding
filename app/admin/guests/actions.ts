"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/app/admin/actions";
import { slugify } from "@/lib/guest-link";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function revalidateGuestPaths(slug: string) {
  revalidatePath("/admin/guests");
  revalidatePath(`/${slug}`);
}

export type CreateGuestInput = {
  name: string;
  /** Tự sinh từ tên bằng slugify() nếu bỏ trống. */
  slug?: string;
  /** Bỏ trống thì trang tự dùng "Gửi bạn" mặc định. */
  greeting?: string;
};

/**
 * Tạo hoặc cập nhật (upsert theo slug) một khách mời — cho phép admin "tạo
 * lại" cùng một slug để sửa tên/lời chào mà không cần xoá trước.
 */
export async function createGuest({ name, slug, greeting }: CreateGuestInput) {
  const trimmedName = name.trim();
  if (!trimmedName) throw new Error("Vui lòng nhập tên người nhận.");

  const finalSlug = (slug?.trim() || slugify(trimmedName)).toLowerCase();
  if (!finalSlug) throw new Error("Không tạo được đường dẫn từ tên này.");
  if (!SLUG_PATTERN.test(finalSlug)) {
    throw new Error("Đường dẫn chỉ được chứa chữ thường, số và dấu gạch ngang.");
  }

  const supabase = await requireAdminClient();
  const { error } = await supabase
    .from("wedding_guests")
    .upsert({ slug: finalSlug, name: trimmedName, greeting: greeting?.trim() || null });

  if (error) throw new Error(error.message);

  revalidateGuestPaths(finalSlug);
  return { slug: finalSlug };
}

export async function deleteGuest(slug: string) {
  const supabase = await requireAdminClient();
  const { error } = await supabase.from("wedding_guests").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidateGuestPaths(slug);
}
