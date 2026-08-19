/**
 * Toàn bộ dữ liệu của thiệp cưới nằm trong file này.
 * Muốn đổi tên, ngày, địa điểm, timeline hay ảnh: chỉ sửa ở đây.
 */

export type GalleryImage = {
  src: string;
  alt: string;
  /** Tỉ lệ khung ảnh, dùng cho next/image và layout masonry. */
  width: number;
  height: number;
};

export type TimelineItem = {
  time: string;
  title: string;
};

export const wedding = {
  groom: {
    name: "Văn Tuấn",
    short: "TUẤN",
  },
  bride: {
    name: "Mai Hoa",
    short: "HOA",
  },

  /** Ngày cưới: 20/09/2026 (giờ Việt Nam, UTC+7). */
  date: {
    iso: "2026-09-20",
    /** Mốc countdown = giờ lễ thành hôn. */
    target: "2026-09-20T18:00:00+07:00",
    day: "20",
    month: "09",
    year: "2026",
    weekday: "Chủ Nhật",
    display: "20 · 09 · 2026",
  },

  ceremony: {
    label: "Lễ thành hôn",
    time: "18:00",
  },
  reception: {
    label: "Tiệc cưới",
    time: "18:30",
  },

  venue: {
    // TODO: thay bằng thông tin thật trước khi gửi thiệp.
    name: "[Tên nhà hàng tiệc cưới]",
    address: "[Số nhà, đường, phường/xã, tỉnh/thành phố]",
    mapsUrl: "https://maps.google.com",
  },

  story: [
    "Một ngày bình thường,\nchúng mình gặp nhau.",
    "Rồi từ những điều rất nhỏ,\nchúng mình quyết định\nđi cùng nhau thật lâu.",
    "Và rồi, chúng mình ở đây...",
  ],

  timeline: [
    { time: "17:30", title: "Đón khách" },
    { time: "18:00", title: "Lễ thành hôn" },
    { time: "18:30", title: "Tiệc cưới" },
    { time: "21:00", title: "Nâng ly chúc mừng" },
  ] satisfies TimelineItem[],

  images: {
    hero: {
      src: "/images/wedding/hero.jpg",
      alt: "Văn Tuấn và Mai Hoa trong bộ ảnh cưới",
      width: 1600,
      height: 2000,
    },
    story: {
      src: "/images/wedding/story.jpg",
      alt: "Tuấn và Hoa nắm tay nhau",
      width: 1200,
      height: 1500,
    },
    closing: {
      src: "/images/wedding/closing.jpg",
      alt: "Tuấn và Hoa trong ánh chiều",
      width: 1800,
      height: 1200,
    },
  },

  gallery: [
    {
      src: "/images/wedding/gallery-01.jpg",
      alt: "Khoảnh khắc đầu tiên của buổi chụp",
      width: 1200,
      height: 1500,
    },
    {
      src: "/images/wedding/gallery-02.jpg",
      alt: "Bó hoa cưới trên nền vải lụa",
      width: 1200,
      height: 1200,
    },
    {
      src: "/images/wedding/gallery-03.jpg",
      alt: "Nụ cười của cô dâu",
      width: 1200,
      height: 1200,
    },
    {
      src: "/images/wedding/gallery-04.jpg",
      alt: "Chân dung hai người bên khung cửa",
      width: 1200,
      height: 1600,
    },
    {
      src: "/images/wedding/gallery-05.jpg",
      alt: "Cùng nhau đi trên con đường nhỏ",
      width: 1600,
      height: 1067,
    },
    {
      src: "/images/wedding/gallery-06.jpg",
      alt: "Ảnh cưới toàn cảnh",
      width: 2000,
      height: 1000,
    },
  ] satisfies GalleryImage[],

  music: {
    /** File nhạc trong public/audio. Nếu file lỗi hoặc thiếu, nút nhạc sẽ tự ẩn. */
    src: "/audio/mot-doi.mp3",
    title: "Một Đời",
    /** Bật nhạc khi khách bấm "MỞ THIỆP" (đây là user gesture nên trình duyệt cho phép). */
    startOnOpen: true,
    volume: 0.35,
  },

  nav: [
    { label: "Chuyện chúng mình", id: "our-story" },
    { label: "Ngày cưới", id: "the-wedding" },
    { label: "Ảnh cưới", id: "gallery" },
    { label: "Xác nhận", id: "rsvp" },
  ],

  /**
   * Toàn bộ chữ hiển thị trên trang.
   * Các nhãn nhỏ (eyebrow, label, nút) được CSS tự viết hoa, nên ở đây cứ ghi thường.
   */
  copy: {
    hero: {
      tagline: "Chúng mình sẽ kết hôn",
      openButton: "Mở thiệp",
    },
    story: {
      eyebrow: "Chương một",
      title: "Chuyện chúng mình",
      caption: "Năm 2026",
    },
    details: {
      eyebrow: "Lưu lại ngày này",
      title: "Ngày cưới",
      venueLabel: "Địa điểm",
      mapsLabel: "Xem bản đồ",
    },
    countdown: {
      eyebrow: "Đếm ngược",
      units: {
        days: "Ngày",
        hours: "Giờ",
        minutes: "Phút",
        seconds: "Giây",
      },
      finished: "Hôm nay là ngày ấy",
    },
    timeline: {
      eyebrow: "Chương trình",
      title: "Ngày vui",
    },
    gallery: {
      eyebrow: "Khoảnh khắc",
      title: "Ảnh cưới",
      hint: "Chạm vào ảnh để xem lớn · vuốt để chuyển ảnh",
    },
    rsvp: {
      title: "RẤT MONG\nĐƯỢC GẶP BẠN",
      submitLabel: "Xác nhận",
      successTitle: "Cảm ơn bạn ♡",
      successBody:
        "Sự hiện diện của bạn\nlà món quà tuyệt vời\nđối với chúng mình.",
    },
    closing: {
      eyebrow: "Thương mến",
      thanks: "Cảm ơn bạn đã là một phần\ntrong câu chuyện của chúng mình.",
    },
  },

  site: {
    url: "https://wedding-tuan-hoa.vercel.app",
    title: "Tuấn & Hoa · 20.09.2026",
    description:
      "Văn Tuấn & Mai Hoa — chúng mình sẽ kết hôn ngày 20 tháng 09 năm 2026. Rất mong được đón bạn trong ngày hạnh phúc.",
  },
} as const;

export const coupleShort = `${wedding.groom.short} & ${wedding.bride.short}`;
