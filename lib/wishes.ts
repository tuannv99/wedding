/** Kiểu dữ liệu + giới hạn dùng chung giữa API route, trang /wishes và admin. */

export type Wish = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  isApproved: boolean;
};

export const WISH_NAME_MAX = 80;
export const WISH_MESSAGE_MAX = 500;

/** Khớp đúng constraint check trong supabase/schema.sql. */
export function validateWish(input: { name?: unknown; message?: unknown }) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";

  if (!name) return { ok: false as const, error: "Bạn cho chúng mình biết tên nhé." };
  if (name.length > WISH_NAME_MAX)
    return { ok: false as const, error: `Tên chỉ nên dưới ${WISH_NAME_MAX} ký tự thôi nhé.` };
  if (!message) return { ok: false as const, error: "Bạn viết vài dòng lời chúc nhé." };
  if (message.length > WISH_MESSAGE_MAX)
    return {
      ok: false as const,
      error: `Lời chúc chỉ nên dưới ${WISH_MESSAGE_MAX} ký tự thôi nhé.`,
    };

  return { ok: true as const, name, message };
}

/** Định dạng ngày kiểu "25 · 10 · 2026" — khớp phong cách số ngày cưới hiện có. */
export function formatWishDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day} · ${month} · ${year}`;
}
