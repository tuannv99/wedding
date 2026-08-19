import { NextResponse } from "next/server";

/**
 * Endpoint nhận xác nhận tham dự.
 *
 * Hiện tại chỉ validate + ghi log (chạy tốt trên Vercel mà không cần cấu hình gì).
 * Khi cần lưu thật, thay phần "TODO" bằng một trong các cách sau:
 *   - Google Sheets API / Google Form
 *   - Supabase / Neon / Postgres (@vercel/postgres)
 *   - Notion API, Airtable, hoặc gửi email qua Resend
 */

type RsvpBody = {
  name?: unknown;
  attending?: unknown;
  guests?: unknown;
  message?: unknown;
};

export async function POST(request: Request) {
  let body: RsvpBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON" },
      { status: 400 },
    );
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

  return NextResponse.json({ ok: true });
}
