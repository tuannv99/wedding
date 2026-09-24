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

/**
 * Một câu chen giữa dòng ảnh của /album.
 *
 * Không phải tiêu đề chương: nó không đặt tên cho đoạn ảnh đứng sau nó, chỉ
 * là một câu người nhà nói chen vào giữa lúc lật ảnh.
 */
export type AlbumInterlude = {
  /** Số thứ tự (1–35) của ảnh dọc mà câu này đứng ngay sau. */
  after: number;
  /** "quote" = in nghiêng, cỡ lớn; "note" = giọng kể bình thường. */
  tone: "quote" | "note";
  /** Dùng \n để tự ngắt dòng — chỉ được tôn trọng từ sm trở lên. */
  text: string;
};

export type TimelineItem = {
  time: string;
  title: string;
};

export type TimelineSchedule = {
  /** Dùng làm React key + để tab nhớ đang chọn nghi lễ nào. */
  id: string;
  /** Nhãn trên tab, ví dụ "Lễ Vu Quy". */
  label: string;
  /** Nhà tổ chức nghi lễ này, ví dụ "Nhà gái". */
  venue: string;
  items: TimelineItem[];
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
    // TODO: thay bằng SĐT thật của chú rể — hiện tạm dùng chung một số với cô dâu.
    phone: "0973002464",
    portrait: {
      src: "/images/wedding/chu_re_1.jpg",
      alt: "Chú rể Văn Tuấn chỉnh lại cà vạt trong bộ vest cưới",
      width: 933,
      height: 1400,
    },
  },
  bride: {
    name: "Mai Hoa",
    short: "HOA",
    // TODO: thay bằng SĐT thật của cô dâu — hiện tạm dùng chung một số với chú rể.
    phone: "0973002464",
    portrait: {
      src: "/images/wedding/co_dau.jpg",
      alt: "Cô dâu Mai Hoa trong váy cưới",
      width: 1365,
      height: 2048,
    },
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
    /** Các ngày được khoanh trái tim trên lịch cưới (WeddingCalendar). */
    highlightDays: ["24", "25"],
  },

  ceremony: {
    label: "Lễ thành hôn",
    time: "11:00",
  },
  reception: {
    label: "Tiệc cưới",
    time: "12:00",
  },

  /** Cách lấy mapsUrl cho địa điểm mới: mở Google Maps → Chia sẻ → Sao chép liên kết. */
  venues: {
    bride: {
      label: "Nhà gái",
      name: "Xuân Phương, Ninh Bình",
      /** \n để chủ động ngắt dòng đúng chỗ (WeddingDetails render whitespace-pre-line). */
      address: "Nhà Văn Hóa Xóm 2,\nXã Xuân Phương, tỉnh Ninh Bình",
      /** Ảnh đứng cạnh khối thông tin tiệc (WeddingDetails). */
      photo: {
        src: "/images/album/studio/06.jpg",
        alt: "Tuấn và Hoa trong studio",
      },
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Nhà văn hóa xóm 2, xã Xuân Phương, Ninh Bình")}`,
      // "Nhà văn hóa xóm 2, xã Xuân Phương, Ninh Bình" (query có dấu → base64url sau !1z)
    },
    groom: {
      label: "Nhà trai",
      name: "Quỳnh Phụ, Hưng Yên",
      /** \n để chủ động ngắt dòng đúng chỗ (WeddingDetails render whitespace-pre-line). */
      address: "Xóm 3 Thôn Phụng Công,\nXã Quỳnh Phụ, tỉnh Hưng Yên",
      /** Ảnh đứng cạnh khối thông tin tiệc (WeddingDetails). */
      photo: {
        src: "/images/album/santori/09.jpg",
        alt: "Tuấn và Hoa bên mái vòm trong vườn",
      },
      // Link thật do gia đình cung cấp, trỏ đúng "Miếu Hạ thôn Phụng Công".
      mapsUrl: "https://maps.app.goo.gl/WHHnQKhEMhDPR1kV7",
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

  /**
   * Chương trình gồm 2 nghi lễ riêng — Timeline.tsx hiển thị dạng tab, mặc
   * định chọn mục đầu tiên (Lễ Vu Quy).
   */
  timeline: [
    {
      id: "vu-quy",
      label: "Lễ Vu Quy",
      venue: "Tại Tư Gia Nhà Gái",
      items: [
        { time: "10:30", title: "Đón khách" },
        { time: "11:00", title: "Lễ Vu Quy" },
        { time: "11:30", title: "Tiệc thân mật" },
      ],
    },
    {
      id: "thanh-hon",
      label: "Lễ Thành Hôn",
      venue: "Tại Tư Gia Nhà Trai",
      items: [
        { time: "10:45", title: "Đón khách" },
        { time: "11:00", title: "Lễ Thành Hôn" },
        { time: "12:00", title: "Tiệc cưới" },
        { time: "12:10", title: "Nâng ly chúc mừng" },
      ],
    },
  ] satisfies TimelineSchedule[],

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
   * Album ảnh cưới đầy đủ (trang /album) — MỘT dòng ảnh liên tục, không chia
   * chương.
   *
   * Trước đây bộ ảnh được gom thành ba "chương" (Santori / Studio / Áo dài) vì
   * trang cũ là một cuốn photobook lật được. Trang mới kể thẳng một mạch từ
   * đầu đến cuối, nên dữ liệu cũng phẳng theo: `photos` là đúng thứ tự người
   * xem sẽ gặp, không có cấp trung gian nào nữa. Vẫn là đúng bộ ảnh đó, chỉ
   * khác cách xếp.
   *
   * Ảnh nằm ở public/images/album/..., được nén sẵn từ bộ ảnh gốc trong
   * public/images/anh_cuoi/ (xem scripts/build-album-images.mjs). Bản gốc
   * ~332MB nên KHÔNG commit — .gitignore đã loại thư mục đó ra.
   *
   * Cả bộ có 37 file: 35 ảnh DỌC (2:3, 1200×1800) và đúng 2 ảnh NGANG (3:2,
   * 2200×1467) là `cover` và `closing`. Hai tấm ngang đó là của hiếm nên được
   * dành riêng cho hai đầu câu chuyện — mở ra và khép lại — chứ không trộn
   * vào dòng ảnh dọc ở giữa.
   */
  album: {
    /** Chữ mở đầu. */
    opening: {
      eyebrow: "Our story",
      title: "Những ngày chúng mình\nđi chụp ảnh cưới.",
      intro:
        "Cả bộ có 37 tấm, xếp đúng theo thứ tự lúc chụp. Bấm vào một tấm bất kỳ ở phần tổng thể bên dưới để nhảy thẳng tới tấm đó.",
    },

    /** Ảnh NGANG mở đầu — dùng làm hero, không cắt. */
    cover: {
      src: "/images/album/santori/cover.jpg",
      alt: "Tuấn và Hoa nắm tay nhau giữa sân vườn Santori Yên Sở",
    } satisfies AlbumPhoto,

    /** Phần xem tổng thể đặt ngay sau hero. */
    overview: {
      eyebrow: "Our story",
      title: "37 khoảnh khắc",
      hint: "Bấm vào một tấm để tới đúng chỗ của nó",
    },

    /**
     * 35 ảnh DỌC, đúng thứ tự kể chuyện: một tấm mở màn ngoài trời, cả buổi
     * ngoại cảnh ở Santori, một tấm mở màn trong studio, cả buổi studio, rồi
     * ba tấm áo dài cuối ngày.
     *
     * Thứ tự này là thứ tự thật của ngày chụp, nên ai cuộn hết một lượt sẽ đi
     * đúng hành trình của hai đứa — nhưng trang không hề nói ra điều đó thành
     * tên chương, vì người xem không cần biết tên buổi chụp để xem ảnh.
     */
    photos: [
      { src: "/images/album/hero-01.jpg", alt: "Tuấn và Hoa dưới mái vòm, tà voan bay trong gió" },
      { src: "/images/album/santori/01.jpg", alt: "Tuấn và Hoa giữa sân vườn — 01" },
      { src: "/images/album/santori/02.jpg", alt: "Tuấn và Hoa giữa sân vườn — 02" },
      { src: "/images/album/santori/03.jpg", alt: "Tuấn và Hoa giữa sân vườn — 03" },
      { src: "/images/album/santori/04.jpg", alt: "Tuấn và Hoa giữa sân vườn — 04" },
      { src: "/images/album/santori/05.jpg", alt: "Tuấn và Hoa giữa sân vườn — 05" },
      { src: "/images/album/santori/06.jpg", alt: "Tuấn và Hoa giữa sân vườn — 06" },
      { src: "/images/album/santori/07.jpg", alt: "Tuấn và Hoa giữa sân vườn — 07" },
      { src: "/images/album/santori/08.jpg", alt: "Tuấn và Hoa giữa sân vườn — 08" },
      { src: "/images/album/santori/09.jpg", alt: "Tuấn và Hoa giữa sân vườn — 09" },
      { src: "/images/album/santori/10.jpg", alt: "Tuấn và Hoa giữa sân vườn — 10" },
      { src: "/images/album/santori/11.jpg", alt: "Tuấn và Hoa giữa sân vườn — 11" },
      { src: "/images/album/santori/12.jpg", alt: "Tuấn và Hoa giữa sân vườn — 12" },
      { src: "/images/album/santori/13.jpg", alt: "Tuấn và Hoa giữa sân vườn — 13" },
      { src: "/images/album/santori/14.jpg", alt: "Tuấn và Hoa giữa sân vườn — 14" },
      { src: "/images/album/santori/15.jpg", alt: "Tuấn và Hoa giữa sân vườn — 15" },
      { src: "/images/album/santori/16.jpg", alt: "Tuấn và Hoa giữa sân vườn — 16" },
      { src: "/images/album/santori/17.jpg", alt: "Tuấn và Hoa giữa sân vườn — 17" },
      { src: "/images/album/santori/18.jpg", alt: "Tuấn và Hoa giữa sân vườn — 18" },
      { src: "/images/album/hero-02.jpg", alt: "Tuấn và Hoa trao nhau chiếc nhẫn trong studio" },
      { src: "/images/album/studio/01.jpg", alt: "Tuấn và Hoa trong studio — 01" },
      { src: "/images/album/studio/02.jpg", alt: "Tuấn và Hoa trong studio — 02" },
      { src: "/images/album/studio/03.jpg", alt: "Tuấn và Hoa trong studio — 03" },
      { src: "/images/album/studio/04.jpg", alt: "Tuấn và Hoa trong studio — 04" },
      { src: "/images/album/studio/05.jpg", alt: "Tuấn và Hoa trong studio — 05" },
      { src: "/images/album/studio/06.jpg", alt: "Tuấn và Hoa trong studio — 06" },
      { src: "/images/album/studio/07.jpg", alt: "Tuấn và Hoa trong studio — 07" },
      { src: "/images/album/studio/08.jpg", alt: "Tuấn và Hoa trong studio — 08" },
      { src: "/images/album/studio/09.jpg", alt: "Tuấn và Hoa trong studio — 09" },
      { src: "/images/album/studio/10.jpg", alt: "Tuấn và Hoa trong studio — 10" },
      { src: "/images/album/studio/11.jpg", alt: "Tuấn và Hoa trong studio — 11" },
      { src: "/images/album/studio/12.jpg", alt: "Tuấn và Hoa trong studio — 12" },
      { src: "/images/album/ao-dai/01.jpg", alt: "Tuấn và Hoa trong tà áo dài — 01" },
      { src: "/images/album/ao-dai/02.jpg", alt: "Tuấn và Hoa trong tà áo dài — 02" },
      { src: "/images/album/ao-dai/03.jpg", alt: "Tuấn và Hoa trong tà áo dài — 03" },
    ] satisfies AlbumPhoto[],

    /**
     * Mấy câu chen giữa dòng ảnh — giọng nói thật của hai đứa, không phải
     * tiêu đề chương.
     *
     * `after` là số thứ tự (1–35) của ảnh DỌC mà câu này đứng ngay sau. Bốn
     * mốc dưới đây đều rơi đúng vào ranh giới giữa hai khối ảnh trong
     * story-plan.ts — nếu đổi số ở đây thì phải đổi nhịp bên đó cho khớp,
     * buildStory() sẽ ném lỗi ngay lúc build nếu hai bên lệch nhau.
     *
     * `tone: "quote"` in nghiêng, cỡ lớn hơn, dùng cho câu mang tính cảm thán;
     * `"note"` là giọng kể bình thường.
     */
    interludes: [
      { after: 4, tone: "note", text: "Trộm vía hôm chụp trời khá đẹp và mát,\nnên hai đứa cũng có một ngày khá dễ chịu." },
      { after: 13, tone: "quote", text: "Chúng mình cứ thế đi cùng nhau." },
      { after: 19, tone: "note", text: "Chụp ngoài trời xong thì cả hai về studio.\nLúc đấy cũng bắt đầu mệt rồi, nên hơi ít ảnh một chút." },
      { after: 32, tone: "note", text: "Lúc chụp áo dài thì mệt lắm rồi,\nnên chỉ có vài tấm này thôi." },
    ] satisfies AlbumInterlude[],

    /** Ảnh NGANG khép lại — tấm cuối cùng người xem nhìn thấy. */
    closing: {
      src: "/images/album/closing.jpg",
      alt: "Tuấn và Hoa trên bậc thềm đá giữa vườn cây",
    } satisfies AlbumPhoto,

    /** Chữ khép lại. */
    ending: {
      lead: "Ảnh hết rồi.",
      body: "Cảm ơn các bạn đã xem hết\nnhững khoảnh khắc của chúng mình.",
    },
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
    /*
      Tiêu đề mỗi section đi theo một khuôn duy nhất: một dòng nhỏ (eyebrow)
      đặt trên, một dòng chữ to đặt dưới — đúng kiểu "Chương trình / Ngày vui"
      của mục timeline. Chữ to giữ nguyên từ khoá cũ của từng mục nên không
      mục nào trùng chữ to với mục nào; eyebrow là dòng thêm mới.
    */
    story: {
      eyebrow: "Chuyện",
      title: "Chúng mình",
    },
    details: {
      eyebrow: "Lời hẹn",
      title: "Ngày cưới",
      venueEyebrow: "Địa điểm",
      venueLabel: "Tổ chức",
      /** Tiền tố cho tiêu đề mỗi khối tiệc: "{partyLabel} {venues.*.label}" → "Tiệc Nhà Trai". */
      partyLabel: "Tiệc",
      atLabel: "Tổ chức vào lúc",
      /** Tiền tố dòng địa chỉ: "{atHome} {venues.*.label}" → "Tại tư gia Nhà trai". */
      atHome: "Tại tư gia",
      mapsLabel: "Bản đồ",
      contactLabel: "Liên hệ",
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
      moreLabel: "Xem thêm ảnh chúng mình",
    },
    rsvp: {
      eyebrow: "Rất mong",
      title: "Được gặp bạn",
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
    url: "https://tuanhoa-wedding-invatation.vercel.app",
    title: "Tuấn & Hoa · 25.10.2026",
    description:
      "Văn Tuấn & Mai Hoa — chúng mình sẽ kết hôn ngày 25 tháng 10 năm 2026. Rất mong được đón bạn trong ngày hạnh phúc.",
  },
} as const;

export const coupleShort = `${wedding.groom.short} & ${wedding.bride.short}`;
