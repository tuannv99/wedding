import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildGuestInvitation, type GuestInvitation } from "@/lib/guest-invitation";

export type Guest = {
  name: string;
  /**
   * Lời chào đứng trước tên trên thiệp, ví dụ "Gửi bạn yêu" cho bạn thân
   * thay vì "Gửi bạn" mặc định. Chỉ dùng cho khách chưa có cách xưng hô.
   */
  greeting?: string;
};

/**
 * Vài khách mẫu — chỉ dùng khi CHƯA cấu hình Supabase (dev local không có
 * .env.local) hoặc slug không có trong bảng wedding_guests. Khách thật thêm
 * qua /admin/guests, không cần sửa file này nữa.
 */
export const guests: Record<string, Guest> = {
  linh: { name: "Linh" },
  minh: { name: "Minh" },
  tuan: { name: "Tuấn" },
  "nguyen-van-minh": { name: "Nguyễn Văn Minh" },
  "tran-thi-linh": { name: "Trần Thị Linh" },
  "nguyen-van-tuan": { name: "Nguyễn Văn Tuấn" },
  "minh-giang": { name: "Minh Giang", greeting: "Gửi bạn yêu" },
};

type GuestRow = {
  name: string;
  greeting: string | null;
  display_name?: string | null;
  pronoun?: string | null;
};

/**
 * Đọc một khách từ wedding_guests. Nếu database chưa chạy bản schema.sql có
 * cột display_name/pronoun thì câu select đầy đủ báo lỗi cột không tồn tại —
 * khi đó đọc lại chỉ với các cột cũ, để link đã gửi vẫn chạy trong lúc chưa
 * migrate.
 */
async function fetchGuestRow(slug: string): Promise<GuestRow | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const full = await supabase
    .from("wedding_guests")
    .select("name, greeting, display_name, pronoun")
    .eq("slug", slug)
    .maybeSingle();
  if (!full.error) return full.data;

  console.error("[guests] fetch failed, retrying legacy columns:", full.error.message);
  const legacy = await supabase
    .from("wedding_guests")
    .select("name, greeting")
    .eq("slug", slug)
    .maybeSingle();
  if (legacy.error) console.error("[guests] legacy fetch failed:", legacy.error.message);
  return legacy.data ?? null;
}

/**
 * Lời mời cá nhân hoá (đã áp cách xưng hô / mặc định) cho một slug.
 *
 * Ưu tiên đọc từ bảng wedding_guests (admin tự thêm qua /admin/guests, có
 * hiệu lực ngay không cần deploy) — rơi về danh sách mẫu ở trên nếu chưa cấu
 * hình Supabase hoặc slug không có trong bảng. Trả null nếu không tìm thấy ở
 * đâu cả; nơi gọi (app/[guest]/page.tsx) tự fallback về thiệp mặc định.
 */
export async function getGuest(slug: string): Promise<GuestInvitation | null> {
  const normalized = slug.toLowerCase();

  const row = await fetchGuestRow(normalized);
  if (row) {
    return buildGuestInvitation({
      name: row.name,
      greeting: row.greeting,
      displayName: row.display_name,
      pronoun: row.pronoun,
    });
  }

  const guest = guests[normalized];
  return guest ? buildGuestInvitation(guest) : null;
}
