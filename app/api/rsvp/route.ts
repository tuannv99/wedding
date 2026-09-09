import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toWishRow } from "@/lib/wishes";
import { isRateLimited } from "@/lib/rate-limit";

const MIN_FILL_TIME_MS = 1500;

/**
 * Endpoint nhận xác nhận tham dự.
 *
 * Việc tham dự (name/attending/guests) hiện chỉ validate + ghi log (chạy tốt
 * trên Vercel mà không cần cấu hình gì) — khi cần lưu thật, thay phần "TODO"
 * bằng một trong các cách sau: Google Sheets API/Form, Postgres, Notion,
 * Airtable, hoặc gửi email qua Resend.
 *
 * Riêng ô "Lời chúc" thì ĐÃ nối vào cùng bảng wedding_wishes với form ở
 * /wishes — khách RSVP kèm lời chúc không cần gửi lại ở trang riêng, lời
 * chúc vẫn vào hàng chờ is_approved=false như mọi lời chúc khác.
 */

type RsvpBody = {
  name?: unknown;
  attending?: unknown;
  guests?: unknown;
  message?: unknown;
  /** Honeypot — bot tự điền hết field thường điền luôn cả field ẩn này. */
  company?: unknown;
  /** Thời điểm form load (ms) phía client, để phát hiện submit "quá nhanh". */
  formLoadedAt?: unknown;
};

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMITED" },
      { status: 429 },
    );
  }

  let body: RsvpBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON" },
      { status: 400 },
    );
  }

  // Bot lộ diện qua honeypot hoặc submit nhanh bất thường — trả về "thành
  // công" giả để không cho bot biết nó đã bị phát hiện (chỉ là không ghi gì
  // cả), thay vì trả lỗi giúp bot tự hiệu chỉnh lại hành vi.
  const honeypot = typeof body.company === "string" ? body.company.trim() : "";
  const formLoadedAt =
    typeof body.formLoadedAt === "number" ? body.formLoadedAt : 0;
  const filledInMs = Date.now() - formLoadedAt;

  if (honeypot.length > 0 || !formLoadedAt || filledInMs < MIN_FILL_TIME_MS) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const attending = body.attending === "no" ? "no" : "yes";
  const guests =
    typeof body.guests === "number" && Number.isFinite(body.guests)
      ? Math.min(Math.max(Math.trunc(body.guests), 0), 20)
      : 0;
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 1 || name.length > 120) {
    return NextResponse.json(
      { ok: false, error: "INVALID_NAME" },
      { status: 422 },
    );
  }

  const entry = {
    name,
    attending,
    guests,
    message: message.slice(0, 1000),
    createdAt: new Date().toISOString(),
  };

  // TODO: lưu `entry` vào database / Google Sheets / gửi email.
  console.log("[RSVP]", entry);

  // Có viết lời chúc thì lưu luôn vào wedding_wishes — best-effort, không
  // chặn việc xác nhận tham dự nếu bước này lỗi (chưa cấu hình Supabase,
  // mất mạng...): khách đã chờ đủ lâu cho một request rồi.
  if (entry.message) {
    try {
      const supabase = await createSupabaseServerClient();
      if (supabase) {
        const wishRow = toWishRow(entry.name, entry.message);
        const { error } = await supabase
          .from("wedding_wishes")
          .insert({ name: wishRow.name, message: wishRow.message, is_approved: false });
        if (error) console.error("[rsvp] wish insert failed:", error.message);
      }
    } catch (err) {
      console.error("[rsvp] wish insert threw:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
