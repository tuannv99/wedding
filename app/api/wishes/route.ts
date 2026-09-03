import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateWish } from "@/lib/wishes";

/**
 * Nhận lời chúc mới từ khách. Khớp pattern với /api/rsvp: validate rồi ghi.
 * Luôn insert is_approved=false — RLS trong supabase/schema.sql còn chặn ở
 * tầng database nữa nên dù route này có bug cũng không lộ được lời chúc chưa
 * duyệt ra công khai.
 */
type WishBody = {
  name?: unknown;
  message?: unknown;
  /** Honeypot: field ẩn, người thật không điền. Bot tự động thường điền hết mọi field. */
  company?: unknown;
  /** epoch ms lúc form được render — chặn bot submit tức thì (<1.5s). */
  formLoadedAt?: unknown;
};

export async function POST(request: Request) {
  let body: WishBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  // Honeypot dính bẫy → giả vờ thành công, không insert, không cho bot biết nó bị chặn.
  if (typeof body.company === "string" && body.company.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const loadedAt = typeof body.formLoadedAt === "number" ? body.formLoadedAt : 0;
  if (loadedAt > 0 && Date.now() - loadedAt < 1500) {
    return NextResponse.json(
      { ok: false, error: "TOO_FAST" },
      { status: 422 },
    );
  }

  const validated = validateWish(body);
  if (!validated.ok) {
    return NextResponse.json({ ok: false, error: validated.error }, { status: 422 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Chưa cấu hình database, bạn quay lại sau giúp mình nhé." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("wedding_wishes").insert({
    name: validated.name,
    message: validated.message,
    is_approved: false,
  });

  if (error) {
    console.error("[wishes] insert failed:", error.message);
    return NextResponse.json(
      { ok: false, error: "Gửi chưa thành công, bạn thử lại giúp mình nhé." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
