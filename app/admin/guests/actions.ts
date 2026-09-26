"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/app/admin/actions";
import { describeGuestTableError } from "@/lib/supabase/errors";
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
 * Các action dưới đây TRẢ VỀ lỗi thay vì throw: một Server Action throw thì
 * production build của Next.js nuốt message ("An error occurred in the Server
 * Components render...") và chỉ để lại digest — admin đứng trước màn hình
 * không biết chuyện gì xảy ra. Trả về message thì hiện được nguyên văn.
 */
export type GuestActionResult<T = object> =
  | ({ ok: true } & T)
  | { ok: false; message: string };

function failed(message: string): { ok: false; message: string } {
  return { ok: false, message };
}

/**
 * Tạo hoặc cập nhật (upsert theo slug) một khách mời — cho phép admin "tạo
 * lại" cùng một slug để sửa tên/lời chào mà không cần xoá trước.
 */
export async function createGuest({
  name,
  slug,
  greeting,
}: CreateGuestInput): Promise<GuestActionResult<{ slug: string }>> {
  const trimmedName = name.trim();
  if (!trimmedName) return failed("Vui lòng nhập tên người nhận.");

  const finalSlug = (slug?.trim() || slugify(trimmedName)).toLowerCase();
  if (!finalSlug) return failed("Không tạo được đường dẫn từ tên này.");
  if (!SLUG_PATTERN.test(finalSlug)) {
    return failed("Đường dẫn chỉ được chứa chữ thường, số và dấu gạch ngang.");
  }

  let supabase;
  try {
    supabase = await requireAdminClient();
  } catch (err) {
    return failed(err instanceof Error ? err.message : "Không kết nối được Supabase.");
  }

  const { error } = await supabase
    .from("wedding_guests")
    .upsert({ slug: finalSlug, name: trimmedName, greeting: greeting?.trim() || null });

  if (error) {
    console.error("[admin/guests] create failed:", error.code, error.message);
    return failed(describeGuestTableError(error));
  }

  revalidateGuestPaths(finalSlug);
  return { ok: true, slug: finalSlug };
}

export async function deleteGuest(slug: string): Promise<GuestActionResult> {
  let supabase;
  try {
    supabase = await requireAdminClient();
  } catch (err) {
    return failed(err instanceof Error ? err.message : "Không kết nối được Supabase.");
  }

  const { error } = await supabase.from("wedding_guests").delete().eq("slug", slug);
  if (error) {
    console.error("[admin/guests] delete failed:", error.code, error.message);
    return failed(describeGuestTableError(error));
  }

  revalidateGuestPaths(slug);
  return { ok: true };
}
