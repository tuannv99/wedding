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

export type AlbumPhoto = {
  src: string;
  alt: string;
};

export type AlbumChapter = {
  /** Dùng làm anchor (#chapter-<id>) và làm thư mục ảnh. */
  id: string;
  title: string;
  /**
   * Ảnh NGANG tràn viền mở đầu chapter — trang trí, KHÔNG nằm trong lightbox
   * (nhờ vậy bộ đếm lightbox chỉ đếm đúng số ảnh thật của album).
   * Bỏ trống nếu buổi chụp đó không có khung ảnh ngang nào.
   */
  cover?: string;
  photos: AlbumPhoto[];
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
      name: "Xuân Phương, Ninh Bình",
      address: "Nhà Văn Hóa Xóm 2, Xã Xuân Phương",
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Nhà văn hóa xóm 2, xã Xuân Phương, Ninh Bình")}`,
      // "Nhà văn hóa xóm 2, xã Xuân Phương, Ninh Bình" (query có dấu → base64url sau !1z)
      mapEmbedUrl:
        "https://www.google.com/maps/embed?origin=mfe&pb=!1m2!2m1!1zTmjDoCB2xINuIGjDs2EgeMOzbSAyLCB4w6MgWHXDom4gUGjGsMahbmcsIE5pbmggQsOsbmg",
    },
    groom: {
      label: "Nhà trai",
      name: "Quỳnh Phụ, Hưng Yên",
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
        src: "/images/wedding/home-story-01.jpg",
        alt: "Tuấn và Hoa nắm tay bước trên lối vườn",
        width: 1200,
        height: 1800,
      },
    },
    {
      text: "Rồi từ những điều rất nhỏ,\nchúng mình quyết định\nđi cùng nhau thật lâu.",
      image: {
        src: "/images/wedding/home-story-02.jpg",
        alt: "Tuấn quỳ gối trao hoa cho Hoa giữa vườn",
        width: 1200,
        height: 1800,
      },
    },
    {
      text: "Và rồi,\nchúng mình",
      emphasis: "ở đây...",
      image: {
        src: "/images/wedding/home-story-03.jpg",
        alt: "Tuấn và Hoa cùng cầm tấm thiệp cưới trong studio",
        width: 1200,
        height: 1800,
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
      src: "/images/wedding/home-hero.jpg",
      alt: "Tuấn và Hoa nắm tay trước mái vòm, Hoa giơ cao bó hoa cưới",
      width: 1200,
      height: 1800,
    },
    closing: {
      src: "/images/wedding/home-closing.jpg",
      alt: "Hoa trong tà voan dài bên vòm đá, Tuấn đứng phía sau",
      width: 2200,
      height: 1467,
    },
  },

  gallery: [
    {
      src: "/images/wedding/home-gallery-01.jpg",
      alt: "Tuấn và Hoa trên lối đi giữa hàng cây bên đài phun nước",
      width: 1200,
      height: 1800,
    },
    {
      src: "/images/wedding/home-gallery-02.jpg",
      alt: "Tuấn và Hoa trong tà áo dài truyền thống",
      width: 1200,
      height: 1800,
    },
    {
      src: "/images/wedding/home-gallery-03.jpg",
      alt: "Tuấn và Hoa trong studio nền sáng",
      width: 1200,
      height: 1800,
    },
    {
      src: "/images/wedding/home-gallery-04.jpg",
      alt: "Tuấn và Hoa nắm tay bên bồn nước đá",
      width: 1200,
      height: 1800,
    },
    {
      src: "/images/wedding/home-gallery-05.jpg",
      alt: "Tuấn và Hoa bước về phía nhau trong vườn",
      width: 2200,
      height: 1467,
    },
    {
      src: "/images/wedding/home-gallery-06.jpg",
      alt: "Tuấn và Hoa giơ cao tấm thiệp cưới",
      width: 1200,
      height: 1800,
    },
  ] satisfies GalleryImage[],

  /**
   * Album ảnh cưới đầy đủ (trang /album), chia theo buổi chụp.
   *
   * Ảnh nằm ở public/images/album/<chapter-id>/NN.jpg, được nén sẵn từ bộ ảnh
   * gốc trong public/images/anh_cuoi/ (xem scripts/build-album-images.mjs).
   * Bản gốc ~332MB nên KHÔNG commit — .gitignore đã loại thư mục đó ra.
   *
   * `cover` chỉ có ở chapter nào thật sự có khung ảnh NGANG: cả bộ chỉ có 6
   * khung ngang và đều thuộc buổi ngoại cảnh, nên Studio và Áo dài không có
   * dải ảnh tràn viền mở đầu.
   */
  album: {
    /** Hai ảnh dọc lệch tầng ở nửa phải hero. */
    hero: [
      { src: "/images/album/hero-01.jpg", alt: "Tuấn và Hoa dưới mái vòm, tà voan bay trong gió" },
      { src: "/images/album/hero-02.jpg", alt: "Tuấn và Hoa trao nhau chiếc nhẫn trong studio" },
    ] satisfies AlbumPhoto[],

    /** Ảnh ngang khép lại cả album, đặt ngay trước footer. */
    closing: {
      src: "/images/album/closing.jpg",
      alt: "Tuấn và Hoa trên bậc thềm đá giữa vườn cây",
    } satisfies AlbumPhoto,

    chapters: [
      {
        id: "santori",
        title: "Santori",
        cover: "/images/album/santori/cover.jpg",
        photos: [
          { src: "/images/album/santori/01.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 01" },
          { src: "/images/album/santori/02.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 02" },
          { src: "/images/album/santori/03.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 03" },
          { src: "/images/album/santori/04.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 04" },
          { src: "/images/album/santori/05.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 05" },
          { src: "/images/album/santori/06.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 06" },
          { src: "/images/album/santori/07.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 07" },
          { src: "/images/album/santori/08.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 08" },
          { src: "/images/album/santori/09.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 09" },
          { src: "/images/album/santori/10.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 10" },
          { src: "/images/album/santori/11.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 11" },
          { src: "/images/album/santori/12.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 12" },
          { src: "/images/album/santori/13.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 13" },
          { src: "/images/album/santori/14.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 14" },
          { src: "/images/album/santori/15.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 15" },
          { src: "/images/album/santori/16.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 16" },
          { src: "/images/album/santori/17.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 17" },
          { src: "/images/album/santori/18.jpg", alt: "Tuấn và Hoa chụp ngoại cảnh sân vườn — 18" },
        ],
      },
      {
        id: "studio",
        title: "Studio",
        photos: [
          { src: "/images/album/studio/01.jpg", alt: "Tuấn và Hoa chụp trong studio — 01" },
          { src: "/images/album/studio/02.jpg", alt: "Tuấn và Hoa chụp trong studio — 02" },
          { src: "/images/album/studio/03.jpg", alt: "Tuấn và Hoa chụp trong studio — 03" },
          { src: "/images/album/studio/04.jpg", alt: "Tuấn và Hoa chụp trong studio — 04" },
          { src: "/images/album/studio/05.jpg", alt: "Tuấn và Hoa chụp trong studio — 05" },
          { src: "/images/album/studio/06.jpg", alt: "Tuấn và Hoa chụp trong studio — 06" },
          { src: "/images/album/studio/07.jpg", alt: "Tuấn và Hoa chụp trong studio — 07" },
          { src: "/images/album/studio/08.jpg", alt: "Tuấn và Hoa chụp trong studio — 08" },
          { src: "/images/album/studio/09.jpg", alt: "Tuấn và Hoa chụp trong studio — 09" },
          { src: "/images/album/studio/10.jpg", alt: "Tuấn và Hoa chụp trong studio — 10" },
          { src: "/images/album/studio/11.jpg", alt: "Tuấn và Hoa chụp trong studio — 11" },
          { src: "/images/album/studio/12.jpg", alt: "Tuấn và Hoa chụp trong studio — 12" },
        ],
      },
      {
        id: "ao-dai",
        title: "Áo dài",
        photos: [
          { src: "/images/album/ao-dai/01.jpg", alt: "Tuấn và Hoa trong tà áo dài — 01" },
          { src: "/images/album/ao-dai/02.jpg", alt: "Tuấn và Hoa trong tà áo dài — 02" },
          { src: "/images/album/ao-dai/03.jpg", alt: "Tuấn và Hoa trong tà áo dài — 03" },
        ],
      },
    ] satisfies AlbumChapter[],
  },

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
    // Mục có `id`: cuộn trong cùng trang. Mục có `href`: chuyển hẳn sang
    // trang khác (Navigation.tsx render Link thay vì nút cuộn).
    { label: "Trang chủ", id: "hero" },
    { label: "Chuyện chúng mình", id: "our-story" },
    { label: "Lễ cưới", id: "the-wedding" },
    { label: "Ảnh cưới", id: "gallery" },
    { label: "Album", href: "/album" },
    { label: "Xác nhận", id: "rsvp" },
    { label: "Những lời yêu thương", href: "/wishes" },
  ],

  /**
   * Toàn bộ chữ hiển thị trên trang.
   * Các nhãn nhỏ (eyebrow, label, nút) được CSS tự viết hoa, nên ở đây cứ ghi thường.
   */
  copy: {
    hero: {
      tagline: "Chúng mình sắp cưới",
      openButton: "Mở thiệp",
    },
    story: {
      title: "Chuyện chúng mình",
    },
    details: {
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
    },
    rsvp: {
      title: "RẤT MONG\nĐƯỢC GẶP BẠN",
      submitLabel: "Gửi lời chúc",
      successTitle: "Cảm ơn bạn ♡",
      successBody:
        "Sự hiện diện của bạn là món quà tuyệt vời đối với chúng mình.",
    },
    closing: {
      eyebrow: "Thương mến",
      thanks: "Cảm ơn đã là một phần trong câu chuyện của chúng mình",
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
