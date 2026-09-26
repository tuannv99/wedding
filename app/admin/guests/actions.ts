"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/app/admin/actions";
import { describeGuestTableError } from "@/lib/supabase/errors";
import { slugify } from "@/lib/guest-link";
import { deriveDisplayName, isGuestPronoun, type GuestPronoun } from "@/lib/guest-invitation";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function revalidateGuestPaths(slug: string) {
  revalidatePath("/admin/guests");
  revalidatePath(`/${slug}`);
}

export type CreateGuestInput = {
  /** Họ tên đầy đủ. */
  name: string;
  /** Tự sinh từ tên bằng slugify() nếu bỏ trống. */
  slug?: string;
  /** Tên gọi trên thiệp — bỏ trống thì lấy từ cuối của họ tên. */
  displayName?: string;
  pronoun: GuestPronoun;
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
 * lại" cùng một slug để sửa tên/xưng hô mà không cần xoá trước (form admin
 * dùng đúng cách này cho nút "Sửa").
 */
export async function createGuest({
  name,
  slug,
  displayName,
  pronoun,
}: CreateGuestInput): Promise<GuestActionResult<{ slug: string }>> {
  const trimmedName = name.trim();
  if (!trimmedName) return failed("Vui lòng nhập tên người nhận.");
  if (!isGuestPronoun(pronoun)) return failed("Vui lòng chọn cách xưng hô.");

  const finalDisplayName = displayName?.trim() || deriveDisplayName(trimmedName);
  if (finalDisplayName.length > 60) return failed("Tên hiển thị tối đa 60 ký tự.");

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
    .upsert({
      slug: finalSlug,
      name: trimmedName,
      display_name: finalDisplayName,
      pronoun,
      // Lời chào tự do chỉ còn cho link cũ — có pronoun thì lời chào sinh từ đó.
      greeting: null,
    });

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
