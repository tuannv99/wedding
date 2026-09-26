/**
 * Postgres (42P01) và PostgREST (PGRST205) báo "bảng không tồn tại" bằng hai
 * mã khác nhau tuỳ lỗi bị bắt ở tầng nào.
 */
const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205"]);

/**
 * Tương tự cho "cột không tồn tại": 42703 khi select, PGRST204 khi
 * insert/upsert — gặp khi đã deploy code mới (display_name/pronoun) nhưng
 * chưa chạy lại schema.sql.
 */
export const MISSING_COLUMN_CODES = new Set(["42703", "PGRST204"]);

export const MISSING_GUESTS_TABLE_MESSAGE =
  "Chưa có bảng wedding_guests trong Supabase. Mở Supabase Dashboard → SQL Editor và chạy lại supabase/schema.sql, rồi tải lại trang.";

export const MISSING_GUESTS_COLUMNS_MESSAGE =
  "Bảng wedding_guests chưa có cột cách xưng hô (display_name, pronoun). Mở Supabase Dashboard → SQL Editor và chạy lại supabase/schema.sql, rồi tải lại trang.";

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
  if (error.code && MISSING_COLUMN_CODES.has(error.code)) {
    return MISSING_GUESTS_COLUMNS_MESSAGE;
  }
  return error.message;
}
