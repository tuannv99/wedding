/**
 * Lời mời cá nhân hoá trên thiệp (Hero của /<slug>) — sinh ra từ cách xưng
 * hô admin chọn ở /admin/guests. Không phụ thuộc server nên dùng được cả ở
 * form admin (preview trực tiếp) lẫn lúc render trang khách.
 */

export const GUEST_PRONOUNS = ["anh", "chị", "em", "bạn"] as const;

/** Giá trị lưu ở cột wedding_guests.pronoun. */
export type GuestPronoun = (typeof GUEST_PRONOUNS)[number];

type PronounConfig = {
  /** Nhãn trong dropdown admin. */
  label: string;
  /** "Gửi <greetingPronoun> Hiếu," */
  greetingPronoun: string;
  /** "Trân trọng mời <invitationPronoun> đến dự lễ cưới…" */
  invitationPronoun: string;
  /** "…lễ cưới của <couplePronoun>.." — cô dâu chú rể tự xưng với khách. */
  couplePronoun: string;
};

export const guestPronounConfig: Record<GuestPronoun, PronounConfig> = {
  anh: {
    label: "Anh",
    greetingPronoun: "anh",
    invitationPronoun: "anh",
    couplePronoun: "chúng em",
  },
  chị: {
    label: "Chị",
    greetingPronoun: "chị",
    invitationPronoun: "chị",
    couplePronoun: "chúng em",
  },
  em: {
    label: "Em",
    greetingPronoun: "em",
    invitationPronoun: "em",
    couplePronoun: "chúng anh chị",
  },
  bạn: {
    label: "Bạn",
    greetingPronoun: "bạn",
    invitationPronoun: "bạn",
    couplePronoun: "chúng mình",
  },
};

export const DEFAULT_GUEST_PRONOUN: GuestPronoun = "bạn";

/** Lời chào của link tạo trước khi có cột pronoun mà không đặt lời chào riêng. */
export const LEGACY_DEFAULT_GREETING = "Gửi bạn";

export function isGuestPronoun(value: unknown): value is GuestPronoun {
  return typeof value === "string" && (GUEST_PRONOUNS as readonly string[]).includes(value);
}

/** "Đỗ Ngọc Hiếu" → "Hiếu": tên gọi là từ cuối cùng của họ tên. */
export function deriveDisplayName(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  return words[words.length - 1] ?? "";
}

export type GuestInvitation = {
  /** "Gửi anh" */
  greeting: string;
  /** "Hiếu" */
  name: string;
  /** "Trân trọng mời anh đến dự lễ cưới của chúng em.." */
  message: string;
};

export type GuestInvitationSource = {
  /** Họ tên đầy đủ (cột name). */
  name: string;
  displayName?: string | null;
  pronoun?: string | null;
  /** Lời chào tự do của link cũ (cột greeting). */
  greeting?: string | null;
};

/**
 * Có pronoun → sinh lời mời theo guestPronounConfig, gọi bằng tên hiển thị
 * (admin nhập riêng, không thì lấy từ cuối của họ tên).
 *
 * Không có pronoun (link tạo trước khi có tính năng này) → giữ NGUYÊN cách
 * hiển thị cũ: lời chào tự do (mặc định "Gửi bạn") + tên như đã lưu + câu
 * mời "bạn / chúng mình", để các link đã gửi đi không đổi nội dung.
 */
export function buildGuestInvitation(source: GuestInvitationSource): GuestInvitation {
  if (isGuestPronoun(source.pronoun)) {
    const config = guestPronounConfig[source.pronoun];
    return {
      greeting: `Gửi ${config.greetingPronoun}`,
      name: source.displayName?.trim() || deriveDisplayName(source.name),
      message: `Trân trọng mời ${config.invitationPronoun} đến dự lễ cưới của ${config.couplePronoun}..`,
    };
  }

  const legacy = guestPronounConfig[DEFAULT_GUEST_PRONOUN];
  return {
    greeting: source.greeting?.trim() || LEGACY_DEFAULT_GREETING,
    name: source.name.trim(),
    message: `Trân trọng mời ${legacy.invitationPronoun} đến dự lễ cưới của ${legacy.couplePronoun}..`,
  };
}
