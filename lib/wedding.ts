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

export type StoryStep = {
  /** Phần chữ chính. Dùng \n để tự ngắt dòng theo ý muốn. */
  text: string;
  /** Phần chữ nhấn ở cuối (in nghiêng, màu taupe). Có thể bỏ trống. */
  emphasis?: string;
  image: GalleryImage;
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

  /** Ngày cưới: 25/10/2026 (giờ Việt Nam, UTC+7). */
  date: {
    iso: "2026-10-25",
    /** Mốc countdown = giờ lễ thành hôn. */
    target: "2026-10-25T11:00:00+07:00",
    day: "25",
    month: "10",
    year: "2026",
    weekday: "Chủ Nhật",
    display: "25 · 10 · 2026",
  },

  ceremony: {
    label: "Lễ thành hôn",
    time: "11:00",
  },
  reception: {
    label: "Tiệc cưới",
    time: "12:00",
  },

  /**
   * mapEmbedUrl phải là URL /maps/embed?pb=… (URL cuối của Google).
   *
   * KHÔNG dùng dạng `maps?q=…&output=embed`: nó trả 301 và chặng redirect đó mang
   * header `X-Frame-Options: SAMEORIGIN`, nên Chrome trên Android hay từ chối
   * hiển thị iframe ("không khả dụng"). Dùng thẳng URL cuối thì chỉ còn 1 hop 200
   * và không có X-Frame-Options.
   *
   * Cách lấy URL cho địa điểm mới: mở Google Maps → Chia sẻ → Nhúng bản đồ →
   * copy phần src trong đoạn <iframe>. Hoặc chạy:
   *   curl -sI "https://www.google.com/maps?q=<địa+chỉ>&output=embed" | grep -i location
   * rồi lấy đúng URL trong header Location.
   */
  venues: {
    bride: {
      label: "Nhà gái",
      name: "Xuân Phương  ,Ninh Bình",
      address: "Nhà Văn Hóa Xóm 2, Xã Xuân Phương",
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Nhà văn hóa xóm 2, xã Xuân Phương, Ninh Bình")}`,
      // "Nhà văn hóa xóm 2, xã Xuân Phương, Ninh Bình" (query có dấu → base64url sau !1z)
      mapEmbedUrl:
        "https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1zTmjDoCB2xINuIGjDs2EgeMOzbSAyLCB4w6MgWHXDom4gUGjGsMahbmcsIE5pbmggQsOsbmg",
    },
    groom: {
      label: "Nhà trai",
      name: "Quỳnh Phụ  ,Hưng Yên",
      address: "Xóm 3 Thôn Phụng Công, Xã Quỳnh Phụ",
      // Link thật do gia đình cung cấp, trỏ đúng "Miếu Hạ thôn Phụng Công".
      mapsUrl: "https://maps.app.goo.gl/WHHnQKhEMhDPR1kV7",
      mapEmbedUrl:
        "https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1s20.6540299,106.3614893",
    },
  },

  /** Mỗi mốc trong câu chuyện đi kèm một ảnh riêng, bố trí so le trái/phải. */
  story: [
    {
      text: "Một ngày bình thường,\nchúng mình gặp nhau.",
      image: {
        src: "/images/wedding/story-01.jpg",
        alt: "Tuấn và Hoa trong lần chụp ảnh cưới đầu tiên",
        width: 1200,
        height: 1500,
      },
    },
    {
      text: "Rồi từ những điều rất nhỏ,\nchúng mình quyết định\nđi cùng nhau thật lâu.",
      image: {
        src: "/images/wedding/story-02.jpg",
        alt: "Tuấn bế Hoa trong sân vườn",
        width: 1200,
        height: 1500,
      },
    },
    {
      text: "Và rồi,\nchúng mình",
      emphasis: "ở đây...",
      image: {
        src: "/images/wedding/story-03.jpg",
        alt: "Tuấn và Hoa nắm tay nhau bước đi",
        width: 1200,
        height: 1500,
      },
    },
  ] satisfies StoryStep[],

  timeline: [
    { time: "10:45", title: "Đón khách" },
    { time: "11:00", title: "Lễ thành hôn" },
    { time: "12:00", title: "Tiệc cưới" },
    { time: "12:10", title: "Nâng ly chúc mừng" },
  ] satisfies TimelineItem[],

  images: {
    hero: {
      src: "/images/wedding/hero.jpg",
      alt: "Văn Tuấn và Mai Hoa trong bộ ảnh cưới",
      width: 1500,
      height: 1900,
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
      height: 1500,
    },
    {
      src: "/images/wedding/gallery-03.jpg",
      alt: "Nụ cười của cô dâu",
      width: 1200,
      height: 1500,
    },
    {
      src: "/images/wedding/gallery-04.jpg",
      alt: "Chân dung hai người bên khung cửa",
      width: 1200,
      height: 1500,
    },
    {
      src: "/images/wedding/gallery-05.jpg",
      alt: "Cùng nhau đi trên con đường nhỏ",
      width: 1200,
      height: 1500,
    },
    {
      src: "/images/wedding/gallery-06.jpg",
      alt: "Ảnh cưới toàn cảnh",
      width: 1200,
      height: 1500,
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
    // "hero" là mục đầu, đúng như HOME trên bản design.
    { label: "Trang chủ", id: "hero" },
    { label: "Chuyện chúng mình", id: "our-story" },
    { label: "Lễ cưới", id: "the-wedding" },
    { label: "Ảnh cưới", id: "gallery" },
    { label: "Xác nhận", id: "rsvp" },
  ],

  /**
   * Toàn bộ chữ hiển thị trên trang.
   * Các nhãn nhỏ (eyebrow, label, nút) được CSS tự viết hoa, nên ở đây cứ ghi thường.
   */
  copy: {
    /**
     * Các dòng chữ viết tay (font script) trên bản design.
     * Cố tình để tiếng Anh, không dấu: font script Parisienne không có subset
     * vietnamese, chữ có dấu sẽ rơi về font hệ thống và vỡ kiểu chữ.
     */
    script: {
      story: "Our",
      details: "Save the date",
      closing: "Thank you for\nbeing part of our story.",
    },
    hero: {
      tagline: "Chúng mình sắp cưới",
      openButton: "Mở thiệp",
    },
    story: {
      title: "Chuyện chúng mình",
    },
    details: {
      eyebrow: "Lưu lại ngày này",
      title: "Ngày cưới",
      /** Dải thông tin nhanh 4 cột (ngày · lễ · tiệc · địa điểm). */
      facts: {
        date: "Ngày",
        ceremony: "Lễ thành hôn",
        reception: "Tiệc cưới",
        venue: "Địa điểm",
      },
      venueLabel: "Địa điểm tổ chức",
      mapsLabel: "Xem bản đồ",
      calendarLabel: "Lưu ngày cưới",
    },
    countdown: {
      eyebrow: "Chúng mình còn",
      units: {
        days: "Ngày",
        hours: "Giờ",
        minutes: "Phút",
        seconds: "Giây",
      },
      untilLabel: "Đến ngày hạnh phúc",
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
    title: "Tuấn & Hoa · 25.10.2026",
    description:
      "Văn Tuấn & Mai Hoa — chúng mình sẽ kết hôn ngày 25 tháng 10 năm 2026. Rất mong được đón bạn trong ngày hạnh phúc.",
  },
} as const;

export const coupleShort = `${wedding.groom.short} & ${wedding.bride.short}`;
