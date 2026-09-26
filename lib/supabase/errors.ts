/**
 * Postgres (42P01) và PostgREST (PGRST205) báo "bảng không tồn tại" bằng hai
 * mã khác nhau tuỳ lỗi bị bắt ở tầng nào.
 */
const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205"]);

export const MISSING_GUESTS_TABLE_MESSAGE =
  "Chưa có bảng wedding_guests trong Supabase. Mở Supabase Dashboard → SQL Editor và chạy lại supabase/schema.sql, rồi tải lại trang.";

type SupabaseErrorLike = { code?: string | null; message: string };

/**
 * Message tiếng Việt cho lỗi đọc/ghi bảng wedding_guests. Trường hợp hay gặp
 * nhất là quên chạy schema.sql sau khi deploy — khi đó message gốc của
 * PostgREST ("Could not find the table ... in the schema cache") không nói
 * cho admin biết phải làm gì.
 */
export function describeGuestTableError(error: SupabaseErrorLike): string {
  if (error.code && MISSING_TABLE_CODES.has(error.code)) {
    return MISSING_GUESTS_TABLE_MESSAGE;
  }
  return error.message;
}
